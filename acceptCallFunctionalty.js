const userStatus = {
    microphone: false,
    mute: false,
    username: $("#callingId").val(),
    online: false,
};





var socket = io("wss://54.174.47.233:3000");
socket.on("error", function(error) {
    // Handle connection errors
    window.location = "https://54.174.47.233:3000";
});

socket.on("connect_error", function(error) {
    // Handle connection errors specifically
    window.location = "https://54.174.47.233:3000";
});
socket.emit("userInformation", userStatus);
socket.on("memberstatus", function(data) {
    console.log("talha")


});
socket.on("incomingCall", function(data) {
    console.log("IncomingCall from", data);
    $.ajax({
        url: "php/get_caller_data.php",
        type: "POST",
        data: { caller_id: data },
        success: function(response) {
            response = JSON.parse(response);
            $(".callerName").html(response['fname'] + " " + response['lname']);
            $('#callerImage').attr("src", "php/images/" + response['img']);

            $(".call-popup").show();
            $(document).on("click", ".decline_button", function(event) {
                $(".call-popup").hide();
                socket.emit("callReject", data);
            })
            $(document).on("click", ".accept_button", async function(event) {

                if ($(".accept_button").hasClass("end_call_accept")) {
                    await socket.emit("callAccept", data);

                    endCall(this);

                    setTimeout(() => {

                        window.location = "call.php?caller_id=" + data;
                    }, 1000)
                } else {
                    await socket.emit("callAccept", data);

                    setTimeout(() => {

                        window.location = "call.php?caller_id=" + data;
                    }, 1000)

                }
            })
        },
        error: function(xhr, status, error) {
            console.error("AJAX request failed: " + status + ", " + error);
        }
    });

});
socket.on("incomingCallVideo", function(data) {
    console.log("Incoming video call from", data);
    $.ajax({
        url: "php/get_caller_data.php",
        type: "POST",
        data: { caller_id: data },
        success: function(response) {
            response = JSON.parse(response);
            $(".callerName").html(response['fname'] + " " + response['lname']);
            $('#callerImage').attr("src", "php/images/" + response['img']);

            $(".call-popup").show();
            $(document).on("click", ".decline_button", function(event) {
                $(".call-popup").hide();
                socket.emit("callReject", data);
            })
            if ($(".accept_button").hasClass("end_call_accept")) {
                $(".accept_button").text("End & Accept Video Call");
            } else {
                $(".accept_button").text("Accept Video Call");
            }
            $(document).on("click", ".accept_button", async function(event) {

                if ($(".accept_button").hasClass("end_call_accept")) {
                    await socket.emit("callAcceptVideo", data);
                    endCall(this);
                    setTimeout(() => {

                        window.location = "videoCall.php?caller_id=" + data + "&sender=1";
                    }, 1000)
                } else {
                    await socket.emit("callAcceptVideo", data);
                    setTimeout(() => {

                        window.location = "videoCall.php?caller_id=" + data + "&sender=1";
                    }, 1000)
                }
            })
        },
        error: function(xhr, status, error) {
            console.error("AJAX request failed: " + status + ", " + error);
        }
    });

});
socket.on("callAccepted", function(data) {
    console.log("Call accepted by", data);
    setTimeout(() => {

        window.location = "call.php?caller_id=" + data;
    }, 1000)


});
socket.on("callAcceptedVideo", function(data) {
    console.log("Call accepted by", data);
    setTimeout(() => {

        window.location = "videoCall.php?caller_id=" + data + "&sender=1";
    }, 1000)


});
socket.on("callRejected", function(data) {
    console.log("Call rejected by", data);
    $(".call-sender-popup").hide();

});
socket.on("callEnded", function(data) {
    console.log("Call rejected by", data);
    $(".call-popup").hide();

});

