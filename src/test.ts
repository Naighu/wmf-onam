import { io } from "socket.io-client";

const socket = io("http://localhost:4019");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("preview-screen", (data) => {
  console.log(data);
});