function makeGraphApiCall(accessToken) {
    console.log('accessToken', accessToken);
    $.ajax(

        {
            type: "GET", 
            url: "/getuserdata",
            headers: {"access_token": accessToken },
            cache: false
        }

    )
    .done(function (response) {

        writeDataToOfficeDocument(response)
        .then(function () { 
            showMessage("Your data has been added to the document."); 
        })
        .catch(function (error) {        
            showMessage(error);
        });

    })
    .fail(function (errorResult) {
        showMessage("Error from Microsoft Graph: " + JSON.stringify(errorResult));
    });
}