import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

// Authenticate connection (optional: use JWT userId)
export const joinUserRoom = (userId: string) => {
    
  socket.emit("join", { userId });
};

export default socket;
