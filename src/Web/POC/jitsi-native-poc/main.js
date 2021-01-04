function startMeet() {
    var domain = "meet.jit.si";
    var options = {
        roomName: "JitsiMeetAPIExample",
        width: '100%',
        height: '100%',

        parentNode: undefined,
        configOverwrite: {},
        userInfo: {
            displayName: 'Joel'
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
