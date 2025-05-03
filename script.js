const DIFFICULTIES = ["easy", "normal", "hard", "toudai", "stanford"];
let brainCount = 0;
let starsData = {};
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

function checkForDataOrShowUpdateButton() {
  const week = getCurrentWeek();
  const hasData = DIFFICULTIES.every(level =>
    localStorage.getItem(`puzzles_${level}_${week}`) &&
    localStorage.getItem(`solutions_${level}_${week}`)
  );

  const updateBtn = document.getElementById("manual-update-btn");
  const updateArea = document.getElementById("update-area");

  if (!hasData) {
    updateArea.style.display = "block";       // ← 親を表示
    updateBtn.style.display = "inline-block"; // ← ボタンを表示
  } else {
    updateArea.style.display = "none";        // ← 親ごと非表示
    updateBtn.style.display = "none";
  }
}

function generateAndReload() {
  const updateBtn = document.getElementById("manual-update-btn");
  updateBtn.disabled = true;
  updateBtn.textContent = "Loading...";

  setTimeout(() => {
    generatePuzzlesForAllModes();
    loadAllPuzzles();
    updateBtn.textContent = "更新完了！再読み込みしてね";
  }, 300); // 短い待ち時間を入れて自然な動作感に
}

function toggleStarInfo() {
  const popup = document.getElementById("star-info-popup");
  if (popup) {
    popup.style.display = (popup.style.display === "none") ? "block" : "none";
  }
}
function backToMode() {
  document.getElementById("sheet-select").style.display = "none";
  document.getElementById("mode-select").style.display = "block";
}

function selectMode(mode) {
  // タイトル表示
  document.getElementById("sheet-title").textContent = `${mode} モードのシート一覧`;
  
  // 表示切り替え
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("sheet-select").style.display = "block";

  // シート一覧を描画
  renderSheetList(mode);
}

function updateBrainUI() {
  document.getElementById("brain-count").textContent = brainCount;
  document.getElementById("total-stars").textContent = getTotalStars();
  document.getElementById("current-title").textContent = getTitleFromBrainCount(brainCount);

  // 🧠50個以上でスタンフォード脳解放
  const stanfordBtn = document.getElementById("stanford-btn");
  const stanfordNote = document.getElementById("stanford-note");
  if (brainCount >= 50) {
    stanfordBtn.disabled = false;
    stanfordNote.style.color = "green";
    stanfordNote.textContent = "挑戦できます！";
  } else {
    stanfordBtn.disabled = true;
    stanfordNote.style.color = "#d32f2f";
    stanfordNote.textContent = "※🧠50個以上で解放されます";
  }
}

function manualUpdate() {
  const loadingText = document.getElementById("update-loading");
  loadingText.style.display = "block";
  setTimeout(() => {
    generateAndReload();
    loadingText.style.display = "none";
  }, 300);
}

function getTotalStars() {
  return Object.values(starsData).reduce((sum, val) => sum + val, 0);
}

function getTitleFromBrainCount(count) {
  if (count >= 100) return "超人";
  if (count >= 75) return "天才";
  if (count >= 50) return "賢者";
  if (count >= 30) return "秀才";
  if (count >= 15) return "努力家";
  return "初心者";
}

window.onload = function() {
  // Opening 演出開始
  const logo = document.getElementById("logo");
  const title = document.getElementById("title");
  const nampure = document.getElementById("nampure");

  logo.style.top = "25vh";
  setTimeout(() => {
    logo.style.transform = "translateX(-50%) rotate(45deg)";
  }, 2000);

  setTimeout(() => {
    title.style.left = "50%";
    title.style.transform = "translateX(-50%)";
  }, 2200);

  setTimeout(() => {
    logo.style.opacity = "0";
    title.style.opacity = "0";
  }, 4000);

  setTimeout(() => {
    nampure.style.top = "10vh";
    nampure.style.opacity = "1";
  }, 4300);

  setTimeout(() => {
    nampure.style.top = "-100vh";
    nampure.style.opacity = "0";
  }, 6300);

  setTimeout(() => {
    document.getElementById("opening").style.display = "none";
    document.getElementById("mode-select").style.display = "block";
    updateBrainUI();
    checkForDataOrShowUpdateButton();
    checkForNewWeek();
    loadAllPuzzles?.();
  }, 6800);
};

function loadAllPuzzles() {
  const week = getCurrentWeek();
  DIFFICULTIES.forEach(level => {
    const puzzlesKey = `puzzles_${level}_${week}`;
    const solutionsKey = `solutions_${level}_${week}`;

    const puzzles = localStorage.getItem(puzzlesKey);
    const solutions = localStorage.getItem(solutionsKey);

    if (!puzzles || !solutions) {
      console.warn(`データが見つかりません: ${level}`);
      return;
    }

    try {
      const parsedPuzzles = JSON.parse(puzzles);
      const parsedSolutions = JSON.parse(solutions);
      window.puzzleData = window.puzzleData || {};
      window.solutionData = window.solutionData || {};
      window.puzzleData[level] = parsedPuzzles;
      window.solutionData[level] = parsedSolutions;
    } catch (e) {
      console.error(`データ読み込み失敗: ${level}`, e);
    }
  });

  console.log("全モードの盤面と正解データを読み込み、グローバルに格納済み");
}

