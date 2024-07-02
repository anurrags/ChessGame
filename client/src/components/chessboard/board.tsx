import { Square, PieceSymbol, Color, Chess } from "chess.js";
import "./board.css";
import { useEffect, useState } from "react";
import { chessSquare, possibleMoves } from "../../Utils/types";
import { getAttackingSquares } from "../../Utils/getAttackingSquare";
import { convertToChessNotation } from "../../Utils/getChessNotation";
import { Socket } from "socket.io-client";

const ChessBoard = ({
  board,
  makeMove,
  chess,
  color,
  socket,
  kingCheckSquare,
  roomId,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  makeMove: ({
    from,
    to,
    promotion,
  }: {
    from: string;
    to: string;
    promotion?: string;
  }) => void;
  chess: Chess;
  color: string;
  socket: Socket | null;
  kingCheckSquare: chessSquare | null;
  roomId: string;
}) => {
  const [pieceToMove, setPieceToMove] = useState<{
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null>(null);
  const [from, setFrom] = useState<string>("");
  const [movableSquare, setMovableSquare] = useState<chessSquare[] | null>(
    null
  );
  const [attackSquare, setAttackerSquare] = useState<chessSquare[] | null>(
    null
  );
  const [checkSquare, setChecksquare] = useState<chessSquare | null>(null);

  const handleOnSquareClick = (
    i: number,
    j: number,
    el: {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null
  ) => {
    if (chess.turn() !== color) return;
    const square = convertToChessNotation(i, j) as Square;

    if (from === "" && board[i][j]?.square == null) {
      console.log("Select valid from square");
      return;
    }
    if (from === "" && el) {
      if (el.color !== (color as Color)) return;
      const possibleMoves: possibleMoves = getAttackingSquares(
        {
          piece: el.type,
          color: el.color,
          position: { row: i, col: j },
        },
        chess
      );
      setMovableSquare(possibleMoves.movableSquare);
      setAttackerSquare(possibleMoves.attackingSquares);
      setPieceToMove(el);
      setFrom(square);
    } else {
      if (checkSquare) {
        socket?.emit("check-over", {
          row: checkSquare.row,
          col: checkSquare.col,
          roomId: roomId,
        });
        setChecksquare(null);
      }
      const to = square;
      if (pieceToMove?.type === "p" && pieceToMove?.color === "w" && i === 0) {
        makeMove({ from, to, promotion: "q" });
      } else if (
        pieceToMove?.type === "p" &&
        pieceToMove?.color === "b" &&
        i === 7
      ) {
        makeMove({ from, to, promotion: "q" });
      } else {
        makeMove({ from, to });
      }

      if (pieceToMove) {
        const nextPossibleAttackingSquares: chessSquare[] = getAttackingSquares(
          {
            piece: pieceToMove.type,
            color: pieceToMove.color,
            position: { row: i, col: j },
          },
          chess
        ).attackingSquares;

        nextPossibleAttackingSquares.map((sq) => {
          if (
            chess.get(convertToChessNotation(sq.row, sq.col) as Square).type ===
            "k"
          ) {
            console.log("king is check");

            kingCheckSquare = { row: sq.row, col: sq.col };
            setChecksquare(kingCheckSquare);
            socket?.emit("king-check", {
              row: sq.row,
              col: sq.col,
              roomId: roomId,
            });
          } else kingCheckSquare = null;
        });
      }
      setFrom("");
      setMovableSquare(null);
      setAttackerSquare(null);
      setPieceToMove(null);
    }
  };

  useEffect(() => {
    setChecksquare(kingCheckSquare);
  }, [kingCheckSquare]);

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
                      movableSquare?.some((sq) => sq.row === i && sq.col === j)
                        ? "moveable-square"
                        : null
                    } ${
                      from === convertToChessNotation(i, j)
                        ? "active-square"
                        : null
                    } ${
                      attackSquare?.some((sq) => sq.row === i && sq.col === j)
                        ? "attack-square"
                        : null
                    }
                    ${
                      checkSquare?.row === i && checkSquare?.col === j
                        ? "king-check-square"
                        : null
                    }`}
                    onClick={(e) => handleOnSquareClick(i, j, el)}
                  >
                    {j === 0 && <p className={`col-symbol `}>{8 - i}</p>}
                    {el?.type && (
                      <img
                        className="chess-piece"
                        src={`/chessPiece/${el.color === "w" ? "w" : "b"}${
                          el.type
                        }.png`}
                        alt={el.type}
                      />
                    )}
                    {i === 7 && (
                      <p className={`row-symbol `}>
                        {String.fromCharCode("a".charCodeAt(0) + j)}
                      </p>
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
