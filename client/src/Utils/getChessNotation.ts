export const convertToChessNotation = (row: number, col: number): string => {
  const chessColumn = String.fromCharCode("a".charCodeAt(0) + col);
  const chessRow = 8 - row;
  return `${chessColumn}${chessRow}`;
};
