"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)("http://32.236.187.223:4019");
socket.on("connect", () => {
    console.log("Connected:", socket.id);
});
socket.on("preview-screen", (data) => {
    console.log(data);
});
