Param(
    [parameter(Mandatory=$false)][string]$registry,
    [parameter(Mandatory=$false)][string]$dockerUser="freyeslefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="NetEb9221",
    [parameter(Mandatory=$false)][string]$externalDns,
    [parameter(Mandatory=$false)][string]$appName="elefebvre",
    [parameter(Mandatory=$false)][bool]$clean=$true,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$true,
    [parameter(Mandatory=$false)][string[]]$infras=(
        "rabbitmq",
        # "consul","vault",
        "nosql-data",
        "sql-data"
        ),
    [parameter(Mandatory=$false)][bool]$deployCharts=$true,
    [parameter(Mandatory=$false)][bool]$deployClients=$true,
    [parameter(Mandatory=$false)][bool]$deployServices=$true,
    [parameter(Mandatory=$false)][bool]$deployGateways=$true,
    [parameter(Mandatory=$false)][string[]]$clients=(
        # "websignature",  
        "webcentinela", "webgoogle", "webgraph", "weblexon", "webportal", "webimap","websignature",
        "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela" 
        # "webdatabase"
        ),
    [parameter(Mandatory=$false)][string[]]$services=(
        # "lexon-api",  
        "account-api", "centinela-api", "conference-api", "lexon-api", "signature-api", "userutils-api",  
        # "database-api", 
        "webimapserver", 
        "webstatus"
        ),
    [parameter(Mandatory=$false)][string[]]$gateways=(
        "apigwlex", 
        "apigwacc",
        "apigwcen",
        "apigwsig"
        # "apigwdat" 
        ),
    [parameter(Mandatory=$false)][string]$aksName="",
    [parameter(Mandatory=$false)][bool]$useLocalImages=$false,
    [parameter(Mandatory=$false)][string]$aksRg="",
    [parameter(Mandatory=$false)][string]$imageTag="latest",
    [parameter(Mandatory=$false)][bool]$useLocalk8s=$false,
    [parameter(Mandatory=$false)][bool]$useMesh=$false,
    [parameter(Mandatory=$false)][string][ValidateSet('Always','IfNotPresent','Never', IgnoreCase=$false)]$imagePullPolicy="Always",
    [parameter(Mandatory=$false)][string][ValidateSet('prod','staging','none','custom', IgnoreCase=$false)]$sslSupport = "none",
    [parameter(Mandatory=$false)][string]$tlsSecretName = "elef-tls-custom",
    [parameter(Mandatory=$false)][string]$ingressMeshAnnotationsFile="ingress_values_linkerd.yaml"
    )

function Install-Chart  {
    Param([string]$chart,[string]$initialOptions, [bool]$customRegistry)
    $options=$initialOptions
    if ($sslEnabled) {
        $options = "$options --set ingress.tls[0].secretName=$tlsSecretName --set ingress.tls[0].hosts={$dns}" 
        if ($sslSupport -ne "custom") {
            $options = "$options --set inf.tls.issuer=$sslIssuer"
        }
    }
    if ($customRegistry) {
        $options = "$options --set inf.registry.server=$registry --set inf.registry.login=$dockerUser --set inf.registry.pwd=$dockerPassword --set inf.registry.secretName=eshop-docker-scret"
    }
    
    if ($chart -ne "eshop-common" -or $customRegistry)  {       # eshop-common is ignored when no secret must be deployed        
        $command = "install $appName-$chart $options $chart"
        Write-Host "helm $command" -ForegroundColor Blue
        Invoke-Expression 'cmd /c "helm $command"'
    }
}

$dns = $externalDns
$sslEnabled=$false
$sslIssuer=""
$envYaml="dev.yaml"
$clientYaml="react_dev.yaml"

if ($sslSupport -eq "staging") {
    $envYaml="pre.yaml"
    $clientYaml="react_pre.yaml"
    $sslEnabled=$true
    $tlsSecretName="efef-letsencrypt-staging"
    $sslIssuer="letsencrypt-staging"
}
elseif ($sslSupport -eq "prod") {
    $envYaml="pro.yaml"
    $clientYaml="react_pro.yaml"
    $sslEnabled=$true
    $tlsSecretName="elef-letsencrypt-prod"
    $sslIssuer="letsencrypt-prod"
}
elseif ($sslSupport -eq "custom") {
    $sslEnabled=$true
}

if ($useLocalk8s -eq $true) {
    Write-Host "select useLocalk8s configure with  ingress_values_dockerk8s.yaml" -ForegroundColor Gray
    $ingressValuesFile="ingress_values_dockerk8s.yaml"
    $dns="localhost"
} else{
    Write-Host "select external kubernetes configure with ingress_values.yaml" -ForegroundColor Gray
    $ingressValuesFile="ingress_values.yaml"

}

Write-Host "The pullPolicy is set to $imagePullPolicy" -ForegroundColor Gray
Write-Host "Always -> nunca usa imagenes locales." -ForegroundColor Gray
Write-Host "Never-> solo usa imagenes locales y los pods será erroneos si no existen" -ForegroundColor Gray
Write-Host "IfNotPresent -> usa imagenes locales. Si no existen intentará descargarlas" -ForegroundColor Gray

$pullPolicy = $imagePullPolicy

if ($useLocalImages -eq $true) {
    Write-Host "Al usar imagenes locales Se fuerza a la pullPolicy a Never" -ForegroundColor Gray
    $pullPolicy = "Never"
}

