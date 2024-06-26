import { Square, Chess } from "chess.js";
import { chessSquare, pieceAttribute, possibleMoves } from "./types";
import { convertToChessNotation } from "./getChessNotation";

export const getAttackingSquares = (
  piece: pieceAttribute,
  chess: Chess
): possibleMoves => {
  switch (piece.piece) {
    case "p":
      return getPawnSquares(piece, chess);
    case "r":
      return getRookSquares(piece, chess);
    case "b":
      return getBishopSquares(piece, chess);
    case "n":
      return getKnightSquares(piece, chess);
    case "q":
      return getQueenSquares(piece, chess);
    case "k":
      return getKingSquares(piece, chess);
  }

  return { movableSquare: [], attackingSquares: [] };
};

const getPawnSquares = (piece: pieceAttribute, chess: Chess): possibleMoves => {
  const movableSquare: chessSquare[] = [];
  const attackingSquares: chessSquare[] = [];
  switch (piece.color) {
    case "b":
      if (piece.position.row === 7) return { movableSquare, attackingSquares };

      if (
        chess.get(
          convertToChessNotation(
            piece.position.row + 1,
            piece.position.col
          ) as Square
        )
      ) {
      } else if (
        piece.position.row === 1 &&
        !chess.get(
          convertToChessNotation(
            piece.position.row + 2,
            piece.position.col
          ) as Square
        )
      ) {
        movableSquare.push(
          { row: piece.position.row + 1, col: piece.position.col },
          { row: piece.position.row + 2, col: piece.position.col }
        );
      } else {
        movableSquare.push({
          row: piece.position.row + 1,
          col: piece.position.col,
        });
      }

      if (
        piece.position.col - 1 >= 0 &&
        chess.get(
          convertToChessNotation(
            piece.position.row + 1,
            piece.position.col - 1
          ) as Square
        ) &&
        chess.get(
          convertToChessNotation(
            piece.position.row + 1,
            piece.position.col - 1
          ) as Square
        ).color !== piece.color
      ) {
        attackingSquares.push({
          row: piece.position.row + 1,
          col: piece.position.col - 1,
        });
      }
      if (
        piece.position.col + 1 < 8 &&
        chess.get(
          convertToChessNotation(
            piece.position.row + 1,
            piece.position.col + 1
          ) as Square
        ) &&
        chess.get(
          convertToChessNotation(
            piece.position.row + 1,
            piece.position.col + 1
          ) as Square
        ).color !== piece.color
      ) {
        attackingSquares.push({
          row: piece.position.row + 1,
          col: piece.position.col + 1,
        });
      }
      break;
    case "w":
      if (piece.position.row === 0) return { movableSquare, attackingSquares };

      if (
        chess.get(
          convertToChessNotation(
            piece.position.row - 1,
            piece.position.col
          ) as Square
        )
      ) {
      } else if (
        piece.position.row === 6 &&
        !chess.get(
          convertToChessNotation(
            piece.position.row - 2,
            piece.position.col
          ) as Square
        )
      ) {
        movableSquare.push(
          { row: piece.position.row - 1, col: piece.position.col },
          { row: piece.position.row - 2, col: piece.position.col }
        );
      } else {
        movableSquare.push({
          row: piece.position.row - 1,
          col: piece.position.col,
        });
      }

      if (
        piece.position.col - 1 >= 0 &&
        chess.get(
          convertToChessNotation(
            piece.position.row - 1,
            piece.position.col - 1
          ) as Square
        ) &&
        chess.get(
          convertToChessNotation(
            piece.position.row - 1,
            piece.position.col - 1
          ) as Square
        ).color !== piece.color
      ) {
        attackingSquares.push({
          row: piece.position.row - 1,
          col: piece.position.col - 1,
        });
      }
      if (
        piece.position.col + 1 < 8 &&
        chess.get(
          convertToChessNotation(
            piece.position.row - 1,
            piece.position.col + 1
          ) as Square
        ) &&
        chess.get(
          convertToChessNotation(
            piece.position.row - 1,
            piece.position.col + 1
          ) as Square
        ).color !== piece.color
      ) {
        attackingSquares.push({
          row: piece.position.row - 1,
          col: piece.position.col + 1,
        });
      }
      break;
  }
  return { movableSquare, attackingSquares };
};