$(document).ready(function(event) {
    $(document).on("click", ".callReqest", function(event) {
        var toUser = $(this).attr("data-uniqueId");
        socket.emit("requestCall", toUser);
        $.ajax({
            url: "php/get_caller_data.php",
            type: "POST",
            data: { caller_id: toUser },
            success: function(response) {
                response = JSON.parse(response);
                $(".callerSenderName").html(response['fname'] + " " + response['lname']);
                $('#callerSenderImage').attr("src", "php/images/" + response['img']);

                $(".call-sender-popup").show();
                $(document).on("click", ".decline_button", function(event) {
                    $(".call-sender-popup").hide();
                    socket.emit("callEnd", toUser);
                })

            },
            error: function(xhr, status, error) {
                console.error("AJAX request failed: " + status + ", " + error);
            }
        });

    })
    $(document).on("click", ".callReqestVideo", function(event) {
        var toUser = $(this).attr("data-uniqueId");
        socket.emit("requestCallVideo", toUser);
        $.ajax({
            url: "php/get_caller_data.php",
            type: "POST",
            data: { caller_id: toUser },
            success: function(response) {
                response = JSON.parse(response);
                $(".callerSenderName").html(response['fname'] + " " + response['lname']);
                $('#callerSenderImage').attr("src", "php/images/" + response['img']);

                $(".call-sender-popup").show();
                $(document).on("click", ".decline_button", function(event) {
                    $(".call-sender-popup").hide();
                    socket.emit("callEnd", toUser);
                })

            },
            error: function(xhr, status, error) {
                console.error("AJAX request failed: " + status + ", " + error);
            }
        });

    })
})


setInterval(async() => {

        var data = $("#checkOnline").text();

        socket.emit("checkStatus", data, (response) => {
            $(".member_status").text(response);
        });
    },
    500)


function emitUserInformation() {
    socket.emit("userInformation", userStatus);
}







const form = document.querySelector(".typing-area"),
    // incoming_id = form.querySelector(".incoming_id").value,
    inputField = form.querySelector(".input-field"),
    sendBtn = form.querySelector(".send_btn"),
    attachment = form.querySelector(".first_btn"),
    attachment_file = form.querySelector(".attachment"),
    chatBox = document.querySelector(".chat-box"),
    micro_phone = document.querySelector(".micro_phone");

attachment_preview = document.querySelector(".attachment-preview");

form.onsubmit = (e) => {
    e.preventDefault();
}

inputField.focus();
inputField.onkeyup = () => {
    if (inputField.value != "" || attachment_file.value != "") {
        sendBtn.classList.add("active");
    } else {
        sendBtn.classList.remove("active");
    }
}

sendBtn.onclick = () => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/insert-chat.php", true);
    if (inputField.value == "") {
        inputField.value = "  ";
    }
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                inputField.value = "";
                attachment_file.value = "";
                attachment_preview.innerHTML = "";

                var user_id = $(".get_user_chat").attr("data-user_id");
                sendBtn.classList.remove("active");
                socket.emit("messageSend", user_id);

                setTimeout(() => {

                    scrollToBottom();
                }, 500);
            }
        }
    }
    let formData = new FormData(form);
    xhr.send(formData);

}
socket.on("messageReceive", function(data) {
    getChat();
    getSeen();
    getUserData();


});
attachment.onclick = () => {

    attachment_file.click();
}
attachment_file.onchange = function(event) {
    attachment_preview.innerHTML = "";
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.split("/")[0]; // Extract the file type (e.g., "image", "video", "audio", "application")

        // Create the appropriate preview element based on the file type
        let previewElement;
        if (fileType === "image") {
            previewElement = document.createElement("img");
            previewElement.classList.add("preview-element-img");
            // Add CSS styles to style the image preview
        } else if (fileType === "video") {
            previewElement = document.createElement("video");
            previewElement.classList.add("preview-element-video");
            // Add CSS styles to style the video preview
        } else if (fileType === "audio") {
            previewElement = document.createElement("audio");
            previewElement.classList.add("preview-element-audio");
            // Add CSS styles to style the audio preview
        } else if (fileType === "application" && file.type === "application/pdf") {
            previewElement = document.createElement("iframe");
            previewElement.classList.add("preview-element-iframe");
            // Add CSS styles to style the PDF preview
        } else {
            alert("Input Format Is not correct you can choose and Image , audio , video or PDF file");
            attachment_file.value = "";
            continue;
        }
        if (inputField.value != "" || attachment_file.value != "") {
            sendBtn.classList.add("active");
        } else {
            sendBtn.classList.remove("active");
        }

        previewElement.setAttribute("controls", "controls"); // Add controls for audio and video previews
        previewElement.setAttribute("src", URL.createObjectURL(file));

        attachment_preview.appendChild(previewElement);
    }
}

