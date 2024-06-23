import { io, Socket } from "socket.io-client";

class Connection {
  public socket: Socket;
  constructor(url: string) {
    this.socket = io(url);
  }
}
export default Connection;
