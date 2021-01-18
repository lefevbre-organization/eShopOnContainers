Param(
    [parameter(Mandatory=$false)][string]$registry="index.docker.io",
    [parameter(Mandatory=$false)][string]$dockerUser="freyeslefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="NetEb9221",
    [parameter(Mandatory=$false)][string]$externalDns,
    [parameter(Mandatory=$false)][string]$appName="elefebvre",
    [parameter(Mandatory=$false)][bool]$clean=$true,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$true,
    [parameter(Mandatory=$false)][string[]]$infras=(
        "nosql-data",
        "sql-data"
        "rabbitmq"
        ),
    [parameter(Mandatory=$false)][bool]$deployCharts=$true,
    [parameter(Mandatory=$false)][string[]]$charts=(
        "conference-api", "lexon-api", "account-api", "centinela-api", "userutils-api", "signature-api", "database-api", 
        "apigwlex", "apigwacc", "apigwcen", "apigwsig", "apigwdat", 
        "webdatabase", "webcentinela", "webgoogle", "webgraph", "weblexon", "webportal", "webimap","websignature",
        "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela", 
        "webimapserver", 
        "webstatus"
        ),
    [parameter(Mandatory=$false)][string]$aksName="",
    [parameter(Mandatory=$false)][string]$aksRg="",
    [parameter(Mandatory=$false)][string]$imageTag="latest",
    [parameter(Mandatory=$false)][bool]$useLocalk8s=$false,
    [parameter(Mandatory=$false)][bool]$useLocalImages=$false,
    [parameter(Mandatory=$false)][string]$imagePullPolicy="Always"
    )

$dns = $externalDns


if ($useLocalk8s -eq $true) {
    Write-Host "select useLocalk8s configure with  ingress_values_dockerk8s.yaml" -ForegroundColor Green
    $ingressValuesFile="ingress_values_dockerk8s.yaml"
    $dns="localhost"
} else{
    Write-Host "select external kubernetes configure with ingress_values.yaml" -ForegroundColor Green
    $ingressValuesFile="ingress_values.yaml"

}

Write-Host "The pullPolicy is set to $imagePullPolicy" -ForegroundColor Green
Write-Host "Always -> nunca usa imagenes locales." -ForegroundColor Gray
Write-Host "Never-> solo usa imagenes locales y los pods será erroneos si no existen" -ForegroundColor Gray
Write-Host "IfNotPresent -> usa imagenes locales. Si no existen intentará descargarlas" -ForegroundColor Gray

$pullPolicy = $imagePullPolicy

if ($useLocalImages -eq $true) {
    Write-Host "Al usar imagenes locales Se fuerza a la pullPolicy a Never" -ForegroundColor Gray
#   $pullPolicy = "Always"
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
}

if ($clean) {
    Write-Host "Cleaning previous helm releases $appName..." -ForegroundColor Green
    # helm delete --purge $(helm ls -q elefebvre) 
    helm delete --purge $(helm ls -q $appName) 
    Write-Host "Previous releases deleted" -ForegroundColor Green
}

$useCustomRegistry=$false

if (-not [string]::IsNullOrEmpty($registry)) {
    $useCustomRegistry=$true
    if ([string]::IsNullOrEmpty($dockerUser) -or [string]::IsNullOrEmpty($dockerPassword)) {
        Write-Host "Error: Must use -dockerUser AND -dockerPassword if specifying custom registry" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Begin eLefebvreOnContainers installation using Helm" -ForegroundColor Green

if ($deployInfrastructure) {
    Write-Host "eLefebvreOnContainers infrastructure with app-lef.yaml and inf-lef.yaml" -ForegroundColor Yellow
    foreach ($infra in $infras) {
        Write-Host "Installing infrastructure: $infra" -ForegroundColor Green
        Write-Host "Installing infrastructure: $infra Inject app.name=$appName, inf.k8s.dns=$dns, ingress.hosts - final-name= $appName-$infra" -ForegroundColor Green
        helm install --values app-lef.yaml --values inf-lef.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set "ingress.hosts={$dns}" --name="$appName-$infra" $infra     
    }
}
else {
    Write-Host "eLefebvreOnContainers infrastructure (bbdd, rabbit, ...) charts aren't installed (-deployInfras is false)" -ForegroundColor Yellow
}

if ($deployCharts) {
    Write-Host "eLefebvreOnContainers charts with app-lef.yaml and inf-lef.yaml" -ForegroundColor Yellow
    foreach ($chart in $charts) {
        Write-Host "Installing: $chart" -ForegroundColor Green
        if ($useCustomRegistry) {
            Write-Host "useCustomRegistry -> Inject inf.registry.server=$registry, inf.registry.login=$dockerUser, inf.registry.pwd, inf.registry.secretName, app.name=$appName, inf.k8s.dns=$dns, ingress.hosts, image.tag=$imageTag, image.pullPolicy=$pullPolicy - final-name=$appName-$chart" -ForegroundColor Green
            helm install --set inf.registry.server=$registry --set inf.registry.login=$dockerUser --set inf.registry.pwd=$dockerPassword --set inf.registry.secretName=elef-docker-secret --values app-lef.yaml --values inf-lef.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set "ingress.hosts={$dns}" --set image.tag=$imageTag --set image.pullPolicy=$pullPolicy --name="$appName-$chart" $chart 
        }
        else {
            if ($chart -ne "eshop-common")  {       # eshop-common is ignored when no secret must be deployed
                Write-Host "Inject app.name=$appName, inf.k8s.dns=$dns, ingress.hosts, image.tag=$imageTag, image.pullPolicy=$pullPolicy, name=$appName-$chart" -ForegroundColor Green
                helm install --values app-lef.yaml --values inf-lef.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns  --set "ingress.hosts={$dns}" --set image.tag=$imageTag --set image.pullPolicy=$pullPolicy --name="$appName-$chart" $chart 
            }
        }
    }
}
else {
    Write-Host "eLefebvreOnContainers non-infrastructure charts aren't installed (-deployCharts is false)" -ForegroundColor Yellow
}

Write-Host "helm charts installed." -ForegroundColor Green
