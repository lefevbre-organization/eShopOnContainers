Param(
    [parameter(Mandatory=$false)][string]$registry="index.docker.io",
    [parameter(Mandatory=$false)][string]$dockerUser="freyeslefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="NetEb9221",
    [parameter(Mandatory=$false)][string]$externalDns,
    [parameter(Mandatory=$false)][string]$appName="elefebvre",
    [parameter(Mandatory=$false)][bool]$clean=$true,
    [parameter(Mandatory=$false)][string][ValidateSet('All', 'AllExceptInfra', 'OnlyClients', 'OnlyInfra', 'OnlyServices', 'OnlyGateways' , IgnoreCase=$false)]$deployType="All",
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$true,
    [parameter(Mandatory=$false)][bool]$deployCharts=$true,
    [parameter(Mandatory=$false)][bool]$deployClients=$true,
    [parameter(Mandatory=$false)][bool]$deployServices=$true,
    [parameter(Mandatory=$false)][bool]$deployGateways=$true,
    [parameter(Mandatory=$false)][bool]$modeTest=$false,
    [parameter(Mandatory=$false)][bool]$modeDebug=$false,
    [parameter(Mandatory=$false)][string[]]$infras=(
        "rabbitmq", 
        "seq",
        # "consul","vault",
        # "sql-data",
        "nosql-data"
        ),
    [parameter(Mandatory=$false)][string[]]$clients=(
        # "websignature" # "webdatabase"
        "webcentinela", "webgoogle", "webgraph", "weblexon", "webportal", "webimap","websignature",
        "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela"
        ),
    [parameter(Mandatory=$false)][string[]]$services=(
        # "account-api" # "database-api",
        "account-api", "calendar-api", "centinela-api", "conference-api", "lexon-api", "signature-api", "userutils-api",
        "webimapserver",
        "webstatus"
         ),
    [parameter(Mandatory=$false)][string[]]$gateways=(
        # "apigwacc" # "apigwdat"
        "apigwlex", "apigwacc", "apigwcen", "apigwsig"
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
    Param(
        [parameter(Mandatory=$true)][string]$chart,
        [parameter(Mandatory=$false)][string]$initialOptions="",
        [parameter(Mandatory=$false)][bool]$customRegistry=$false,
        [parameter(Mandatory=$false)][bool]$withInfraIndicator=$false

        )

    $options=$initialOptions
    if ($sslEnabled) {
        $options = "$options --set ingress.tls[0].secretName=$tlsSecretName --set ingress.tls[0].hosts={$dns}"
        if ($sslSupport -ne "custom") {
            $options = "$options --set inf.tls.issuer=$sslIssuer"
        }
    }

    $options = Complete-Options $initialOptions  $customRegistry

    $releaseName = "$appName-$chart"
    if ($withInfraIndicator){
        $releaseName = "it-$releaseName"
    }

    if ($chart -ne "eshop-common" -or $customRegistry)  {       # eshop-common is ignored when no secret must be deployed
        $command = "install $releaseName $options $chart"
        Write-Host "helm $command" -ForegroundColor Blue
        Invoke-Expression 'cmd /c "helm $command"'
    }
}

function Complete-Options  {
    Param(
        [parameter(Mandatory=$false)][string]$options="",
        [parameter(Mandatory=$false)][bool]$customRegistry=$false
    )

    if ($customRegistry) {
        $options = "$options --set inf.registry.server=$registry --set inf.registry.login=$dockerUser --set inf.registry.pwd=$dockerPassword --set inf.registry.secretName=elefebvre-docker-secret"
    }

    if ($modeTest){
        $options = "$options --dry-run"
    }

    if ($modeDebug){
        $options = "$options --debug"
    }
    return $options
}
function Uninstall-Chart  {
    Param(
        [parameter(Mandatory=$true)][string[]]$listReleases,
        [parameter(Mandatory=$false)][string]$initialOptions=""
    )

    $options = Complete-Options $initialOptions

    $command = "uninstall $listReleases $options"
    Write-Host "helm $command" -ForegroundColor DarkMagenta
    Invoke-Expression 'cmd /c "helm $command"'

    Write-Host "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" -ForegroundColor DarkRed
    Write-Host "<<<<<<<<<<<    helm charts uninstalled.    >>>>>>>>>>" -ForegroundColor DarkRed
    Write-Host ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkRed

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
    $ingressValuesFile="ingress_values_dockerk8s.yaml"
    $dns="localhost"
} else{
    $ingressValuesFile="ingress_values.yaml"
}

Write-Host "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkGray
Write-Host "<<<<<<<<<<<<<< The pullPolicy is set to $imagePullPolicy       >>>>>>>>>>>>>>>>>>>" -ForegroundColor Gray
Write-Host "<<<<<<<<<< Always -> Never download images of repository.  >>>>>>>>>>>>" -ForegroundColor Gray
Write-Host "<<<<<<<<<< Never-> Only local images, get errors if not exist >>>>>>>>>" -ForegroundColor Gray
Write-Host "<<<<<<<<<< IfNotPresent -> Local images. try download if not exists >>>" -ForegroundColor Gray
Write-Host "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkGray


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
        Write-Host "No exist Releases to uninstall" -ForegroundColor Yellow
    }else{
        Uninstall-Chart $listOfReleases
    }
    if ($deployInfrastructure){
        $listOfInfras=$(helm ls --filter "it-$appName" -q)
        if ([string]::IsNullOrEmpty($listOfInfras)) {
            Write-Host "No exist Infras to uninstall" -ForegroundColor Yellow
        }else{
           Uninstall-Chart $listOfInfras
        }
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
    Write-Host "Installing infrastructure  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor Gray

    foreach ($infra in $infras) {
        $optionsInstall = "-f app.yaml -f inf.yaml -f $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns}"
        Install-Chart -chart $infra -initialOptions $optionsInstall  -customRegistry $useCustomRegistry -withInfraIndicator $true
    }
}