chatBox.onmouseenter = () => {
    chatBox.classList.add("active");
}

chatBox.onmouseleave = () => {
    chatBox.classList.remove("active");
}

function getChat() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/get-chat.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                try {
                    let data = JSON.parse(xhr.response);

                    if (data.output != "") {
                        chatBox.innerHTML = chatBox.innerHTML + data.output;
                        if (document.querySelector(".msg_id").innerHTML == 0) {
                            scrollToBottom();
                        }
                        document.querySelector(".msg_id").innerHTML = data.msg_id;
                        if (!chatBox.classList.contains("active")) {
                            // scrollToBottom();
                        }
                        $(".gallery_popup").magnificPopup({
                            type: "image",
                            gallery: {
                                enabled: true,
                                tCounter: "%curr% of %total%"
                            },
                            removalDelay: 300,
                            mainClass: "mfp-fade"
                        });
                        // $(".gallery_popup_video").magnificPopup({
                        //     type: "iframe",
                        //     gallery: {
                        //         enabled: true,
                        //         tCounter: "%curr% of %total%"
                        //     },
                        //     removalDelay: 300,
                        //     mainClass: "mfp-fade"
                        // });


                        function generateVideoThumbnail(videoElement, thumbnailElement) {
                            // Create a canvas element
                            const canvas = document.createElement("canvas");
                            videoElement.addEventListener("loadedmetadata", function() {

                                canvas.width = videoElement.videoWidth;
                                canvas.height = videoElement.videoHeight;
                                videoElement.currentTime = 0.5;
                                // Draw the first frame of the video onto the canvas

                            })
                            videoElement.addEventListener('timeupdate', function() {

                                canvas.getContext("2d").drawImage(videoElement, 0, 0, canvas.width, canvas.height);


                                // Set the thumbnail image source to the data URL of the canvas
                                thumbnailElement.src = canvas.toDataURL();
                            });
                        }

                        // Find all video elements and generate thumbnails for each
                        const videoElements = document.querySelectorAll(".video-element");
                        const thumbnailElements = document.querySelectorAll(".video-thumbnail");

                        for (let i = videoElements.length - 1; i >= 0; i--) {
                            generateVideoThumbnail(videoElements[i], thumbnailElements[i]);
                        }
                        $('.gallery_popup_video').fancybox({

                            buttons: [
                                'zoom',
                                'share',
                                'slideShow',
                                // 'fullScreen',
                                'download',
                                'thumbs',
                                'close'
                            ],
                        });
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else {
                console.error("Request failed with status:", xhr.status);
            }
        }
    };

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("incoming_id=" + document.querySelector(".incoming_id").value + "&msg_id=" + document.querySelector(".msg_id").innerHTML);
}

function getSeen() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/get-status.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                try {
                    let data = JSON.parse(xhr.response);
                    for (const key in data) {
                        // console.log(data[key]);
                        if (data[key] == 1) {

                            document.getElementById(key).innerHTML = "&nbsp;&nbsp;Seen";
                        }
                    }
                    // console.log(data);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else {
                console.error("Request failed with status:", xhr.status);
            }
        }
    };

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("incoming_id=" + document.querySelector(".incoming_id").value);
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}



