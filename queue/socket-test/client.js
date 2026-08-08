const { io } = require("socket.io-client");


const socket = io("http://localhost:5000");


socket.on("connect", ()=>{

    console.log("Connected:", socket.id);


    socket.emit(
        "joinRoom",
        "6a51e648a04522242bc10ed1"
    );

});


socket.on("queueUpdated",(data)=>{
    console.log("Queue Changed");
    console.log(data);
});