const getRookSquares = (piece: pieceAttribute, chess: Chess): possibleMoves => {
  const movableSquare: chessSquare[] = [];
  const attackingSquares: chessSquare[] = [];
  const directions = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ];

  for (const { row: rowStep, col: colStep } of directions) {
    for (
      let i = piece.position.row + rowStep, j = piece.position.col + colStep;
      i >= 0 && i < 8 && j >= 0 && j < 8;
      i += rowStep, j += colStep
    ) {
      const square = convertToChessNotation(i, j) as Square;
      const pieceAtSquare = chess.get(square);
      if (pieceAtSquare) {
        if (pieceAtSquare.color !== piece.color) {
          attackingSquares.push({ row: i, col: j });
        }
        break;
      }
      movableSquare.push({ row: i, col: j });
    }
  }

  return { movableSquare, attackingSquares };
};

const getBishopSquares = (
  piece: pieceAttribute,
  chess: Chess
): possibleMoves => {
  const movableSquare: chessSquare[] = [];
  const attackingSquares: chessSquare[] = [];
  const directions = [
    { row: 1, col: 1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
    { row: 1, col: -1 },
  ];

  for (const { row: rowStep, col: colStep } of directions) {
    for (
      let i = piece.position.row + rowStep, j = piece.position.col + colStep;
      i >= 0 && i < 8 && j >= 0 && j < 8;
      i += rowStep, j += colStep
    ) {
      const square = convertToChessNotation(i, j) as Square;
      const pieceAtSquare = chess.get(square);
      if (pieceAtSquare) {
        if (pieceAtSquare.color !== piece.color) {
          attackingSquares.push({ row: i, col: j });
        }
        break;
      }
      movableSquare.push({ row: i, col: j });
    }
  }

  return { movableSquare, attackingSquares };
};

const getQueenSquares = (
  piece: pieceAttribute,
  chess: Chess
): possibleMoves => {
  const rookSquares = getRookSquares(piece, chess);
  const bishopSquares = getBishopSquares(piece, chess);
  return {
    movableSquare: [
      ...rookSquares.movableSquare,
      ...bishopSquares.movableSquare,
    ],
    attackingSquares: [
      ...rookSquares.attackingSquares,
      ...bishopSquares.attackingSquares,
    ],
  };
};

const getKingSquares = (piece: pieceAttribute, chess: Chess) => {
  const movableSquare: chessSquare[] = [];
  const attackingSquares: chessSquare[] = [];
  const possibleMoves = [
    { row: piece.position.row + 1, col: piece.position.col },
    { row: piece.position.row - 1, col: piece.position.col },
    { row: piece.position.row, col: piece.position.col + 1 },
    { row: piece.position.row, col: piece.position.col - 1 },
    { row: piece.position.row + 1, col: piece.position.col + 1 },
    { row: piece.position.row + 1, col: piece.position.col - 1 },
    { row: piece.position.row - 1, col: piece.position.col + 1 },
    { row: piece.position.row - 1, col: piece.position.col - 1 },
  ];
  possibleMoves.forEach((move) => {
    if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
      if (chess.get(convertToChessNotation(move.row, move.col) as Square)) {
        if (
          chess.get(convertToChessNotation(move.row, move.col) as Square)
            .color !== piece.color
        ) {
          attackingSquares.push(move);
        }
      } else {
        movableSquare.push(move);
      }
    }
  });
  return { movableSquare, attackingSquares };
};

const getKnightSquares = (piece: pieceAttribute, chess: Chess) => {
  const movableSquare: chessSquare[] = [];
  const attackingSquares: chessSquare[] = [];
  const possibleMoves = [
    { row: piece.position.row + 2, col: piece.position.col + 1 },
    { row: piece.position.row + 2, col: piece.position.col - 1 },
    { row: piece.position.row - 2, col: piece.position.col + 1 },
    { row: piece.position.row - 2, col: piece.position.col - 1 },
    { row: piece.position.row + 1, col: piece.position.col + 2 },
    { row: piece.position.row + 1, col: piece.position.col - 2 },
    { row: piece.position.row - 1, col: piece.position.col + 2 },
    { row: piece.position.row - 1, col: piece.position.col - 2 },
  ];
  possibleMoves.forEach((move) => {
    if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
      if (chess.get(convertToChessNotation(move.row, move.col) as Square)) {
        if (
          chess.get(convertToChessNotation(move.row, move.col) as Square)
            .color !== piece.color
        ) {
          attackingSquares.push(move);
        }
      } else {
        movableSquare.push(move);
      }
    }
  });
  return { movableSquare, attackingSquares };
};
