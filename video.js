const userStatus_phone = {
    microphone: true,
    mute: false,
    username: $("#callingId").val(),
    online: true,
};






var socket = io("wss://192.168.8.102:3000");
socket.emit("userInformation", userStatus_phone);
const videoGrid = document.getElementById("video-grid");
const video = document.createElement("video");
video.classList.add("otherClientVideo");
const myVideo = document.createElement("video");
myVideo.muted = true;
myVideo.classList.add("myVideo");
const peer = new Peer(undefined, { path: "/peerjs", host: "192.168.8.102", port: "3000", });
var flag = 1;
let myVideoStream;
navigator.mediaDevices.getUserMedia({ audio: true, video: true, }).then((stream) => {
    console.log("reached")

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
        call.answer(stream);
        $(".loading").text("")
        flag = 0;
        call.on("stream", (userVideoStream) => { addVideoStream(video, userVideoStream); });
    });
    socket.on("user-connected", (userId) => { connectToNewUser(userId, stream); });

});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    call.on("stream", (userVideoStream) => { addVideoStream(video, userVideoStream); });
    $(".loading").text("")
    setTimeout(() => {

        if (flag == 1) {
            const call = peer.call(userId, stream)
            call.on("stream", (userVideoStream) => { addVideoStream(video, userVideoStream); });
            $(".loading").text("")

        } else {
            location.reload()
        }
    }, 1000);

};
peer.on("open", (id) => {
    console.log("run")
    socket.emit("join-room", $("#phoneCallid").val(), id);
});
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};

socket.on("callStoped", function(data) {
    console.log("callstops");

    window.location = "users.php";

});


socket.on("usersUpdate", function(data) {

});


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
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;

    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;

    }
    $(".mute_button").toggleClass("active")
    emitUserInformation();
}

function toggleVideo(e) {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;

    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;

    }
    $(".video_button").toggleClass("active")
    emitUserInformation();
}

function endCall(e) {
    var data = $(".call_end").attr("data-callerid");

    socket.emit("stopCall", data);
    setTimeout(() => {

            window.location = "users.php";
        },
        500)
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

// Socket event listener
socket.on('send', async function(data) {
    if (data && data.byteLength > 0) {
        // Convert the binary stream data to a Blob object
        const blob = new Blob([data], { type: 'video/mp4' });

        // Create an object URL from the Blob
        const videoURL = URL.createObjectURL(blob);

        // Set the object URL as the source for the video player
        $("#videoPlayer").attr("src", videoURL);
        // videoPlayer.src = videoURL;
    }
});

function emitUserInformation() {
    socket.emit("userInformation", userStatus_phone);
}