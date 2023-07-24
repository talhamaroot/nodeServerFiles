const userStatus_phone = {
    microphone: true,
    mute: false,
    username: $("#callingId").val(),
    online: true,
};




window.onload = (e) => {
    mainFunction(500);
};

var socket = io("wss://192.168.1.6:3000");
socket.emit("userInformation", userStatus_phone);


function mainFunction(time) {


    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        var madiaRecorder = new MediaRecorder(stream);
        madiaRecorder.start();

        var audioChunks = [];

        madiaRecorder.addEventListener("dataavailable", function(event) {
            audioChunks.push(event.data);
        });

        madiaRecorder.addEventListener("stop", function() {
            var audioBlob = new Blob(audioChunks);

            audioChunks = [];

            var fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onloadend = function() {
                if (!userStatus_phone.microphone || !userStatus_phone.online) return;

                var base64String = fileReader.result;
                socket.emit("voice", base64String, $("#phoneCallid").val());

            };

            madiaRecorder.start();


            setTimeout(function() {
                madiaRecorder.stop();
            }, time);
        });

        setTimeout(function() {
            madiaRecorder.stop();
        }, time);
        socket.on("send", function(data) {

            var audio = new Audio(data);



            audio.play();
        });
    });

    socket.on("callStoped", function(data) {
        console.log("callstops");
        window.location = "users.php";

    });


    socket.on("usersUpdate", function(data) {

    });

}



function changeUsername() {
    userStatus_phone.username = usernameInput.value;
    usernameLabel.innerText = userStatus_phone.username;
    usernameDiv.style.display = "none";
    usernameLabel.style.display = "block";
    emitUserInformation();
}

function toggleConnection(e) {
    userStatus_phone.online = !userStatus_phone.online;

    editButtonClass(e, userStatus_phone.online);
    emitUserInformation();
}

function toggleMute(e) {
    userStatus_phone.mute = !userStatus_phone.mute;
    userStatus_phone.microphone = !userStatus_phone.microphone;
    $(".mute_button").toggleClass("active")
    emitUserInformation();
}

function endCall(e) {
    var data = $(".call_end").attr("data-callerid");

    socket.emit("stopCall", data);
    window.location = "users.php";
}


function toggleMicrophone(e) {


    emitUserInformation();
}


function editButtonClass(target, bool) {
    const classList = target.classList;
    classList.remove("enable-btn");
    classList.remove("disable-btn");

    if (bool)
        return classList.add("enable-btn");

    classList.add("disable-btn");
}

function emitUserInformation() {
    socket.emit("userInformation", userStatus_phone);
}