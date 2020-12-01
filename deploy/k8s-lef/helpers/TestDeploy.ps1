Param(
    [parameter(Mandatory=$false)][string]$urlListFile="c:\azure-devops\git\eShopOnContainers\k8s-LEF\helpers\TestLocalUrls.txt",
    [parameter(Mandatory=$false)][bool]$showResult=$true
)

#Place URL list file in the below path
$URLList = Get-Content $urlListFile -ErrorAction SilentlyContinue


#For every URL in the list
Foreach($Uri in $URLList) {
    if($Uri.Length -gt 0 -and $Uri[0] -ne "#"){
        if($Uri[0] -eq "#"){
            Write-Host "$Uri" -ForegroundColor Green 
        }else{

            try{
               #For proxy systems
               [System.Net.WebRequest]::DefaultWebProxy = [System.Net.WebRequest]::GetSystemWebProxy()
               [System.Net.WebRequest]::DefaultWebProxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials

               #Web request
               $req = [system.Net.WebRequest]::Create($uri)
               $res = $req.GetResponse()
            }catch {
                $res = $_.Exception.Response
            }
            $req = $null

            #Getting HTTP status code
            $int = [int]$res.StatusCode
            Write-Host "$int - $uri"
            
            if($showResult -eq $true -and $int -gt 0){
                Write-Host ("ContentLenght " + $res.ContentLength) -ForegroundColor Blue
            }

        #Disposing response if available
            if($res){
                $res.Dispose()
            }
        }
    }
}