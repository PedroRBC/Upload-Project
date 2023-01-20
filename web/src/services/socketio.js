import { io } from "socket.io-client";

import { SocketURL } from "./services-url";

const socket = io.connect(SocketURL, {
    path: '/socket/socket.io'
});
export default socket;