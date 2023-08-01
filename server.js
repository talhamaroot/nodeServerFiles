const https = require('https');
const fs = require('fs');
const cors = require('cors');
const express = require('express');

const options = {
    key: fs.readFileSync('node_chat_server.pem'),
    cert: fs.readFileSync('self_signed_cert.pem')

};

const app = express();
const server = https.createServer(options, app);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true, });
app.use("/peerjs", peerServer);

// Enable CORS for all routes using the 'cors' middleware
app.use(cors());

const io = require('socket.io')(server, {
    cors: {
        origin: '*' // Replace '*' with the actual origin(s) of your client-side code
    }
});
let socketsStatus = [];
io.on("connection", function(socket) {
    const socketId = socket.id;
    socketsStatus[socket.id] = {};


    console.log("connect");
    socket.on("join-room", (roomId, userId) => {

        for (const id in socketsStatus) {
            if (socketsStatus[id].username == roomId && !socketsStatus[id].mute && socketsStatus[id].online) {

                console.log("run")
                    // socket.join(roomId);
                socket.broadcast.to(id).emit("user-connected", userId);
            }
        }
    });
    socket.on("voice", function(data, callerId) {

        var newData = data.split(";");
        newData[0] = "data:audio/ogg;";
        newData = newData[0] + newData[1];

        for (const id in socketsStatus) {

            if (socketsStatus[id].username == callerId && !socketsStatus[id].mute && socketsStatus[id].online) {

                socket.broadcast.to(id).emit("send", newData);
                console.log(callerId)
            }
        }

    });
    socket.on("video", function(data, callerId) {
        // console.log(data);
        // var newData = data.split(";");
        // newData[0] = "data:video/mp4;";
        // newData = newData[0] + newData[1];
        fs.appendFileSync('videoStream.mp4', data);
        for (const id in socketsStatus) {

            if (socketsStatus[id].username == callerId && !socketsStatus[id].mute && socketsStatus[id].online) {
                console.log(data)
                socket.broadcast.to(id).emit("send", data);
                console.log(callerId)
            }
        }

    });

    socket.on("userInformation", function(data) {
        socketsStatus[socketId] = data;

        io.sockets.emit("usersUpdate", socketsStatus);
        console.log("usersUpdate")
    });

    socket.on("requestCall", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("incomingCall", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("requestCallVideo", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("incomingCallVideo", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("callReject", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("callRejected", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("open_chat", function(data) {
        console.log(socket.id)
        socket.broadcast.to(socket.id).emit("messageReceive", socketsStatus[socket.id].username);
        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("openChat", socketsStatus[socketId].username);

            }
        }


    });
    socket.on("messageSend", function(data) {
        socket.broadcast.to(socket.id).emit("messageReceive", socketsStatus[socket.id].username);
        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("messageReceive", socketsStatus[socketId].username);


            }
        }


    });
    socket.on("checkStatus", function(data, callback) {
        var status = 0;
        callback = typeof callback == "function" ? callback : () => {};
        for (const id in socketsStatus) {


            // console.log(data);
            if (socketsStatus[id].username == data) {
                callback("Active Now");


            }
        }
        callback("Offline");



    });
    socket.on("callEnd", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("callEnded", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("stopCall", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {
                console.log(socketsStatus[socketId].username)

                socket.broadcast.to(id).emit("callStoped", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("callAccept", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("callAccepted", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });
    socket.on("callAcceptVideo", function(data) {

        for (const id in socketsStatus) {


            if (socketsStatus[id].username == data) {


                socket.broadcast.to(id).emit("callAcceptedVideo", socketsStatus[socketId].username);

            }
        }

        console.log("callRequestSend")
    });

    socket.on("disconnect", function() {
        delete socketsStatus[socketId];
    });

});

// Helper function to find the other user's socket id
function getOtherUser(currentSocketId) {
    const socketRooms = io.sockets.adapter.rooms;

    for (const [roomName, room] of socketRooms) {

        // Skip rooms that have more than one member (excluding the current user)
        if (roomName != currentSocketId) {
            return roomName;
        }
    }

    return null; // No other user connected
}











const port = 3000;
server.listen(port, () => {
    console.log('Server listening on port', port);
});