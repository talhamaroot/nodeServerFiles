const userStatus = {
    microphone: false,
    mute: false,
    username: $("#callingId").val(),
    online: false,
};





var socket = io("wss://54.174.47.233:3000");
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