// Event listener for the record button
let mediaRecorder;
let chunks = [];
micro_phone.addEventListener('click', async function() {

    // Access the user's microphone

    if (!mediaRecorder) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                // Create a new MediaRecorder instance
                mediaRecorder = new MediaRecorder(stream);

                // Event handler when the recording starts
                mediaRecorder.onstart = function() {
                    chunks = [];
                };

                // Event handler for recording data
                mediaRecorder.ondataavailable = function(event) {
                    chunks.push(event.data);
                };

                // Event handler when the recording stops
                mediaRecorder.onstop = function() {
                    // Create a new Blob with the recorded data
                    const blob = new Blob(chunks, { type: 'audio/webm' });

                    // Create a File object from the Blob
                    const recordedFile = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });

                    // Create a DataTransfer object to simulate drag-and-drop
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(recordedFile);

                    // Assign the DataTransfer object's files to the input element

                    attachment_file.files = dataTransfer.files;
                    let files = dataTransfer.files;
                    attachment_preview.innerHTML = "";
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fileType = file.type.split("/")[0]; // Extract the file type (e.g., "image", "video", "audio", "application")

                        // Create the appropriate preview element based on the file type
                        let previewElement;
                        if (fileType === "image") {
                            previewElement = document.createElement("img");
                            previewElement.classList.add("preview-element-img");
                            // Add CSS styles to style the image preview
                        } else if (fileType === "video") {
                            previewElement = document.createElement("video");
                            previewElement.classList.add("preview-element-video");
                            // Add CSS styles to style the video preview
                        } else if (fileType === "audio") {
                            previewElement = document.createElement("audio");
                            previewElement.classList.add("preview-element-audio");
                            // Add CSS styles to style the audio preview
                        } else if (fileType === "application" && file.type === "application/pdf") {
                            previewElement = document.createElement("iframe");
                            previewElement.classList.add("preview-element-iframe");
                            // Add CSS styles to style the PDF preview
                        } else {
                            alert("Input Format Is not correct you can choose and Image , audio , video or PDF file");
                            attachment_file.value = "";
                            continue;
                        }

                        previewElement.setAttribute("controls", "controls"); // Add controls for audio and video previews
                        previewElement.setAttribute("src", URL.createObjectURL(file));

                        attachment_preview.appendChild(previewElement);
                    }
                    if (inputField.value != "" || attachment_file.value != "") {
                        sendBtn.classList.add("active");
                    } else {
                        sendBtn.classList.remove("active");
                    }
                    // Handle the recorded audio file, e.g., upload it to the server
                    console.log('Recorded audio blob:', blob);
                };
            })
            .catch(function(error) {
                console.error('Error accessing the microphone:', error);
            });
        if (!mediaRecorder) {
            console.error('MediaRecorder not initialized.');
            return;
        }
    }

    if (mediaRecorder.state === 'inactive') {
        // Start recording
        mediaRecorder.start();
        this.innerHTML = '<i class="fas fa-voicemail"></i>';
    } else {
        // Stop recording
        mediaRecorder.stop();
        this.innerHTML = '<i class="fas fa-microphone"></i>';
    }

});
$(document).ready(function() {
    // Function to add a new chat message to the chat-messages div


    // Bind the updateSeekBar function to the timeupdate event of all audio elements
    setInterval(() => {

        recalculateAudioTime()

    }, 500)
});



const searchBar = document.querySelector(".search input"),
    searchIcon = document.querySelector(".search button"),
    usersList = document.querySelector(".users-list");

searchIcon.onclick = () => {
    searchBar.classList.toggle("show");
    searchIcon.classList.toggle("active");
    searchBar.focus();
    if (searchBar.classList.contains("active")) {
        searchBar.value = "";
        searchBar.classList.remove("active");
    }
}

searchBar.onkeyup = () => {
    let searchTerm = searchBar.value;
    if (searchTerm != "") {
        searchBar.classList.add("active");
    } else {
        searchBar.classList.remove("active");
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "php/search.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = xhr.response;
                usersList.innerHTML = data;
            }
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("searchTerm=" + searchTerm);
}