if ($deployCharts) {

    if ($deployClients) {
        foreach ($chart in $clients) {
            Install-Chart $chart "-f app.yaml -f inf.yaml -f $ingressValuesFile -f $ingressMeshAnnotationsFile -f $envYaml -f $clientYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.tls.enabled=$sslEnabled --set inf.mesh.enabled=$useMesh --set inf.k8s.local=$useLocalk8s --set image.tag=$imageTag " $useCustomRegistry
        }
    }

    if ($deployServices) {
        foreach ($chart in $services) {
            Write-Host "Installing: <<<<<<<<<<<<<<<<<<<< Service:  $chart >>>>>>>>>>>>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            Install-Chart $chart "-f app.yaml -f inf.yaml -f $ingressValuesFile -f $ingressMeshAnnotationsFile -f $envYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.tls.enabled=$sslEnabled --set inf.mesh.enabled=$useMesh --set inf.k8s.local=$useLocalk8s --set image.tag=$imageTag " $useCustomRegistry
        }
    }

    if ($deployGateways) {
        foreach ($chart in $gateways) {
            Write-Host "Installing: <<<<<<<<<<<<<<<<  Gateway Chart: $chart >>>>>>>>>>>>>>>>>"  -ForegroundColor Green
            Install-Chart $chart "-f app.yaml -f inf.yaml -f $ingressValuesFile -f $envYaml --set app.name=$appName --set inf.k8s.dns=$dns --set ingress.hosts={$dns} --set image.pullPolicy=$pullPolicy --set inf.mesh.enabled=$useMesh --set inf.tls.enabled=$sslEnabled --set image.tag=$imageTag" $false
        }
    }

}
else {
    Write-Host "eLefebvreOnContainers non-infrastructure charts aren't installed (-deployCharts is false)" -ForegroundColor Yellow
}

Write-Host "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" -ForegroundColor DarkBlue
Write-Host "<<<<<<<<<<<<<<<<<<<<<<    helm charts installed.    >>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkBlue
Write-Host ">>><<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" -ForegroundColor DarkBlue