function renderSheetList(mode) {
  const sheetList = document.getElementById("sheet-list");
  sheetList.innerHTML = ""; // 前の内容をクリア

  const puzzles = window.puzzleData?.[mode];
  if (!puzzles || puzzles.length === 0) {
    sheetList.textContent = "このモードの盤面が見つかりません。アップデートしてください。";
    return;
  }

  const count = mode === "stanford" ? 5 : 10;

  for (let i = 0; i < count; i++) {
    const button = document.createElement("button");
    button.textContent = `No.${i + 1}`;
    button.onclick = () => startGame(mode, i); // ゲーム開始関数に渡す
    button.style.margin = "8px";
    sheetList.appendChild(button);
  }

  document.getElementById("mode-select").style.display = "none";
  document.getElementById("sheet-title").textContent = `${mode}モードの問題を選んでね`;
  document.getElementById("sheet-select").style.display = "block";
}

function selectMode(mode) {
  const puzzles = window.puzzleData?.[mode];
  if (!puzzles || puzzles.length === 0) {
    alert("このモードの盤面がまだ生成されていません。アップデートしてください。");
    return;
  }
  renderSheetList(mode);
}

function startGame(mode, index) {
  window.startTime = Date.now(); // ←【1】スタート時間記録

  const puzzle = window.puzzleData?.[mode]?.[index];
  const solution = window.solutionData?.[mode]?.[index];

  if (!puzzle || !solution) {
    alert("問題データが見つかりません");
    return;
  }

  document.getElementById("sheet-select").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("game-title").textContent = `${mode}モード - No.${index + 1}`;

  // タイマー表示
  const timerDisplay = document.getElementById("timer-display") || document.createElement("p");
  timerDisplay.id = "timer-display";
  timerDisplay.style.marginTop = "10px";
  timerDisplay.style.fontWeight = "bold";
  document.getElementById("game-title").after(timerDisplay);
  if (window.timerInterval) clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    const seconds = Math.floor((Date.now() - window.startTime) / 1000);
    timerDisplay.textContent = `経過時間：${seconds}秒`;
  }, 1000);

  // 数字パレット
  const numberButtons = document.getElementById("number-buttons");
  numberButtons.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      if (selectedCell && !selectedCell.classList.contains("fixed")) {
        selectedCell.textContent = i;
        checkConflicts();
      }
    };
    numberButtons.appendChild(btn);
  }
  const delBtn = document.createElement("button");
  delBtn.textContent = "消す";
  delBtn.onclick = () => {
    if (selectedCell && !selectedCell.classList.contains("fixed")) {
      selectedCell.textContent = "";
      checkConflicts();
    }
  };
  numberButtons.appendChild(delBtn);

  // 盤面描画
  const board = document.getElementById("sudoku-board");
  board.innerHTML = "";
  let selectedCell = null;

  for (let r = 0; r < 9; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("td");
      const val = puzzle[r][c];
      if (val !== null) {
        cell.textContent = val;
        cell.classList.add("fixed");
      } else {
        cell.classList.add("editable");
        cell.addEventListener("click", () => {
          if (selectedCell) selectedCell.classList.remove("selected");
          selectedCell = cell;
          cell.classList.add("selected");
        });
      }
      cell.dataset.row = r;
      cell.dataset.col = c;

      if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add("border-right");
      if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add("border-bottom");

      row.appendChild(cell);
    }
    board.appendChild(row);
  }

  // 答え合わせボタン
  const checkBtn = document.getElementById("check-answer-btn");
  checkBtn.style.display = "inline-block";
  checkBtn.onclick = () => {
    const cells = board.querySelectorAll("td");
    let isCorrect = true;

    for (let cell of cells) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      if (!cell.classList.contains("fixed")) {
        const input = parseInt(cell.textContent.trim());
        if (input !== solution[row][col]) {
          isCorrect = false;
          cell.style.backgroundColor = "#fdd";
        } else {
          cell.style.backgroundColor = "#dfd";
        }
      }
    }

    if (isCorrect) {
      alert("正解！お見事！");

      const clearTime = (Date.now() - window.startTime) / 1000;
      let stars = 1;
      if (clearTime <= 180) {
        stars = 3;
      } else if (clearTime <= 600) {
        stars = 2;
      }

      const key = `${mode}_${index}`;
      starsData[key] = stars;
      localStorage.setItem("starsData", JSON.stringify(starsData));

      if (mode === "hard" && stars === 3) brainCount += 1;
      if (mode === "toudai") brainCount += 1;
      if (mode === "stanford") brainCount += stars;

      localStorage.setItem("brainCount", brainCount);
      updateBrainUI();

      alert(`⭐️${stars}つ獲得！`);
    } else {
      alert("間違いがあります。もう一度見直してね。");
    }
  };

  // あきらめボタン（←これが今回の追加ポイント）
  const giveUpBtn = document.getElementById("give-up-btn");
  giveUpBtn.style.display = "inline-block";
  giveUpBtn.onclick = () => {
    giveUp();
  };
}

 
  function checkConflicts() {
  const cells = document.querySelectorAll("#sudoku-board td");

  // すべてのマスのスタイル・クラスをリセット
  cells.forEach(cell => {
    cell.classList.remove("conflict");
    cell.classList.remove("error-existing");
    cell.style.backgroundColor = "";
  });

  // 各マスについて重複チェック
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.querySelector(`td[data-row='${r}'][data-col='${c}']`);
      const val = parseInt(cell.textContent.trim());

      if (!val || cell.classList.contains("fixed")) continue;

      let conflict = false;

      // 行と列チェック
      for (let i = 0; i < 9; i++) {
        if (i !== c) {
          const other = document.querySelector(`td[data-row='${r}'][data-col='${i}']`);
          if (parseInt(other.textContent.trim()) === val) conflict = true;
        }
        if (i !== r) {
          const other = document.querySelector(`td[data-row='${i}'][data-col='${c}']`);
          if (parseInt(other.textContent.trim()) === val) conflict = true;
        }
      }

      // ブロックチェック
      const sr = Math.floor(r / 3) * 3;
      const sc = Math.floor(c / 3) * 3;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const nr = sr + dr;
          const nc = sc + dc;
          if (nr === r && nc === c) continue;
          const other = document.querySelector(`td[data-row='${nr}'][data-col='${nc}']`);
          if (parseInt(other.textContent.trim()) === val) conflict = true;
        }
      }

      // コンフリクトがあれば赤表示
      if (conflict) {
        cell.classList.add("conflict");
        cell.style.backgroundColor = "#fdd";

        // 被った固定数字にも赤枠をつける
        for (let i = 0; i < 9; i++) {
          const rowCell = document.querySelector(`td[data-row='${r}'][data-col='${i}']`);
          if (rowCell.classList.contains("fixed") && parseInt(rowCell.textContent.trim()) === val) {
            rowCell.classList.add("error-existing");
          }
          const colCell = document.querySelector(`td[data-row='${i}'][data-col='${c}']`);
          if (colCell.classList.contains("fixed") && parseInt(colCell.textContent.trim()) === val) {
            colCell.classList.add("error-existing");
          }
        }
        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const nr = sr + dr;
            const nc = sc + dc;
            const blockCell = document.querySelector(`td[data-row='${nr}'][data-col='${nc}']`);
            if (blockCell.classList.contains("fixed") && parseInt(blockCell.textContent.trim()) === val) {
              blockCell.classList.add("error-existing");
            }
          }
        }
      }
    }
  }
}

