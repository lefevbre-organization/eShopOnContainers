Param(
    [parameter(Mandatory=$false)][string]$acrName,
    [parameter(Mandatory=$false)][string]$gitUser,
    [parameter(Mandatory=$false)][string]$repoName="eShopOnContainers",
    [parameter(Mandatory=$false)][string]$gitBranch="dev",
    [parameter(Mandatory=$true)][string]$patToken
)

$gitContext = "https://github.com/$gitUser/$repoName"

$services = @( 
    
    @{ Name="elefebvrewebstatus"; Image="elefebvreoncontainers/webstatuslef"; File="src/Web/WebStatuslef/Dockerfile" },
    
)

$services |% {
    $bname = $_.Name
    $bimg = $_.Image
    $bfile = $_.File
    Write-Host "Setting ACR build $bname ($bimg)"    
    az acr build-task create --registry $acrName --name $bname --image ${bimg}:$gitBranch --context $gitContext --branch $gitBranch --git-access-token $patToken --file $bfile
}

# Basket.API
