Param(
    [parameter(Mandatory=$false)][string]$registry=$null,
    [parameter(Mandatory=$false)][string]$dockerUser="avalverdelefebvre",
    [parameter(Mandatory=$false)][string]$dockerPassword="Alberto1971.-",
    [parameter(Mandatory=$false)][string]$dockerOrg="elefebvreoncontainers",
    [parameter(Mandatory=$false)][bool]$cleanDocker=$true,
    [parameter(Mandatory=$false)][string]$execPath,
    [parameter(Mandatory=$false)][string]$kubeconfigPath,
    [parameter(Mandatory=$false)][string]$configFile,
    [parameter(Mandatory=$false)][string[]]$servicesToPush=("webportalclient", "webgoogleclient", "webofficeclient", "weblexonclient", "webimapclient", "account.api", "lexon.api","lexon.mysql.api", "ocelotapigw", "webstatus"),
    [parameter(Mandatory=$false)][string]$imageTag="linux-dev",
    [parameter(Mandatory=$false)][bool]$deployKubernetes=$false,
    [parameter(Mandatory=$false)][bool]$deployInfrastructure=$false,
    [parameter(Mandatory=$false)][bool]$buildImages=$true,
    [parameter(Mandatory=$false)][bool]$buildAll=$false,
    [parameter(Mandatory=$false)][bool]$pushImages=$true,
    [parameter(Mandatory=$false)][bool]$deployCI=$false,
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
    
    $env:TAG=$imageTag
    if($buildAll){
        Write-Host "Building All Docker images tagged with '$imageTag'" -ForegroundColor DarkBlue
        docker-compose -p .. -f ../docker-compose.yml build      
    }else{

        foreach ($service in $servicesToPush) {
            Write-Host "Building Docker image '$service' tagged with '$imageTag'" -ForegroundColor DarkBlue
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

    ExecKube "create configmap ocelot --from-file=mm=ocelot/configuration-web-account.json --from-file=ws=ocelot/configuration-web-lexon.json "
    ExecKube -cmd "apply -f ocelot/deployment-lef.yaml"
    ExecKube -cmd "apply -f ocelot/service-lef.yaml"

    Write-Host 'Deploying code deployments (Web APIs, Web apps, ...)' -ForegroundColor Yellow
    Write-Host "Create services-lef.yaml" -ForegroundColor Red
    ExecKube -cmd 'create -f services-lef.yaml'

    Write-Host "Create internalurls-lef.yaml" -ForegroundColor Red
    ExecKube -cmd 'create -f internalurls-lef.yaml'

    Write-Host "Create configmap urls" -ForegroundColor Red
    ExecKube -cmd 'create configmap urls `
        --from-literal=weblexonapigw_e=http://$($externalDns)/weblexonapigw `
        --from-literal=webaccountapigw_e=http://$($externalDns)/webaccountapigw `
        --from-literal=lexon_e=http://$($externalDns)/lexon-api `
        --from-literal=account_e=http://$($externalDns)/account-api `
        --from-literal=lexonapi_e=http://$($externalDns)/lexon-mysql-api `
        --from-literal=ordering_e=http://$($externalDns)/ordering-api' 

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

    ExecKube -cmd 'set image deployments/basket basket=${registryPath}${dockerOrg}/basket.api:$imageTag'
    ExecKube -cmd 'set image deployments/catalog catalog=${registryPath}${dockerOrg}/catalog.api:$imageTag'
    ExecKube -cmd 'set image deployments/identity identity=${registryPath}${dockerOrg}/identity.api:$imageTag'
    ExecKube -cmd 'set image deployments/ordering ordering=${registryPath}${dockerOrg}/ordering.api:$imageTag'
    ExecKube -cmd 'set image deployments/ordering-backgroundtasks ordering-backgroundtasks=${registryPath}${dockerOrg}/ordering.backgroundtasks:$imageTag'
    ExecKube -cmd 'set image deployments/marketing marketing=${registryPath}${dockerOrg}/marketing.api:$imageTag'
    ExecKube -cmd 'set image deployments/locations locations=${registryPath}${dockerOrg}/locations.api:$imageTag'
    ExecKube -cmd 'set image deployments/payment payment=${registryPath}${dockerOrg}/payment.api:$imageTag'
    ExecKube -cmd 'set image deployments/webmvc webmvc=${registryPath}${dockerOrg}/webmvc:$imageTag'
    ExecKube -cmd 'set image deployments/webstatus webstatus=${registryPath}${dockerOrg}/webstatus:$imageTag'
    ExecKube -cmd 'set image deployments/webspa webspa=${registryPath}${dockerOrg}/webspa:$imageTag'
    ExecKube -cmd 'set image deployments/ordering-signalrhub ordering-signalrhub=${registryPath}${dockerOrg}/ordering.signalrhub:$imageTag'

    ExecKube -cmd 'set image deployments/mobileshoppingagg mobileshoppingagg=${registryPath}${dockerOrg}/mobileshoppingagg:$imageTag'
    ExecKube -cmd 'set image deployments/webshoppingagg webshoppingagg=${registryPath}${dockerOrg}/webshoppingagg:$imageTag'

    ExecKube -cmd 'set image deployments/apigwmm apigwmm=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
    ExecKube -cmd 'set image deployments/apigwms apigwms=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
    ExecKube -cmd 'set image deployments/apigwwm apigwwm=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'
    ExecKube -cmd 'set image deployments/apigwws apigwws=${registryPath}${dockerOrg}/ocelotapigw:$imageTag'

    Write-Host "Execute rollout..." -ForegroundColor Yellow
    ExecKube -cmd 'rollout resume deployments/basket'
    ExecKube -cmd 'rollout resume deployments/catalog'
    ExecKube -cmd 'rollout resume deployments/identity'
    ExecKube -cmd 'rollout resume deployments/ordering'
    ExecKube -cmd 'rollout resume deployments/ordering-backgroundtasks'
    ExecKube -cmd 'rollout resume deployments/marketing'
    ExecKube -cmd 'rollout resume deployments/locations'
    ExecKube -cmd 'rollout resume deployments/payment'
    ExecKube -cmd 'rollout resume deployments/webmvc'
    ExecKube -cmd 'rollout resume deployments/webstatus'
    ExecKube -cmd 'rollout resume deployments/webspa'
    ExecKube -cmd 'rollout resume deployments/mobileshoppingagg'
    ExecKube -cmd 'rollout resume deployments/webshoppingagg'
    ExecKube -cmd 'rollout resume deployments/apigwmm'
    ExecKube -cmd 'rollout resume deployments/apigwms'
    ExecKube -cmd 'rollout resume deployments/apigwwm'
    ExecKube -cmd 'rollout resume deployments/apigwws'
    ExecKube -cmd 'rollout resume deployments/ordering-signalrhub'

    Write-Host "Adding/Updating ingress resource..." -ForegroundColor Yellow
    ExecKube -cmd 'apply -f ingress.yaml'

    Write-Host "WebSPA is exposed at http://$externalDns, WebMVC at http://$externalDns/webmvc, WebStatus at http://$externalDns/webstatus" -ForegroundColor Yellow
}

Write-Host "-------------------END PROCESS-------------" -ForegroundColor Green