function checkAnswer() {
  const board = document.getElementById("sudoku-board");
  const cells = board.querySelectorAll("td");
  let isCorrect = true;

  const mode = document.getElementById("game-title").textContent.split("モード")[0];
  const indexText = document.getElementById("game-title").textContent.match(/No\.(\d+)/);
  const index = indexText ? parseInt(indexText[1], 10) - 1 : 0;

  const solution = window.solutionData?.[mode]?.[index];

  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    if (!cell.classList.contains("fixed")) {
      const input = parseInt(cell.textContent.trim());
      if (input !== solution[row][col]) {
        isCorrect = false;
        cell.style.backgroundColor = "#fdd";
      } else {
        cell.style.backgroundColor = "#dfd";
      }
    }
  });

  if (isCorrect) {
    const clearTime = (Date.now() - window.startTime) / 1000;
    let stars = 1;
    if (clearTime <= 180) stars = 3;
    else if (clearTime <= 600) stars = 2;

    const key = `${mode}_${index}`;
    starsData[key] = stars;
    localStorage.setItem("starsData", JSON.stringify(starsData));

    if (mode === "hard" && stars === 3) brainCount++;
    if (mode === "toudai") brainCount++;
    if (mode === "stanford") brainCount += stars;

    localStorage.setItem("brainCount", brainCount);
    updateBrainUI();

    document.getElementById("result").className = "success";
    document.getElementById("result").textContent = `正解！⭐️${stars}つ獲得！`;
  } else {
    document.getElementById("result").className = "fail";
    document.getElementById("result").textContent = "間違いがあります。もう一度見直してね。";
  }
}

function giveUp() {
  // 現在の画面非表示、諦めメッセージ表示
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("giveup-screen").style.display = "block";

  // やさしいメッセージ表示
  const message = document.getElementById("giveup-message");
  message.textContent = "諦めても大丈夫。ここまで頑張ったあなた、最高です。";

  // 数秒後にメインメニューへ戻す（2.5秒）
  setTimeout(() => {
    document.getElementById("giveup-screen").style.display = "none";
    document.getElementById("mode-select").style.display = "block";
    updateBrainUI(); // 称号や脳数も更新
  }, 2500);
}
