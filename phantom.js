function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  return Math.floor(days / 7);
}

function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(null));
  solveSudoku(board);
  return board;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generatePuzzleWithHoles(board, holes) {
  const puzzle = JSON.parse(JSON.stringify(board));
  let attempts = 0;
  while (holes > 0 && attempts < 1000) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      holes--;
    }
    attempts++;
  }
  return puzzle;
}

function generatePuzzlesForAllModes() {
  const currentWeek = getCurrentWeek();
  const levels = {
    easy: 25,
    normal: 35,
    hard: 45,
    toudai: getRandomInRange([51, 54]),
    stanford: getRandomInRange([53, 55])
  };

  for (const level in levels) {
    const holes = levels[level];
    const count = level === "stanford" ? 5 : 10;
    const puzzles = [];
    const solutions = [];

    for (let i = 0; i < count; i++) {
      const solution = generateFullBoard();
      const puzzle = generatePuzzleWithHoles(solution, holes);
      puzzles.push(puzzle);
      solutions.push(solution);
    }

    localStorage.setItem(`puzzles_${level}_${currentWeek}`, JSON.stringify(puzzles));
    localStorage.setItem(`solutions_${level}_${currentWeek}`, JSON.stringify(solutions));
  }

  localStorage.setItem("lastGeneratedWeek", currentWeek);
deleteOldWeekData(currentWeek);
}

function getRandomInRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkForNewWeek() {
  const currentWeek = getCurrentWeek();
  const lastGeneratedWeek = parseInt(localStorage.getItem("lastGeneratedWeek") || "-1");

  if (currentWeek !== lastGeneratedWeek) {
    generatePuzzlesForAllModes();
  }
}

function deleteOldWeekData(currentWeek) {
  const levels = ["easy", "normal", "hard", "toudai", "stanford"];
  for (let week = 0; week < currentWeek; week++) {
    for (const level of levels) {
      localStorage.removeItem(`puzzles_${level}_${week}`);
      localStorage.removeItem(`solutions_${level}_${week}`);
    }
  }
}
