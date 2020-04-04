Param(
    [parameter(Mandatory=$false)][string]$registry,
    [parameter(Mandatory=$false)][string]$dockerUser,
    [parameter(Mandatory=$false)][string]$dockerPassword,
    [parameter(Mandatory=$false)][string]$externalDns,
    [parameter(Mandatory=$false)][string]$appName="elefebvre",
    [parameter(Mandatory=$false)][bool]$clean=$true,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$true,
    [parameter(Mandatory=$false)][string[]]$infras=("sql-data", "nosql-data", "rabbitmq"),
    [parameter(Mandatory=$false)][bool]$deployCharts=$true,
    [parameter(Mandatory=$false)][string[]]$charts=("apigwlex", "lexon-api", "lexonmysql-api", "apigwacc", "account-api" , "webgoogle", "webgraph", "weblexon", "webportal", "webimap", "webimapserver", "webstatus"),
    [parameter(Mandatory=$false)][string]$aksName="",
    [parameter(Mandatory=$false)][string]$aksRg="",
    [parameter(Mandatory=$false)][string]$imageTag="latest",
    [parameter(Mandatory=$false)][bool]$useLocalk8s=$false,
    [parameter(Mandatory=$false)][bool]$useLocalImages=$false
    )

$dns = $externalDns


if ($useLocalk8s -eq $true) {
    Write-Host "select useLocalk8s configure with  ingress_values_dockerk8s-lef.yaml" -ForegroundColor Green
    $ingressValuesFile="ingress_values_dockerk8s-lef.yaml"
    $dns="localhost"
} else{
    Write-Host "select external kubernetes configure with ingress_values-lef.yaml" -ForegroundColor Green
    $ingressValuesFile="ingress_values-lef.yaml"

}

$pullPolicy = "Always"

if ($useLocalImages -eq $true) {
  $pullPolicy = "Always"
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
    foreach ($infra in $infras) {
        Write-Host "Installing infrastructure: $infra" -ForegroundColor Green
        Write-Host "Inject app.name, inf.k8s.dns, ingress.hosts - the final name = $appName-$infra" -ForegroundColor Green
        helm install --values app.yaml --values inf.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set "ingress.hosts={$dns}" --name="$appName-$infra" $infra     
    }
}
else {
    Write-Host "eLefebvreOnContainers infrastructure (bbdd, rabbit, ...) charts aren't installed (-deployInfras is false)" -ForegroundColor Yellow
}

if ($deployCharts) {
    foreach ($chart in $charts) {
        Write-Host "Installing: $chart" -ForegroundColor Green
        if ($useCustomRegistry) {
            Write-Host "useCustomRegistry -> inject inf.registry.server, inf.registry.login, inf.registry.pwd, inf.registry.secretName" -ForegroundColor Green
            Write-Host "useCustomRegistry -> Inject app.name, inf.k8s.dns, ingress.hosts, image.tag=$imageTag, image.pullPolicy=Always - the final name = $appName-$chart" -ForegroundColor Green
            
            helm install --set inf.registry.server=$registry --set inf.registry.login=$dockerUser --set inf.registry.pwd=$dockerPassword --set inf.registry.secretName=elef-docker-secret --values app.yaml --values inf.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns --set "ingress.hosts={$dns}" --set image.tag=$imageTag --set image.pullPolicy=Always --name="$appName-$chart" $chart 
        }
        else {
            if ($chart -ne "eshop-common")  {       # eshop-common is ignored when no secret must be deployed
                Write-Host "install $chart -> Inject app.name, inf.k8s.dns, ingress.hosts, image.tag=$imageTag, image.pullPolicy=Always - the final name = $appName-$chart" -ForegroundColor Green
                helm install --values app.yaml --values inf.yaml --values $ingressValuesFile --set app.name=$appName --set inf.k8s.dns=$dns  --set "ingress.hosts={$dns}" --set image.tag=$imageTag --set image.pullPolicy=$pullPolicy --name="$appName-$chart" $chart 
            }
        }
    }
}
else {
    Write-Host "eLefebvreOnContainers non-infrastructure charts aren't installed (-deployCharts is false)" -ForegroundColor Yellow
}

Write-Host "helm charts installed." -ForegroundColor Green
