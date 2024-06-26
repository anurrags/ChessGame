import { Socket } from "socket.io";
import User from "../modals/User";

export interface gameRoom {
  player1: Socket;
  player2: Socket | null;
}

export interface move {
  from: string;
  to: string;
  promotion?: string;
  roomId: string;
  user: string;
}
