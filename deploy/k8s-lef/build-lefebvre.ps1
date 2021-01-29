Param(
    [parameter(Mandatory=$false)][string]$registry=$null,
    [parameter(Mandatory=$false)][string]$dockerUser="freyeslefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="NetEb9221",
    [parameter(Mandatory=$false)][string]$dockerOrg="elefebvreoncontainers",
    [parameter(Mandatory=$false)][bool]$cleanDocker=$true,
    [parameter(Mandatory=$false)][bool]$buildImages=$true,
    [parameter(Mandatory=$false)][bool]$buildAll=$false,
    [parameter(Mandatory=$false)][string[]]$servicesToBuild=(
         "calendar.api", "account.api"
        # "calendar.api", "conference.api", "account.api", "lexon.api", "centinela.api", "userutils.api", "signature.api", #  "database.api", 
        # "googledrive.api", "googleaccount.api",        
        # "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient", # "webdatabaseclient", 
        # "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela", 
        # "webcentinelaapigw", "webaccountapigw", "weblexonapigw", "websignatureapigw", # "webdatabaseapigw", 
        # "webstatus"
         ),  
    [parameter(Mandatory=$false)][bool]$pushImages=$true,
    [parameter(Mandatory=$false)][string[]]$servicesToPush=(
        "calendar.api", "account.api"
        # "calendar.api","conference.api", "account.api", "lexon.api", "centinela.api", "userutils.api", "signature.api",        #  "database.api",
        # "googledrive.api", "googleaccount.api",
        # "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient",         # "webdatabaseclient", 
        # "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela",
        # "ocelotapigw", 
        # "webstatuslef"
        ),
    [parameter(Mandatory=$false)][string]$imageEnv="dev-39.7",
    [parameter(Mandatory=$false)][string]$imagePlatform="linux",
    [parameter(Mandatory=$false)][bool]$deployCI=$false
)

# Initialization
$imageTag = $imagePlatform + "-" + $imageEnv
$useDockerHub = [string]::IsNullOrEmpty($registry)

# Check required commands (only if not in CI environment)
if(-not $deployCI) {
    $requiredCommands = ("docker", "docker-compose")
    foreach ($command in $requiredCommands) {
        if ($null -eq (Get-Command $command -ErrorAction SilentlyContinue)) {
            Write-Host "$command must be on path" -ForegroundColor Red
            exit
        }
    }
}
else {
    $buildImages = false;       # Never build images through CI, as they previously built
}

# Get tag to use from current branch if no tag is passed
if ([string]::IsNullOrEmpty($imageTag)) {
    $imageTag = $(git rev-parse --abbrev-ref HEAD)
}

Write-Host "=====================================" -ForegroundColor DarkCyan
Write-Host "Docker image Tag: $imageTag" -ForegroundColor DarkCyan
Write-Host "Se usa DockeHub: $useDockerHub" -ForegroundColor DarkCyan 
Write-Host "Deploy Kubernetes: $deployKubernetes" -ForegroundColor DarkCyan 
Write-Host "Docker: Build $buildImages all[$buildAll] and Clean $cleanDocker" -ForegroundColor DarkCyan 
Write-Host "Kubernetes: $deployKubernetes with Infraestructure $cleanDocker" -ForegroundColor DarkCyan 
Write-Host "=====================================" -ForegroundColor DarkCyan

# building  docker images if needed
if ($buildImages) {
    if($cleanDocker){
        Write-Host "remove all containers" -ForegroundColor DarkBlue
        docker containers rm -f $(docker ps -a -q)
        Write-Host "remove all images" -ForegroundColor DarkBlue
        docker rmi -f $(docker images -a -q)
    }
    
    $env:TAG=$imageEnv
    $env:PLATFORM=$imagePlatform

    if($buildAll){
        Write-Host "Building All Docker images tagged with '$imageTag'" -ForegroundColor DarkBlue
        docker-compose -p .. -f ../docker-compose.yml build      
    }else{

        foreach ($service in $servicesToBuild) {
            Write-Host "=====================================" -ForegroundColor DarkCyan
            Write-Host "Building Docker image '$service' tagged with '$imageTag'" -ForegroundColor DarkBlue
            Write-Host "=====================================" -ForegroundColor DarkCyan
            docker-compose -p .. -f ../../docker-compose.yml build $service
        }
    }
}

if ($pushImages) {
    Write-Host "Pushing images to $registry/$dockerOrg..." -ForegroundColor Magenta
    docker login -u $dockerUser -p $dockerPassword

    foreach ($service in $servicesToPush) {
        $imageFqdn = if ($useDockerHub)  {"$dockerOrg/${service}"} else {"$registry/$dockerOrg/${service}"}
        docker tag $dockerOrg/${service}:$imageTag ${imageFqdn}:$imageTag
        Write-Host "la imagen -> $dockerOrg/${service}:$imageTag añade el tag ${imageFqdn}:$imageTag" -ForegroundColor Magenta

        docker push ${imageFqdn}:$imageTag  
        Write-Host "Push image to ${imageFqdn}:$imageTag" -ForegroundColor Magenta
                  
    }

    Write-Host "All images pushed  to $registry/$dockerOrg" -ForegroundColor Magenta
}

Write-Host "-------------------END PROCESS-------------" -ForegroundColor Green