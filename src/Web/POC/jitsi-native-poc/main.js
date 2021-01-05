function startMeet() {
    if(
        document.getElementById("roomName").value 
        && document.getElementById("name").value
    ) {
        var domain = "meet-test.lefebvre.es";
        var options = {
            roomName: document.getElementById("roomName").value,
            width: '100%',
            height: '100%',
            parentNode: undefined,
            configOverwrite: {},
            userInfo: {
                displayName: document.getElementById("name").value
            },
            interfaceConfigOverwrite: {}
        }
        var api = new JitsiMeetExternalAPI(domain, options);
        var pass = document.getElementById("password").value;
        api.addEventListener('participantRoleChanged', function(event) {
         // when host has joined the video conference 
            if (event.role == 'moderator') {
                api.executeCommand('password', pass);
            }
            else {
                setTimeout(() => {
                // why timeout: I got some trouble calling event listeners without setting a timeout :)

                // when local user is trying to enter in a locked room 
                api.addEventListener('passwordRequired', () => {
                    api.executeCommand('password', pass);
                });

                // when local user has joined the video conference 
                api.addEventListener('videoConferenceJoined', (response) => {
                    setTimeout(function(){ api.executeCommand('password', pass);}, 300);
                });

                }, 10);
            }
        });
    } 
    document.getElementById("main").style.display = 'none';
}
