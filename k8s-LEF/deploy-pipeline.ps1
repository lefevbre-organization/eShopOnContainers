Param(
    [parameter(Mandatory=$false)][string]$dockerOrg="elefebvreoncontainers",
    [parameter(Mandatory=$false)][string]$dockerUser="avalverdelefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="Alberto1971.-",
    [parameter(Mandatory=$false)][string]$registry=$null,
    [parameter(Mandatory=$false)][bool]$cleanDocker=$false,
    [parameter(Mandatory=$false)][bool]$buildImages=$true,
    [parameter(Mandatory=$false)][bool]$buildAll=$false,
    [parameter(Mandatory=$false)][string[]]$servicesToBuild=("webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "webloginaddonlexon", "webaddonlexon", "account.api", "lexon.api","lexon.mysql.api", "centinela.api", "userutils.api", "webcentinelaapigw", "webaccountapigw", "weblexonapigw", "webstatus"),
    # [parameter(Mandatory=$false)][string[]]$servicesToBuild=("webgoogleclient"),
    [parameter(Mandatory=$false)][bool]$pushImages=$true,
    [parameter(Mandatory=$false)][string[]]$servicesToPush=("webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "webloginaddonlexon", "webaddonlexon", "account.api", "lexon.api","lexon.mysql.api", "centinela.api", "userutils.api", "ocelotapigw", "webstatuslef"),
    [parameter(Mandatory=$false)][string]$imageTag="linux-dev",
    [parameter(Mandatory=$false)][string]$tagToRetag="linux-dev",
    [parameter(Mandatory=$false)][bool]$deployKubernetes=$false,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$false,
    [parameter(Mandatory=$false)][string]$kubeconfigPath,
    [parameter(Mandatory=$false)][string]$execPath=$null,
    [parameter(Mandatory=$false)][string]$configFile,
    [parameter(Mandatory=$false)][bool]$deployCI=$false
)

function ExecKube($cmd) {    
    if($deployCI) {
        $kubeconfig = $kubeconfigPath + 'config';
        $exp = $execPath + 'kubectl ' + $cmd + ' --kubeconfig=' + $kubeconfig
        Invoke-Expression $exp
    }
    else{
        $exp = $execPath + 'kubectl ' + $cmd
        Invoke-Expression $exp
    }
}

# Initialization
$location = (Get-Location)
Write-Host "The path of execution: $location" -ForegroundColor Red 

if (-not [string]::IsNullOrEmpty($execPath)) {
    Set-Location -Path $execPath -Verbose
    Write-Host "The path of execution is set to: $execPath" -ForegroundColor Yellow 
}

$debugMode = $PSCmdlet.MyInvocation.BoundParameters["Debug"].IsPresent
$useDockerHub = [string]::IsNullOrEmpty($registry)

if ($deployKubernetes){
    $externalDns = & ExecKube -cmd 'get svc ingress-nginx -n ingress-nginx -o=jsonpath="{.status.loadBalancer.ingress[0].ip}"'
    Write-Host "Ingress ip detected: $externalDns" -ForegroundColor Yellow 
    
    if (-not [bool]($externalDns -as [ipaddress])) {
        Write-Host "Must install ingress first" -ForegroundColor Red
        Write-Host "Run deploy-ingress.ps1 and  deploy-ingress-azure.ps1" -ForegroundColor Red
        exit
    }
}

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
if ([string]::IsNullOrEmpty($imageTag)) {
    $imageTag = $(git rev-parse --abbrev-ref HEAD)
    Write-Host "Get from Git imageTag $imageTag" -ForegroundColor White
}

if (-not [string]::IsNullOrEmpty($tagToRetag)) {
    Write-Host "Rename tagToRetag $tagToRetag to $imageTag" -ForegroundColor White
    $tagToRetag =  $imageTag
}

Write-Host "=====================================" -ForegroundColor DarkCyan
Write-Host "Docker location: $location" -ForegroundColor DarkCyan
Write-Host "Docker image Tag: $imageTag" -ForegroundColor DarkCyan
Write-Host "Se usa DockeHub: $useDockerHub" -ForegroundColor DarkCyan 
Write-Host "Docker: Build $buildImages all[$buildAll] and Clean $cleanDocker" -ForegroundColor DarkCyan 
Write-Host "Docker: Push images $pushImages" -ForegroundColor DarkCyan 
Write-Host "Kubernetes: Deploy $deployKubernetes with Infraestructure $deployInfrastructure" -ForegroundColor DarkCyan 
Write-Host "=====================================" -ForegroundColor DarkCyan

# building  docker images if needed
if ($buildImages) {
    if($cleanDocker){
        Write-Host "CleanDockers 01: remove all containers" -ForegroundColor DarkBlue
        docker containers rm -f $(docker ps -a -q)
        Write-Host "CleanDockers 02: remove all images" -ForegroundColor DarkBlue
        docker rmi -f $(docker images -a -q)
    }
    
    # $env:TAG=$imageTag
    Write-Host "BuildDocker 01: Files" -ForegroundColor DarkBlue
    Get-ChildItem -Path $location -Filter $fileCompose | ForEach-Object{$_.FullName}

    # $parentLocation = (get-item $location).parent.FullName
    $fileCompose = "docker-compose.yml"
    # Write-Host "BuildDocker 02: Docker-Compose" -ForegroundColor DarkBlue
    # Get-ChildItem -Path $parentLocation -Filter $fileCompose -Recurse | ForEach-Object{$_.FullName}

    $pathFileCompose = "$location/$fileCompose"
    Write-Host "BuildDocker 02: $pathFileCompose" -ForegroundColor DarkBlue

    if($buildAll){
        Write-Host "BuildDockers 03A: Building All Docker images tagged with '$imageTag'" -ForegroundColor DarkBlue
        docker-compose -p .. -f $pathFileCompose build      
        # docker-compose -p .. -f ../docker-compose.yml build      
    }else{

        foreach ($service in $servicesToBuild) {
            Write-Host "BuildDockers 03B: Building Docker image '$service' tagged with '$imageTag'" -ForegroundColor DarkBlue
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
        docker tag $dockerOrg/${service}:$tagToRetag ${imageFqdn}:$imageTag
        Write-Host "PushImages 02: $dockerOrg/${service}:$tagToRetag añade el tag ${imageFqdn}:$imageTag" -ForegroundColor Magenta

        docker push ${imageFqdn}:$imageTag  
        Write-Host "PushImages 03: ${imageFqdn}:$imageTag" -ForegroundColor Magenta
                  
    }

    Write-Host "PushImages 04: All images pushed  to $registry/$dockerOrg" -ForegroundColor Magenta
}

if ($deployKubernetes){
    # if we have login/pwd add the secret to k8s
    if (-not [string]::IsNullOrEmpty($dockerUser)) {
        $registryFDQN =  if (-not $useDockerHub) {$registry} else {"index.docker.io/v1/"}

        Write-Host "DeployKubernetes 01: Logging in to $registryFDQN as user $dockerUser" -ForegroundColor Yellow
        if ($useDockerHub) {
            docker login -u $dockerUser -p $dockerPassword
        }
        else {
            docker login -u $dockerUser -p $dockerPassword $registryFDQN
        }
    
        if (-not $LastExitCode -eq 0) {
            Write-Host "Login failed" -ForegroundColor Red
            exit
        }
        
        # Try to delete the Docker registry key secret
        Write-Host "DeployKubernetes 02: delete secret docker-registry" -ForegroundColor Yellow
        ExecKube -cmd 'delete secret docker-registry registry-key'

        # Create the Docker registry key secret
        Write-Host "DeployKubernetes 03: create secret docker-registry" -ForegroundColor Yellow
        ExecKube -cmd 'create secret docker-registry registry-key `
        --docker-server=$registryFDQN `
        --docker-username=$dockerUser `
        --docker-password=$dockerPassword `
        --docker-email=not@used.com'
    }

    # Removing previous services & deployments
    Write-Host "DeployKubernetes 04: Removing existing services & deployments.." -ForegroundColor Yellow
    ExecKube -cmd 'delete deployments --all'
    ExecKube -cmd 'delete services --all'
    ExecKube -cmd 'delete configmap internalurls'
    ExecKube -cmd 'delete configmap urls'
    ExecKube -cmd 'delete configmap externalcfg'
    ExecKube -cmd 'delete configmap ocelot'
    Write-Host "DeployKubernetes 05: Delete the ingress-lef.yaml paths" -ForegroundColor Red
    ExecKube -cmd 'delete -f ingress-lef.yaml'

    # start sql, rabbitmq, frontend deployments
    if ($deployInfrastructure) {
        Write-Host 'DeployKubernetesInfra 01: Deploying infrastructure deployments (databases, redis, RabbitMQ...)' -ForegroundColor Yellow
        Write-Host "Create the sql-data-lef.yaml rabbitmq-lef.yaml -nosql-data-lef.yaml" -ForegroundColor Red
        ExecKube -cmd 'create -f sql-data-lef.yaml -f rabbitmq-lef.yaml -f nosql-data-lef.yaml'
    }

    Write-Host 'DeployKubernetes 06: Deploying ocelot APIGW from ocelot/deployment-lef.yaml y ocelot/service-lef.yaml ans config files' -ForegroundColor Yellow
    ExecKube "create configmap ocelot --from-file=acc=ocelot/configuration-web-account.json --from-file=lex=ocelot/configuration-web-lexon.json "
    ExecKube -cmd "apply -f ocelot/deployment-lef.yaml"
    ExecKube -cmd "apply -f ocelot/service-lef.yaml"

    Write-Host 'DeployKubernetes 07: Deploying code deployments (Web APIs, Web apps, ...) from services-lef.yaml' -ForegroundColor Yellow
    ExecKube -cmd 'create -f services-lef.yaml'

    Write-Host "DeployKubernetes 08: Create internalurls-lef.yaml" -ForegroundColor Red
    ExecKube -cmd 'create -f internalurls-lef.yaml'

    Write-Host "DeployKubernetes 09: Create configmap urls" -ForegroundColor Red
    ExecKube -cmd 'create configmap urls `
        --from-literal=apigwlex_e=http://$($externalDns)/weblexonapigw `
        --from-literal=apigwacc_e=http://$($externalDns)/webaccountapigw `
        --from-literal=lexon_e=http://$($externalDns)/lexon-api `
        --from-literal=account_e=http://$($externalDns)/account-api `
        --from-literal=lexonapi_e=http://$($externalDns)/lexon-mysql-api' 

    ExecKube -cmd 'label configmap urls app=elefebvre'

    Write-Host "DeployKubernetes 09: Deploying configuration from $configFile" -ForegroundColor Yellow
    ExecKube -cmd "create -f $configFile"

    Write-Host "DeployKubernetes 10: Creating deployments with deployments-lef.yaml..." -ForegroundColor Yellow
    ExecKube -cmd 'create -f deployments-lef.yaml'

    # update deployments with the correct image (with tag and/or registry)
    $registryPath = ""
    if (-not [string]::IsNullOrEmpty($registry)) {
        $registryPath = "$registry/"
    }

    Write-Host "DeployKubernetes 11: Update Image containers to use prefix '$registry$dockerOrg' and tag '$imageTag'" -ForegroundColor Yellow

    ExecKube -cmd 'set image deployments/lexon lexon=${registryPath}${dockerOrg}/lexon.api:$imageTag'
    ExecKube -cmd 'set image deployments/lexonmysql lexonmysql=${registryPath}${dockerOrg}/lexonmysql.api:$imageTag'
    ExecKube -cmd 'set image deployments/account account=${registryPath}${dockerOrg}/account.api:$imageTag'
    ExecKube -cmd 'set image deployments/webportalclient webportalclient=${registryPath}${dockerOrg}/webportalclient.api:$imageTag'
    ExecKube -cmd 'set image deployments/webgoogleclient webgoogleclient=${registryPath}${dockerOrg}/webgoogleclient:$imageTag'
    ExecKube -cmd 'set image deployments/webofficeclient webofficeclient=${registryPath}${dockerOrg}/webofficeclient:$imageTag'
    ExecKube -cmd 'set image deployments/weblexonclient weblexonclient=${registryPath}${dockerOrg}/weblexonclient:$imageTag'
    ExecKube -cmd 'set image deployments/webloginaddonlexon webloginaddonlexon=${registryPath}${dockerOrg}/webloginaddonlexon:$imageTag'
    ExecKube -cmd 'set image deployments/webimapclient webimapclient=${registryPath}${dockerOrg}/webimapclient:$imageTag'
    ExecKube -cmd 'set image deployments/webstatus webstatus=${registryPath}${dockerOrg}/webstatuslef:$imageTag'

    ExecKube -cmd 'set image deployments/apigwlex apigwlex=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
    ExecKube -cmd 'set image deployments/apigwacc apigwacc=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'

    Write-Host "DeployKubernetes 12: Execute rollout..." -ForegroundColor Yellow
    ExecKube -cmd 'rollout resume deployments/lexon'
    ExecKube -cmd 'rollout resume deployments/lexonmysql'
    ExecKube -cmd 'rollout resume deployments/account'
    ExecKube -cmd 'rollout resume deployments/webportalclient'
    ExecKube -cmd 'rollout resume deployments/webgoogleclient'
    ExecKube -cmd 'rollout resume deployments/webofficeclient'
    ExecKube -cmd 'rollout resume deployments/weblexonclient'
    ExecKube -cmd 'rollout resume deployments/webloginaddonlexon'
    ExecKube -cmd 'rollout resume deployments/webimapclient'
    ExecKube -cmd 'rollout resume deployments/webstatus'
    ExecKube -cmd 'rollout resume deployments/apigwlex'
    ExecKube -cmd 'rollout resume deployments/apigwacc'

    Write-Host "DeployKubernetes 13: Adding/Updating ingress resource from ingress-lef.yalm..." -ForegroundColor Yellow
    ExecKube -cmd 'apply -f ingress-lef.yaml'

    Write-Host "DeployKubernetes 14 (END): WebPortal is exposed at http://$externalDns, WebStatus at http://$externalDns/webstatus" -ForegroundColor Green
}

Write-Host "-------------------END PROCESS-------------" -ForegroundColor Green