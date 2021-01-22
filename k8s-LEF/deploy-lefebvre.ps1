Param(
    [parameter(Mandatory=$false)][string]$registry=$null,
    [parameter(Mandatory=$false)][string]$dockerUser="avalverdelefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="Alberto1971.-",
    [parameter(Mandatory=$false)][string]$dockerOrg="elefebvreoncontainers",
    [parameter(Mandatory=$false)][bool]$cleanDocker=$true,
    [parameter(Mandatory=$false)][string]$execPath,
    [parameter(Mandatory=$false)][string]$kubeconfigPath,
    [parameter(Mandatory=$false)][string]$configFile,
    [parameter(Mandatory=$false)][bool]$buildImages=$true,
    [parameter(Mandatory=$false)][bool]$buildAll=$false,
    [parameter(Mandatory=$false)][string[]]$servicesToBuild=(
        "websignatureclient"
        # "conference.api", "account.api", "lexon.api", "lexon.mysql.api", "centinela.api", "userutils.api", "signature.api", "database.api", 
        # "webdatabaseclient", "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient", 
        # "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela", 
        # "webdatabaseapigw", "webcentinelaapigw", "webaccountapigw", "weblexonapigw", "websignatureapigw", 
        # "webstatus"
         ),
    [parameter(Mandatory=$false)][bool]$pushImages=$true,
    [parameter(Mandatory=$false)][string[]]$servicesToPush=(
        "websignatureclient"
        # "conference.api", "account.api", "lexon.api", "lexon.mysql.api", "centinela.api", "userutils.api", "signature.api", "database.api",
        # "webdatabaseclient", "webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "websignatureclient", "webcentinelaclient", 
        # "webaddonlauncher", "weboffice365addonlexon", "weboffice365addoncentinela",
        # "ocelotapigw", 
        # "webstatuslef"
        ),
    [parameter(Mandatory=$false)][string]$imageEnv="dev-39.3",
    [parameter(Mandatory=$false)][string]$imagePlatform="linux",
    [parameter(Mandatory=$false)][bool]$deployKubernetes=$false,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$false,
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
$imageTag = $imagePlatform + "-" + $imageEnv
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
            docker-compose -p .. -f ../docker-compose.yml build $service
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

if ($deployKubernetes){
    # if we have login/pwd add the secret to k8s
    if (-not [string]::IsNullOrEmpty($dockerUser)) {
        $registryFDQN =  if (-not $useDockerHub) {$registry} else {"index.docker.io/v1/"}

        Write-Host "Logging in to $registryFDQN as user $dockerUser" -ForegroundColor Yellow
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
        ExecKube -cmd 'delete secret docker-registry registry-key'

        # Create the Docker registry key secret
        ExecKube -cmd 'create secret docker-registry registry-key `
        --docker-server=$registryFDQN `
        --docker-username=$dockerUser `
        --docker-password=$dockerPassword `
        --docker-email=not@used.com'
    }

    # Removing previous services & deployments
    Write-Host "Removing existing services & deployments.." -ForegroundColor Yellow
    Write-Host "Delete the ingress-lef.yaml paths" -ForegroundColor Red
    ExecKube -cmd 'delete deployments --all'
    ExecKube -cmd 'delete services --all'
    ExecKube -cmd 'delete configmap internalurls'
    ExecKube -cmd 'delete configmap urls'
    ExecKube -cmd 'delete configmap externalcfg'
    ExecKube -cmd 'delete configmap ocelot'
    ExecKube -cmd 'delete -f ingress-lef.yaml'

    # start sql, rabbitmq, frontend deployments
    if ($deployInfrastructure) {
        Write-Host 'Deploying infrastructure deployments (databases, redis, RabbitMQ...)' -ForegroundColor Yellow
        Write-Host "Create the sql-data-lef.yaml rabbitmq-lef.yaml -nosql-data-lef.yaml" -ForegroundColor Red
        ExecKube -cmd 'create -f sql-data-lef.yaml -f rabbitmq-lef.yaml -f nosql-data-lef.yaml'
    }

    Write-Host 'Deploying ocelot APIGW from ocelot/deployment-lef.yaml y ocelot/service-lef.yaml ans config files' -ForegroundColor Yellow

    ExecKube "create configmap ocelot `
        --from-file=mm=ocelot/configuration-web-account.json `
        --from-file=mm=ocelot/configuration-web-lexon.json `
        --from-file=mm=ocelot/configuration-web-centinela.json`
        --from-file=mm=ocelot/configuration-web-database.json `
        --from-file=ws=ocelot/configuration-web-signature.json "

    ExecKube -cmd "apply -f ocelot/deployment-lef.yaml"
    ExecKube -cmd "apply -f ocelot/service-lef.yaml"

    Write-Host 'Deploying code deployments (Web APIs, Web apps, ...)' -ForegroundColor Yellow
    Write-Host "Create services-lef.yaml" -ForegroundColor Red
    ExecKube -cmd 'create -f services-lef.yaml'

    Write-Host "Create internalurls-lef.yaml" -ForegroundColor Red
    ExecKube -cmd 'create -f internalurls-lef.yaml'

    Write-Host "Create configmap urls" -ForegroundColor Red
    ExecKube -cmd 'create configmap urls `
        --from-literal=apigwlex_e=http://$($externalDns)/weblexonapigw `
        --from-literal=apigwacc_e=http://$($externalDns)/webaccountapigw `
        --from-literal=apigwcen_e=http://$($externalDns)/webcentinelaapigw `
        --from-literal=apigwsig_e=http://$($externalDns)/websignatureapigw `
        --from-literal=apigwdat_e=http://$($externalDns)/webdatabaseapigw `
        --from-literal=database_e=http://$($externalDns)/database-api `
        --from-literal=userutils_e=http://$($externalDns)/userutils-api `
        --from-literal=signature_e=http://$($externalDns)/signature-api `
        --from-literal=lexon_e=http://$($externalDns)/lexon-api `
        --from-literal=account_e=http://$($externalDns)/account-api `
        --from-literal=lexonapi_e=http://$($externalDns)/lexon-mysql-api' 

    ExecKube -cmd 'label configmap urls app=elefebvre'

    Write-Host "Deploying configuration from $configFile" -ForegroundColor Yellow
    ExecKube -cmd "create -f $configFile"

    Write-Host "Creating deployments with deployments-lef.yaml..." -ForegroundColor Yellow
    ExecKube -cmd 'create -f deployments-lef.yaml'

    # update deployments with the correct image (with tag and/or registry)
    $registryPath = ""
    if (-not [string]::IsNullOrEmpty($registry)) {
        $registryPath = "$registry/"
    }

    Write-Host "Update Image containers to use prefix '$registry$dockerOrg' and tag '$imageTag'" -ForegroundColor Yellow

    ExecKube -cmd 'set image deployments/lexon lexon=${registryPath}${dockerOrg}/lexon.api:$imageTag'
    ExecKube -cmd 'set image deployments/lexonmysql lexonmysql=${registryPath}${dockerOrg}/lexonmysql.api:$imageTag'
    ExecKube -cmd 'set image deployments/account account=${registryPath}${dockerOrg}/account.api:$imageTag'
    ExecKube -cmd 'set image deployments/centinela centinela=${registryPath}${dockerOrg}/centinela.api:$imageTag'
    ExecKube -cmd 'set image deployments/signature signature=${registryPath}${dockerOrg}/signature.api:$imageTag'
    ExecKube -cmd 'set image deployments/database database=${registryPath}${dockerOrg}/database.api:$imageTag'
    ExecKube -cmd 'set image deployments/webportalclient webportalclient=${registryPath}${dockerOrg}/webportalclient.api:$imageTag'
    ExecKube -cmd 'set image deployments/webgoogleclient webgoogleclient=${registryPath}${dockerOrg}/webgoogleclient:$imageTag'
    ExecKube -cmd 'set image deployments/webofficeclient webofficeclient=${registryPath}${dockerOrg}/webofficeclient:$imageTag'
    ExecKube -cmd 'set image deployments/weblexonclient weblexonclient=${registryPath}${dockerOrg}/weblexonclient:$imageTag'
    ExecKube -cmd 'set image deployments/webloginaddonlexon webloginaddonlexon=${registryPath}${dockerOrg}/webloginaddonlexon:$imageTag'
    ExecKube -cmd 'set image deployments/webimapclient webimapclient=${registryPath}${dockerOrg}/webimapclient:$imageTag'
	ExecKube -cmd 'set image deployments/websignatureclient websignatureclient=${registryPath}${dockerOrg}/websignatureclient:$imageTag'
    ExecKube -cmd 'set image deployments/webstatus webstatus=${registryPath}${dockerOrg}/webstatus:$imageTag'

    ExecKube -cmd 'set image deployments/apigwlex apigwlex=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
    ExecKube -cmd 'set image deployments/apigwacc apigwacc=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
	ExecKube -cmd 'set image deployments/apigwsig apigwsig=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
	ExecKube -cmd 'set image deployments/apigwcen apigwcen=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
	ExecKube -cmd 'set image deployments/apigwdat apigwdat=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'

    Write-Host "Execute rollout..." -ForegroundColor Yellow
    ExecKube -cmd 'rollout resume deployments/lexon'
    ExecKube -cmd 'rollout resume deployments/lexonmysql'
    ExecKube -cmd 'rollout resume deployments/account'
    ExecKube -cmd 'rollout resume deployments/centinela'
    ExecKube -cmd 'rollout resume deployments/signature'
    ExecKube -cmd 'rollout resume deployments/database'
    ExecKube -cmd 'rollout resume deployments/webportalclient'
    ExecKube -cmd 'rollout resume deployments/webgoogleclient'
    ExecKube -cmd 'rollout resume deployments/webofficeclient'
    ExecKube -cmd 'rollout resume deployments/weblexonclient'
    ExecKube -cmd 'rollout resume deployments/webloginaddonlexon'
    ExecKube -cmd 'rollout resume deployments/webimapclient'
	ExecKube -cmd 'rollout resume deployments/websignatureclient'
    ExecKube -cmd 'rollout resume deployments/webstatus'
    ExecKube -cmd 'rollout resume deployments/apigwlex'
    ExecKube -cmd 'rollout resume deployments/apigwacc'
	ExecKube -cmd 'rollout resume deployments/apigwsig'
	ExecKube -cmd 'rollout resume deployments/apigwcen'
	ExecKube -cmd 'rollout resume deployments/apigwdat'

    Write-Host "Adding/Updating ingress resource from ingress-lef.yalm..." -ForegroundColor Yellow
    ExecKube -cmd 'apply -f ingress-lef.yaml'

    Write-Host "WebPortal is exposed at http://$externalDns, WebStatus at http://$externalDns/webstatus" -ForegroundColor Green
}

Write-Host "-------------------END PROCESS-------------" -ForegroundColor Green