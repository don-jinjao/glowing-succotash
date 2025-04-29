
// 記録系変数
let clearCount = Number(localStorage.getItem("clearCount")) || 0;
let brainCount = Number(localStorage.getItem("brainCount")) || 0;
let clearedSheets = JSON.parse(localStorage.getItem("clearedSheets") || '{}');
let selectedCell = null;
let timer = 0;
let timerInterval;
let currentAnswer = [];
let currentPuzzle = [];
let currentSheetId = "";

// オープニング → メニュー遷移
window.onload = function () {
  const logo = document.getElementById("logo");
  const title = document.getElementById("title");
  const nampure = document.getElementById("nampure");
  const mainMenu = document.getElementById("main-menu");

  if (!logo || !title || !nampure || !mainMenu) {
    console.error("初期要素の取得に失敗しました。HTML構造を確認してください。");
    return;
  }

  setTimeout(() => { logo.style.top = "20vh"; }, 500);
  setTimeout(() => { logo.style.top = "22vh"; }, 2800);
  setTimeout(() => { logo.style.top = "20vh"; }, 3200);
  setTimeout(() => { logo.style.transform += " rotate(45deg)"; }, 4000);
  setTimeout(() => {
    title.style.left = "50%";
    title.style.transform = "translateX(-50%)";
  }, 5000);
  setTimeout(() => {
    logo.style.opacity = "0";
    title.style.opacity = "0";
  }, 7200);
  setTimeout(() => {
    logo.style.display = "none";
    title.style.display = "none";
    nampure.style.top = "30vh";
    nampure.style.opacity = "1";
  }, 9200);
  setTimeout(() => {
    nampure.style.top = "-100vh";
    nampure.style.opacity = "0";
  }, 12500);
  setTimeout(() => {
    nampure.style.display = "none";
    mainMenu.style.display = "block";
    updateStatus();
    checkStanfordUnlock();
  }, 14000);
};

function showSheets(level) {
  const sheetList = document.getElementById("sheet-list");
  sheetList.innerHTML = "";
  sheetList.style.display = "flex";

  for (let i = 1; i <= 10; i++) {
    const id = `${level}_${i}`;
    const btn = document.createElement("button");
    btn.className = "sheet-button";
    btn.innerHTML = `No.${i}<span class="stars">${clearedSheets[id] || ""}</span>`;
    btn.onclick = () => startGame(level, id);
    sheetList.appendChild(btn);
  }

  document.getElementById("main-menu").style.display = "none";
}

function startGame(level, id) {
  currentSheetId = id;
  currentAnswer = generateAnswer();
  currentPuzzle = makePuzzleFromAnswer(currentAnswer, 30);

  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const td = document.createElement("td");
      td.dataset.row = r;
      td.dataset.col = c;
      if (currentPuzzle[r][c]) {
        td.textContent = currentPuzzle[r][c];
        td.classList.add("fixed");
      }
      td.onclick = () => {
        if (td.classList.contains("fixed")) return;
        document.querySelectorAll("td").forEach(cell => cell.classList.remove("selected"));
        td.classList.add("selected");
        selectedCell = td;
      };
      board.appendChild(td);
    }
  }

  document.getElementById("main-menu").style.display = "none";
  document.getElementById("sheet-list").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  showPalette();
  startTimer();
}

function generateAnswer() {
  const a = Array.from({ length: 9 }, () => Array(9).fill(0));
  let num = 1;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      a[i][j] = (i * 3 + Math.floor(i / 3) + j) % 9 + 1;
    }
  }
  return a;
}

function makePuzzleFromAnswer(answer, clues = 30) {
  const puzzle = answer.map(row => row.slice());
  let removed = 81 - clues;
  while (removed > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== null) {
      puzzle[r][c] = null;
      removed--;
    }
  }
  return puzzle;
}

function showPalette() {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      if (selectedCell) selectedCell.textContent = i;
    };
    palette.appendChild(btn);
  }
  const erase = document.createElement("button");
  erase.textContent = "消";
  erase.onclick = () => {
    if (selectedCell) selectedCell.textContent = "";
  };
  palette.appendChild(erase);
}

function startTimer() {
  timer = 0;
  document.getElementById("timer").textContent = "タイマー：0秒";
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = `タイマー：${timer}秒`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getCurrentBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(null));
  document.querySelectorAll("td").forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    board[r][c] = cell.textContent ? parseInt(cell.textContent) : null;
  });
  return board;
}

function submitAnswer() {
  stopTimer();
  const board = getCurrentBoard();
  let allFilled = true;
  let allCorrect = true;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
      if (!board[r][c]) {
        allFilled = false;
        cell.classList.add("miss");
      } else if (board[r][c] !== currentAnswer[r][c]) {
        allCorrect = false;
        cell.classList.add("miss");
      }
    }
  }

  const msg = document.getElementById("result-message");
  if (allFilled && allCorrect) {
    msg.textContent = "君は天才だ！";
    clearCount++;
    brainCount++;
    clearedSheets[currentSheetId] = "🧠";
    saveStatus();
    updateStatus();
    checkStanfordUnlock();
  } else {
    msg.textContent = "間違いか空欄があるで！";
  }
}

function giveUp() {
  stopTimer();
  document.getElementById("result-message").textContent = "また挑戦してな！";
}

function saveStatus() {
  localStorage.setItem("clearCount", clearCount);
  localStorage.setItem("brainCount", brainCount);
  localStorage.setItem("clearedSheets", JSON.stringify(clearedSheets));
}

function updateStatus() {
  document.getElementById("clear-count").textContent = clearCount;
  document.getElementById("brain-count").textContent = brainCount;
  let rank = "初心者";
  if (clearCount >= 5) rank = "探求者";
  if (clearCount >= 10) rank = "開拓者";
  if (clearCount >= 20) rank = "神速のロジシャン";
  if (clearCount >= 30) rank = "伝説のナンプレ王";
  document.getElementById("rank").textContent = rank;
}

function checkStanfordUnlock() {
  const btn = document.getElementById("stanford-btn");
  if (brainCount >= 50) {
    btn.disabled = false;
    btn.textContent = "スタンフォード脳";
  }
}
