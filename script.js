let puzzles = [];
let loadedPuzzles = {
  easy: [],
  normal: [],
  hard: [],
  toudai: [],
  stanford: []
};

let currentMode = "";
let currentSheet = 0;
let startTime = 0;
let selectedCell = null;

const DIFFICULTIES = ["easy", "normal", "hard", "toudai", "stanford"];
const PUZZLES = {};
const SOLUTIONS = {};

function loadAllPuzzles() {
  const week = getCurrentWeek();
  for (const level of DIFFICULTIES) {
    const puzzleKey = `puzzles_${level}_${week}`;
    const solutionKey = `solutions_${level}_${week}`;
    const puzzleData = JSON.parse(localStorage.getItem(puzzleKey) || "[]");
    const solutionData = JSON.parse(localStorage.getItem(solutionKey) || "[]");

    PUZZLES[level] = puzzleData;
    SOLUTIONS[level] = solutionData;
    loadedPuzzles[level] = puzzleData; //
  }
}

function getPuzzle(level, index) {
  return PUZZLES[level]?.[index] || null;
}

function getSolution(level, index) {
  const week = getCurrentWeek();
  const key = `solutions_${level}_${week}`;
  const saved = localStorage.getItem(key);

  if (saved) {
    const data = JSON.parse(saved);
    return data[index] || null;
  }

  // バックアップとして外部ファイル（旧データ）も見ておく
  return SOLUTIONS[level]?.[index] || null;
}

let starsHistory = JSON.parse(localStorage.getItem("starsHistory") || "{}");
let starsData = JSON.parse(localStorage.getItem("starsData") || "{}");
let brainCount = parseInt(localStorage.getItem("brainCount") || "0");

window.onload = () => {
  lockGameDuringUpdate();
  const currentWeek = getCurrentWeek();
  if (!localStorage.getItem("lastGeneratedWeek")) {
    generatePuzzlesForAllModes();
    localStorage.setItem("lastGeneratedWeek", currentWeek);
  }
  updateUpdateCountdown();
  loadAllPuzzles();
  runOpeningAnimation();
  updateBrainUI();
};

function runOpeningAnimation() {
  const logo = document.getElementById('logo');
  const title = document.getElementById('title');
  const nampure = document.getElementById('nampure');
  setTimeout(() => { logo.style.top = '20vh'; }, 500);
  setTimeout(() => { logo.style.transition = 'top 0.3s ease'; logo.style.top = '22vh'; }, 2800);
  setTimeout(() => { logo.style.top = '20vh'; }, 3200);
  setTimeout(() => { logo.style.transition = 'transform 0.8s ease'; logo.style.transform += ' rotate(45deg)'; }, 4000);
  setTimeout(() => { title.style.left = '50%'; title.style.transform = 'translateX(-50%)'; }, 5000);
  setTimeout(() => { logo.style.opacity = '0'; title.style.opacity = '0'; }, 7200);
  setTimeout(() => {
    logo.style.display = 'none';
    title.style.display = 'none';
    nampure.style.top = '30vh';
    nampure.style.opacity = '1';
  }, 9200);
  setTimeout(() => {
    nampure.style.top = '-100vh';
    nampure.style.opacity = '0';
  }, 12500);
  setTimeout(() => {
    nampure.style.display = 'none';
    document.getElementById("opening").style.display = "none";
    document.getElementById("mode-select").style.display = "block";
  }, 14000);
}

function selectMode(mode) {
  currentMode = mode;
  puzzles = loadedPuzzles[mode];
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("sheet-select").style.display = "block";
  document.getElementById("sheet-title").textContent = `${mode} モードのシート選択`;
  loadSheetButtons();
}

function loadSheetButtons() {
  const container = document.getElementById("sheet-list");
  container.innerHTML = "";
  for (let i = 0; i < puzzles.length; i++) {
    const btn = document.createElement("div");
    btn.className = "sheet-button";
    btn.textContent = i + 1;
    btn.onclick = () => startGame(i);

    const key = `${currentMode}-${i}`;
    const week = getCurrentWeek();
    const stars = (starsHistory[week]?.[key]) || 0;
    const best = starsData[key] || 0;

    btn.innerHTML += `<div class="stars">⭐️${stars}</div>`;
    if (best >= 3 && (currentMode === "hard" || currentMode === "toudai")) {
      btn.innerHTML += `<div class="brains">🧠</div>`;
    }

    container.appendChild(btn);
  }
}