function getUserData() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "php/users.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = xhr.response;
                if (!searchBar.classList.contains("active")) {
                    usersList.innerHTML = data;
                }
            }
        }
    }
    xhr.send();
}


$(document).on("click", ".back_to_user", function(event) {
    $(".chat-wrapper").addClass("mobile_hide");
    $(".chat-wrapper").removeClass("mobile_show");
    $(".wrapper").addClass("mobile_show");
    $(".wrapper").removeClass("mobile_hide");
    $(".chat-area").addClass("hide");
});
$(document).on("click", ".back_to_user_chat", function(event) {
    $(".attachment-wrapper").addClass("hide");


    $(".chat-wrapper").removeClass("hide");

});
socket.on("openChat", function(data) {
    getChat();
    getSeen();
    getUserData();

});
getUserData();
$(document).on("click", ".get_user_chat", function(event) {
    var user_id = $(this).attr("data-user_id");

    $.ajax({
        url: "php/get_user_data.php",
        type: "POST",
        data: { user_id: user_id },
        success: function(response) {
            socket.emit("open_chat", user_id);
            $(".get-header").html(response)
            $(".msg_id").html(0)
            $(".incoming_id").val(user_id)
            $("#checkOnline").text(user_id)
            $(".chat-area").removeClass("hide");
            $(".chat-box").html("");
            $(".chat-wrapper").removeClass("mobile_hide");
            $(".chat-wrapper").addClass("mobile_show");
            $(".wrapper").removeClass("mobile_show");
            $(".wrapper").addClass("mobile_hide");
            $(".attachment-wrapper").addClass("hide");
            $(".chat-wrapper").removeClass("hide");
            $(".attachment-box").html("");



        },
        error: function(xhr, status, error) {
            console.error("AJAX request failed: " + status + ", " + error);
        }
    });
});
$(document).on("click", ".member_name , .member_status", function(event) {
    var user_id = $(this).attr("data-user_id");

    $.ajax({
        url: "php/get_user_data.php",
        type: "POST",
        data: { user_id: user_id, flag: 0 },
        success: function(response) {
            $(".attachment-wrapper .get-header").html(response)

            $(".attachment-wrapper").removeClass("hide");
            $(".chat-wrapper").addClass("hide");
            $(".attachment-box").html("");


            $.ajax({
                url: "php/get_user_attachment.php",
                type: "POST",
                data: { user_id: user_id },
                success: function(response) {
                    $(".attachment-box").html(response);

                    function generateVideoThumbnail(videoElement, thumbnailElement) {
                        // Create a canvas element
                        const canvas = document.createElement("canvas");
                        videoElement.addEventListener("loadedmetadata", function() {

                            canvas.width = videoElement.videoWidth;
                            canvas.height = videoElement.videoHeight;
                            videoElement.currentTime = 0.5;
                            // Draw the first frame of the video onto the canvas

                        })
                        videoElement.addEventListener('timeupdate', function() {

                            canvas.getContext("2d").drawImage(videoElement, 0, 0, canvas.width, canvas.height);


                            // Set the thumbnail image source to the data URL of the canvas
                            thumbnailElement.src = canvas.toDataURL();
                        });
                    }

                    // Find all video elements and generate thumbnails for each
                    const videoElements = document.querySelectorAll(".video-element");
                    const thumbnailElements = document.querySelectorAll(".video-thumbnail");

                    for (let i = videoElements.length - 1; i >= 0; i--) {
                        generateVideoThumbnail(videoElements[i], thumbnailElements[i]);
                    }
                    $('.gallery_popup_video').fancybox({

                        buttons: [
                            'zoom',
                            'share',
                            'slideShow',
                            // 'fullScreen',
                            'download',
                            'thumbs',
                            'close'
                        ],
                    });

                },
                error: function(xhr, status, error) {
                    console.error("AJAX request failed: " + status + ", " + error);
                }
            });

        },
        error: function(xhr, status, error) {
            console.error("AJAX request failed: " + status + ", " + error);
        }
    });
})