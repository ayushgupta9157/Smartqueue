import { io } from "socket.io-client";

const socket = io("https://smartqueue-backend-vjuh.onrender.com");

export default socket;