function startGame(index) {
  currentSheet = index;
  startTime = Date.now();
  selectedCell = null;
  document.getElementById("sheet-select").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("game-title").textContent = `シート ${index + 1}`;
  buildBoard(puzzles[index]);
  setupNumberButtons();
}

function buildBoard(puzzle) {
  const table = document.getElementById("sudoku-board");
  table.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("td");
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (puzzle[r][c]) {
        cell.textContent = puzzle[r][c];
        cell.classList.add("fixed");
      } else {
        cell.onclick = () => selectCell(cell, r, c);
      }
      if (r % 3 === 0) cell.style.borderTop = "2px solid black";
      if (c % 3 === 0) cell.style.borderLeft = "2px solid black";
      if (r === 8) cell.style.borderBottom = "2px solid black";
      if (c === 8) cell.style.borderRight = "2px solid black";
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function selectCell(cell, row, col) {
  const cells = document.querySelectorAll("#sudoku-board td");
  cells.forEach(c => c.classList.remove("selected"));
  selectedCell = { cell, row, col };
  cell.classList.add("selected");
}

function setupNumberButtons() {
  const container = document.getElementById("number-buttons");
  container.innerHTML = "";
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.textContent = n;
    btn.onclick = () => placeNumber(n);
    container.appendChild(btn);
  }
}

function placeNumber(num) {
  if (!selectedCell) return;
  const { row, col, cell } = selectedCell;
  const allCells = document.querySelectorAll("#sudoku-board td");
  cell.textContent = num;

  // エラー表示の初期化
  allCells.forEach(c => {
    c.classList.remove("error", "error-existing");
  });

  // 重複検出
  const conflictCells = [];
  for (let i = 0; i < 9; i++) {
    const rowCell = document.querySelector(`#sudoku-board tr:nth-child(${row + 1}) td:nth-child(${i + 1})`);
    const colCell = document.querySelector(`#sudoku-board tr:nth-child(${i + 1}) td:nth-child(${col + 1})`);
    if (rowCell !== cell && rowCell.textContent == num) conflictCells.push(rowCell);
    if (colCell !== cell && colCell.textContent == num) conflictCells.push(colCell);
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r2 = boxRow; r2 < boxRow + 3; r2++) {
    for (let c2 = boxCol; c2 < boxCol + 3; c2++) {
      const boxCell = document.querySelector(`#sudoku-board tr:nth-child(${r2 + 1}) td:nth-child(${c2 + 1})`);
      if (boxCell !== cell && boxCell.textContent == num) conflictCells.push(boxCell);
    }
  }

  if (conflictCells.length > 0) {
    cell.classList.add("error");
    conflictCells.forEach(c => {
      if (c.classList.contains("fixed")) {
        c.classList.add("error-existing"); // 赤枠：固定マス
      } else {
        c.classList.add("error"); // 赤背景：ユーザー入力
      }
    });
  }
}

function checkAnswer() {
  const elapsed = (Date.now() - startTime) / 1000;
  const board = document.querySelectorAll("#sudoku-board td");
  let valid = true;
  const currentPuzzle = [];

  for (let r = 0; r < 9; r++) {
    currentPuzzle[r] = [];
    for (let c = 0; c < 9; c++) {
      const cell = document.querySelector(`#sudoku-board tr:nth-child(${r + 1}) td:nth-child(${c + 1})`);
      const value = parseInt(cell.textContent);
      if (!value || isNaN(value)) {
        valid = false;
        cell.classList.add("error");
        currentPuzzle[r][c] = null;
      } else {
        currentPuzzle[r][c] = value;
      }
    }
  }

  const solution = getSolution(currentMode, currentSheet);
  const result = document.getElementById("result");

  if (valid && isCorrectAnswer(currentPuzzle, solution)) {
    result.textContent = getRandomPraise();
    result.className = "success";
    showParticles();
    handleSuccess(elapsed);
  } else {
    result.textContent = valid ? "間違いがあります" : "未入力のマスがあります";
    result.className = "fail";
  }
}

function getRandomPraise() {
  const praises = [
    "貴方は天才だ！",
    "また一つ脳をアップデートした！",
    "この集中力、脱帽です！",
    "ひらめきの神様降りてきた!?",
    "脳みそビカビカに光ってる！",
    "一歩ずつ脳が進化している！",
    "冷静さが光ってる！"
  ];
  return praises[Math.floor(Math.random() * praises.length)];
}

