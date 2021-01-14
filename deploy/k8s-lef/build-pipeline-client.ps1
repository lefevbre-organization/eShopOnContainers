Param(
    [parameter(Mandatory=$false)][string]$dockerOrg="elefebvreoncontainers",
    [parameter(Mandatory=$false)][string]$dockerUser="avalverdelefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="Alberto1971.-",
    [parameter(Mandatory=$false)][string]$registry=$null,
    [parameter(Mandatory=$false)][bool]$cleanDocker=$false,
    [parameter(Mandatory=$false)][bool]$buildImages=$true,
    [parameter(Mandatory=$false)][bool]$buildAll=$false,
    [parameter(Mandatory=$false)][string[]]$servicesToBuild=(
        "webdatabaseclient", "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient", 
        "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela" 
        ),
    [parameter(Mandatory=$false)][bool]$pushImages=$true,
    [parameter(Mandatory=$false)][string[]]$servicesToPush=(
        "webdatabaseclient", "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient", 
        "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela"
        ),
    [parameter(Mandatory=$false)][string]$tagToPush="linux-dev-39",
    [parameter(Mandatory=$false)][string]$initialTag="linux-dev",
    [parameter(Mandatory=$false)][string]$execPath=$null,
    [parameter(Mandatory=$false)][bool]$deployCI=$false
)

# Initialization
$location = (Get-Location)
Write-Host "The path of execution: $location" -ForegroundColor Red 

if (-not [string]::IsNullOrEmpty($execPath)) {
    Set-Location -Path $execPath -Verbose
    Write-Host "The path of execution is set to: $execPath" -ForegroundColor Yellow 
}

$debugMode = $PSCmdlet.MyInvocation.BoundParameters["Debug"].IsPresent
$useDockerHub = [string]::IsNullOrEmpty($registry)

# Check required commands (only if not in CI environment)
if(-not $deployCI) {
    $requiredCommands = ("docker", "docker-compose", "kubectl")
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
if ([string]::IsNullOrEmpty($tagToPush)) {
    $tagToPush = $(git rev-parse --abbrev-ref HEAD)
    Write-Host "Get from Git tagToPush $tagToPush" -ForegroundColor White
}

if ([string]::IsNullOrEmpty($initialTag)) {
    Write-Host "Rename initialTag $initialTag to $tagToPush" -ForegroundColor White
    $initialTag =  $tagToPush
}

Write-Host "=====================================" -ForegroundColor DarkCyan
Write-Host "Docker location: $location" -ForegroundColor DarkCyan
Write-Host "Docker build Tag: $initialTag -> Hub push Tag: $tagToPush" -ForegroundColor DarkCyan
Write-Host "Se usa DockeHub: $useDockerHub" -ForegroundColor DarkCyan 
Write-Host "Docker: Build $buildImages all[$buildAll] and Clean $cleanDocker" -ForegroundColor DarkCyan 
Write-Host "Docker: Push images $pushImages" -ForegroundColor DarkCyan 
Write-Host "=====================================" -ForegroundColor DarkCyan

# building  docker images if needed
if ($buildImages) {
    if($cleanDocker){
        Write-Host "CleanDockers 01: remove all containers" -ForegroundColor DarkBlue
        docker containers rm -f $(docker ps -a -q)
        Write-Host "CleanDockers 02: remove all images" -ForegroundColor DarkBlue
        docker rmi -f $(docker images -a -q)
    }
    
    # $env:TAG=$initialTag
    # if changue this , the tag from docke-compose changue
    Write-Host "BuildDocker 01: Files" -ForegroundColor DarkBlue
    Get-ChildItem -Path $location -Filter $fileCompose | ForEach-Object{$_.FullName}

    # $parentLocation = (get-item $location).parent.FullName
    $fileCompose = "docker-compose.yml"
    # Write-Host "BuildDocker 02: Docker-Compose" -ForegroundColor DarkBlue
    # Get-ChildItem -Path $parentLocation -Filter $fileCompose -Recurse | ForEach-Object{$_.FullName}

    $pathFileCompose = "$location/$fileCompose"
    Write-Host "BuildDocker 02: $pathFileCompose" -ForegroundColor DarkBlue

    if($buildAll){
        Write-Host "BuildDockers 03A: Building All Docker images tagged with '$tagToPush'" -ForegroundColor DarkBlue
        docker-compose -p .. -f $pathFileCompose build      
        # docker-compose -p .. -f ../docker-compose.yml build      
    }else{

        foreach ($service in $servicesToBuild) {
            Write-Host "=====================================" -ForegroundColor DarkCyan
            Write-Host "BuildDockers 03B: Building Docker image '$service' tagged with '$tagToPush'" -ForegroundColor DarkBlue
            Write-Host "=====================================" -ForegroundColor DarkCyan
            # docker-compose -p .. -f ../docker-compose.yml build $service
            docker-compose -p .. -f $pathFileCompose build $service
        }
    }
}

if ($pushImages) {
    Write-Host "PushImages 01: Pushing images to $registry/$dockerOrg..." -ForegroundColor Magenta
    docker login -u $dockerUser -p $dockerPassword

    foreach ($service in $servicesToPush) {
        $imageFqdn = if ($useDockerHub)  {"$dockerOrg/${service}"} else {"$registry/$dockerOrg/${service}"}
        docker tag $dockerOrg/${service}:$initialTag ${imageFqdn}:$tagToPush
        Write-Host "PushImages 02: $dockerOrg/${service}:$initialTag añade el tag ${imageFqdn}:$tagToPush" -ForegroundColor Magenta

        docker push ${imageFqdn}:$tagToPush  
        Write-Host "PushImages 03: ${imageFqdn}:$tagToPush" -ForegroundColor Magenta
                  
    }

    Write-Host "PushImages 04: All images pushed  to $registry/$dockerOrg" -ForegroundColor Magenta
}

Write-Host "-------------------END PROCESS-------------" -ForegroundColor Green
