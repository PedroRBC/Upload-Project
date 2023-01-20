import { io } from "socket.io-client";
const socket = io.connect("https://pedrorbc.com", {
    path: '/socket/socket.io'
});
export default socket;