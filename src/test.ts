import { io } from "socket.io-client";

const socket = io("http://localhost:4019",{extraHeaders: {
    connection_type: "user",
    "token": "9PGpDesRzRoiOnJ4Igucw69Z",
  },});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("preview-screen", (data) => {
  console.log(data);
});

socket.on("competition-live", (data)=> {
    console.log(data);
})