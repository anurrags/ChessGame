import { Socket } from "socket.io";

class User {
  userId: string;
  userName: string;
  socket: Socket;
  constructor(socket: Socket) {
    this.userId = "";
    this.userName = "";
    this.socket = socket;
  }
}
export default User;
