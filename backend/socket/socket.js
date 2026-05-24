const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });
  });
};

export default socketHandler;