if ($externalDns -eq "aks") {
    if  ([string]::IsNullOrEmpty($aksName) -or [string]::IsNullOrEmpty($aksRg)) {
        Write-Host "Error: When using -dns aks, MUST set -aksName and -aksRg too." -ForegroundColor Red
        exit 1
    }
    Write-Host "Getting DNS of AKS of AKS $aksName (in resource group $aksRg)..." -ForegroundColor Green
    $dns = $(az aks show -n $aksName  -g $aksRg --query addonProfiles.httpApplicationRouting.config.HTTPApplicationRoutingZoneName)
    if ([string]::IsNullOrEmpty($dns)) {
        Write-Host "Error getting DNS of AKS $aksName (in resource group $aksRg). Please ensure AKS has httpRouting enabled AND Azure CLI is logged & in version 2.0.37 or higher" -ForegroundColor Red
        exit 1
    }
    $dns = $dns -replace '[\"]'
    Write-Host "DNS base found is $dns. Will use $appName.$dns for the app!" -ForegroundColor Green
    $dns = "$appName.$dns"
}

# Initialization & check commands
if ([string]::IsNullOrEmpty($dns)) {
    Write-Host "No DNS specified. Ingress resources will be bound to public ip" -ForegroundColor Yellow
    if ($sslEnabled) {
        Write-Host "Can't bound SSL to public IP. DNS is mandatory when using TLS" -ForegroundColor Red
        exit 1
    }
}

if ($useLocalk8s -and $sslEnabled) {
    Write-Host "SSL can'be enabled on local K8s." -ForegroundColor Red
    exit 1
}

if ($clean) {
	$listOfReleases=$(helm ls --filter $appName -q) 
 
    if ([string]::IsNullOrEmpty($listOfReleases)) {
        Write-Host "<<<<<<<<<<  No previous releases found!  >>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Gray
	}else{
        Write-Host "<<<<<<<<<<  Previous releases found -> Uninstall ...  >>>>>>>>>>>>" -ForegroundColor Yellow
        helm uninstall $listOfReleases
   		Write-Host "<<<<<<<<<<  Previous releases deleted (old purge cmd) >>>>>>>>>>>>" -ForegroundColor Yellow
    }
}

$useCustomRegistry=$false

if (-not [string]::IsNullOrEmpty($registry)) {
    $useCustomRegistry=$true
    if ([string]::IsNullOrEmpty($dockerUser) -or [string]::IsNullOrEmpty($dockerPassword)) {
        Write-Host "Error: Must use -dockerUser AND -dockerPassword if specifying custom registry" -ForegroundColor Red
        exit 1
    }
}

if ($deployInfrastructure) {
    foreach ($infra in $infras) {
        Write-Host "Installing infrastructure:  $appName-$infra with app.yalm, inf.yalm, $ingressValuesFile, app.name=$appName, inf.k8s.dns=$dns" -ForegroundColor Green
        helm install "$appName-$infra" --values app.yaml --values inf.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set "ingress.hosts={$dns}" $infra     
    }
}
else {
    Write-Host "eLefebvreOnContainers infrastructure (bbdd, rabbit, ...) charts aren't installed (-deployInfras is false)" -ForegroundColor Yellow
}

if ($deployCharts) {
    Write-Host "Installing charts: services, clients and gateways  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Green

    if ($deployClients) {
        Write-Host "Installing clients  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Yellow
    
        foreach ($chart in $clients) {
            Write-Host "Installing: <<<<<<<<<<<<<<<<<<<<<< Client: $chart >>>>>>>>>>>>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            Install-Chart $chart "-f app.yaml --values inf.yaml -f $ingressValuesFile -f $ingressMeshAnnotationsFile -f $envYaml -f $clientYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.tls.enabled=$sslEnabled --set inf.mesh.enabled=$useMesh --set inf.k8s.local=$useLocalk8s --set image.tag=$imageTag " $useCustomRegistry
            Write-Host "Installed: <<<<<<<<<<<<<<<<<<<<<< Client: $chart >>>>>>>>>>>>>>>>>>>>>>>>>>>"  -ForegroundColor Green
        }
    }

    if ($deployServices) {
        Write-Host "Installing sevices  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Yellow

        foreach ($chart in $services) {
            Write-Host "Installing: <<<<<<<<<<<<<<<<<<<< Service:  $chart >>>>>>>>>>>>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            Install-Chart $chart "-f app.yaml --values inf.yaml -f $ingressValuesFile -f $ingressMeshAnnotationsFile -f $envYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.tls.enabled=$sslEnabled --set inf.mesh.enabled=$useMesh --set inf.k8s.local=$useLocalk8s --set image.tag=$imageTag " $useCustomRegistry
            Write-Host "Installed: <<<<<<<<<<<<<<<<<<<< Service: $chart >>>>>>>>>>>>>>>>>>>>>>>>>>>"  -ForegroundColor Green
        }

    }

    if ($deployGateways) {
        Write-Host "Installing gateways  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Yellow

        foreach ($chart in $gateways) {
            Write-Host "Installing: <<<<<<<<<<<<<<<< Api Gateway Chart: $chart >>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            Install-Chart $chart "-f app.yaml -f inf.yaml -f $ingressValuesFile -f $envYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.mesh.enabled=$useMesh --set inf.tls.enabled=$sslEnabled --set image.tag=$imageTag" $false
            Write-Host "Installed: <<<<<<<<<<<<<<<< Api Gateway Chart: $chart >>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            
        }
    }

}
else {
    Write-Host "eLefebvreOnContainers non-infrastructure charts aren't installed (-deployCharts is false)" -ForegroundColor Yellow
}

Write-Host "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" -ForegroundColor DarkBlue
Write-Host "<<<<<<<<<<<    helm charts installed.    >>>>>>>>>>" -ForegroundColor DarkBlue
Write-Host ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkBlue
