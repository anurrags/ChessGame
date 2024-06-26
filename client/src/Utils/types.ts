export interface move {
  from: string;
  to: string;
  promotion?: string;
  roomId: string;
  user: string;
}

export interface chessSquare {
  row: number;
  col: number;
}

export interface pieceAttribute {
  piece: string;
  color: string;
  position: chessSquare;
}

export interface possibleMoves {
  movableSquare: chessSquare[];
  attackingSquares: chessSquare[];
}