function showParticles() {
  const particles = document.getElementById("particles");
  particles.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const star = document.createElement("div");
    star.textContent = "✨";
    star.style.position = "absolute";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = "50%";
    star.style.fontSize = "24px";
    star.style.animation = `fall ${1 + Math.random()}s ease-out forwards`;
    particles.appendChild(star);
  }
  setTimeout(() => { particles.innerHTML = ""; }, 2000);
}

function handleSuccess(elapsed) {
  let stars = 1;
  if (elapsed <= 180) stars = 3;
  else if (document.querySelectorAll("#sudoku-board td.error").length === 0) stars = 2;

  const key = `${currentMode}-${currentSheet}`;
  const week = getCurrentWeek();

  starsHistory[week] = starsHistory[week] || {};
  starsHistory[week][key] = stars;
  localStorage.setItem("starsHistory", JSON.stringify(starsHistory));

  if (!starsData[key] || stars > starsData[key]) {
    starsData[key] = stars;
    localStorage.setItem("starsData", JSON.stringify(starsData));
  }

  // 🧠加算ロジック
  if (currentMode === "hard" && stars === 3) {
    brainCount += 1; // hardは⭐️3条件で🧠1つ
  } else if (currentMode === "toudai") {
    brainCount += 1 + (stars - 1); // 東大脳：クリアで🧠1＋評価に応じて🧠最大2
  } else if (currentMode === "stanford") {
    brainCount += stars; // スタンフォードは⭐️の数だけ🧠
  }

  localStorage.setItem("brainCount", brainCount);
  updateBrainUI();
}

function updateBrainUI () {
  const total = Object.values(starsData).reduce((a, b) => a + b, 0);
  document.getElementById("brain-count").textContent = brainCount;
  document.getElementById("total-stars").textContent = total;


  const title = document.getElementById("current-title");
  const brainTitles = [
    { threshold: 50, label: "脳神" },
    { threshold: 30, label: "覚醒者" },
    { threshold: 15, label: "集中マスター" },
    { threshold: 5, label: "挑戦者" },
    { threshold: 0, label: "初心者" }
  ];

  for (const { threshold, label } of brainTitles) {
    if (brainCount >= threshold || total >= threshold * 2) {
      title.textContent = label;
      break;
    }
  }

  const stanfordBtn = document.getElementById("stanford-btn");
  if (stanfordBtn) {
    stanfordBtn.disabled = brainCount < 50;
  }
}

function updateUpdateCountdown() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const remaining = (7 - dayOfWeek) % 7;
  const message = `盤面のアップデートまであと${remaining === 0 ? '今日' : remaining + '日'}！`;
  const elem = document.getElementById("update-countdown");
  if (elem) elem.textContent = message;
}

function giveUp() { 
  document.getElementById("game-screen").style.display = "none";

  const cover = document.createElement("div");
  cover.style.position = "fixed";
  cover.style.top = 0;
  cover.style.left = 0;
  cover.style.width = "100%";
  cover.style.height = "100%";
  cover.style.backgroundColor = "#f0f8ff";
  cover.style.display = "flex";
  cover.style.justifyContent = "center";
  cover.style.alignItems = "center";
  cover.style.fontSize = "1.8em";
  cover.style.color = "#2e7d32";
  cover.style.zIndex = 9999;
  cover.style.transition = "opacity 1s";
  cover.style.opacity = 0;

  const messages = [
    "また挑戦してな！",
    "次はきっとできる！",
    "あきらめへん心、最高や！",
    "一歩ずつ前進中や！",
    "ヒント使ってでも解こうとする貴方、最高だ！"
  ];
  cover.textContent = messages[Math.floor(Math.random() * messages.length)];

  document.body.appendChild(cover);
  requestAnimationFrame(() => {
    cover.style.opacity = 1;
  });

  setTimeout(() => {
    cover.style.opacity = 0;
    setTimeout(() => {
      cover.remove();
      document.getElementById("mode-select").style.display = "block";
    }, 1000);
  }, 5000);
}

function lockGameDuringUpdate() {
  const now = new Date();
  const isSunday = now.getDay() === 0;
  const isZeroHour = now.getHours() === 0;

  if (isSunday && isZeroHour) {
    document.body.innerHTML = `
      <div style="
        position:fixed;
        top:0; left:0;
        width:100vw; height:100vh;
        background-color:#fffbe6;
        display:flex;
        justify-content:center;
        align-items:center;
        font-size:1.8rem;
        color:#333;
        text-align:center;
        z-index:99999;">
        ただいまナンプレを更新中です。<br>午前1時以降にまた来てな！
      </div>`;
    throw new Error("ナンプレ更新中のためロック中");
  }
}

