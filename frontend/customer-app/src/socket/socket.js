import { io } from "socket.io-client";

const socket = io("http://localhost:5007");

export default socket;