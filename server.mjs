import { createServer } from "node:http";

import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

global.io = null;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  global.io = io;
  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("join-room", ({ room }) => {
      if (!room || typeof room !== "string") return;

      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("leave-room", ({ room }) => {
      if (!room || typeof room !== "string") return;

      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });

    // Typing Indicators
    socket.on("typing", ({ room, user }) => {
      if (!room) return;
      socket.to(room).emit("typing", { user });
    });

    socket.on("stop-typing", ({ room }) => {
      if (!room) return;
      socket.to(room).emit("stop-typing");
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
