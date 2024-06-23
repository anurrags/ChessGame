import { Square, PieceSymbol, Color } from "chess.js";
import "./board.css";
import { useState } from "react";

interface chessSquare {
  row: number;
  col: number;
}
const getAttackingSquares = (
  piece: string,
  color: string,
  row: number,
  col: number
): chessSquare[] | null => {
  const attackingSquares: chessSquare[] = [];
  switch (piece) {
    case "p":
      switch (color) {
        case "b":
          if (row === 1) return null;
          if (row === 7) {
            attackingSquares.push({ row: row - 1, col }, { row: row - 2, col });
          } else {
            attackingSquares.push({ row: row - 1, col });
          }
          break;
        case "w":
          if (row === 8) return null;
          if (row === 2) {
            attackingSquares.push({ row: row + 1, col }, { row: row + 2, col });
          } else {
            attackingSquares.push({ row: row + 1, col });
          }
          break;
        default:
          return null;
      }
      break;
  }
  return attackingSquares;
};

const convertToChessNotation = (row: number, col: number): string => {
  const chessColumn = String.fromCharCode("a".charCodeAt(0) + col);
  const chessRow = 8 - row;
  return `${chessColumn}${chessRow}`;
};

const ChessBoard = ({
  board,
  makeMove,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  makeMove: ({ from, to }: { from: string; to: string }) => void;
}) => {
  const [from, setFrom] = useState<string>("");
  const [attackSquare, setAttackerSquare] = useState<chessSquare[] | null>(
    null
  );

  const handleOnSquareClick = (
    i: number,
    j: number,
    el: {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null
  ) => {
    const square = convertToChessNotation(i, j);

    if (from === "" && board[i][j]?.square == null) {
      console.log("Select valid from square");
      return;
    }
    if (from === "" && el) {
      setAttackerSquare(getAttackingSquares(el.type, el.color, i, j));

      setFrom(square);
    } else {
      setFrom("");
      setAttackerSquare(null);
      const to = square;
      makeMove({ from, to });
    }
  };

  return (
    <div className="chessboard-container">
      <div className="chessboard-inner-container">
        {board.map((row, i) => {
          return (
            <div key={i} className="chessboard-row">
              {row.map((el, j) => {
                return (
                  <div
                    key={j}
                    className={`chessboard-square ${
                      (i + j) & 1 ? "light" : "dark"
                    }-square ${
                      attackSquare?.find((sq) => sq.row === i && sq.col === j)
                        ? "attack-square"
                        : "normal-square"
                    }`}
                    onClick={(e) => handleOnSquareClick(i, j, el)}
                  >
                    {el?.type && (
                      <img
                        src={`/chessPiece/${el.color === "w" ? "w" : "b"}${
                          el.type
                        }.png`}
                        alt={el.type}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
