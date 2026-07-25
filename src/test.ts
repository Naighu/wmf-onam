import { io } from "socket.io-client";

const socket = io("http://32.236.187.223:4019");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("competition-live", (data) => {
  console.log(data);
});