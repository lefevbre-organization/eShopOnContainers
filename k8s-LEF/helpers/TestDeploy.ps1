Param(
    [parameter(Mandatory=$false)][string]$URLListFile="c:\azure-devops\git\eShopOnContainers\k8s-LEF\helpers\TestLocalUrls.txt",
    [parameter(Mandatory=$false)][bool]$deployCI=$false
)

#Place URL list file in the below path
$URLList = Get-Content $URLListFile -ErrorAction SilentlyContinue

# Initialization
$location = (Get-Location)
Write-Host "The path of execution: $location" -ForegroundColor Red 

if (-not [string]::IsNullOrEmpty($execPath)) {
    Set-Location -Path $execPath -Verbose
    Write-Host "The path of execution is set to: $execPath" -ForegroundColor Yellow 
}


#For every URL in the list
Foreach($Uri in $URLList) {
    try{
        #For proxy systems
        [System.Net.WebRequest]::DefaultWebProxy = [System.Net.WebRequest]::GetSystemWebProxy()
        [System.Net.WebRequest]::DefaultWebProxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials

        #Web request
        $req = [system.Net.WebRequest]::Create($uri)
        $res = $req.GetResponse()
    }catch {
        #Err handling
        $res = $_.Exception.Response
    }
    $req = $null

    #Getting HTTP status code
    $int = [int]$res.StatusCode

    #Writing on the screen
    Write-Host "$int - $uri"

    #Disposing response if available
    if($res){
        $res.Dispose()
    }
}