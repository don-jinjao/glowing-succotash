let puzzles = generatePuzzles(); // 現在は仮の10枚
let currentMode = "";
let currentSheet = 0;
let startTime = 0;
let selectedCell = null;
let starsData = JSON.parse(localStorage.getItem("starsData") || "{}");
let brainCount = parseInt(localStorage.getItem("brainCount") || "0");

window.onload = () => {
  document.getElementById("opening").style.display = "none";
  document.getElementById("mode-select").style.display = "block";
  updateBrainUI();
};

function selectMode(mode) {
  currentMode = mode;
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("sheet-select").style.display = "block";
  document.getElementById("sheet-title").textContent = `${mode} モードのシート選択`;
  loadSheetButtons();
  updateSheetStatus();
}

function loadSheetButtons() {
  const container = document.getElementById("sheet-list");
  container.innerHTML = "";
  for (let i = 0; i < puzzles.length; i++) {
    const btn = document.createElement("div");
    btn.className = "sheet-button";
    btn.textContent = i + 1;
    btn.onclick = () => startGame(i);

    const sheetKey = `${currentMode}-${i}`;
    const stars = starsData[sheetKey] || 0;
    btn.innerHTML += `<div class="stars">⭐️×${stars}</div>`;

    if (stars >= 3 && (currentMode === "hard" || currentMode === "toudai")) {
      btn.innerHTML += `<div class="brains">🧠</div>`;
    }

    container.appendChild(btn);
  }
}

function backToMode() {
  document.getElementById("sheet-select").style.display = "none";
  document.getElementById("mode-select").style.display = "block";
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
      cell.dataset.box = Math.floor(r / 3) * 3 + Math.floor(c / 3);

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
  const { row, col } = selectedCell;
  const board = document.querySelectorAll("#sudoku-board td");

  selectedCell.cell.textContent = num;
  selectedCell.cell.dataset.value = num;

  // 被りチェック＆表示更新
  highlightConflicts(row, col, num);
}
function highlightConflicts(row, col, val) {
  const cells = document.querySelectorAll("#sudoku-board td");
  cells.forEach(c => {
    c.classList.remove("error", "conflict");
  });

  let conflict = false;
  cells.forEach(c => {
    if (!c.dataset.value || c.classList.contains("fixed")) return;
    const r = parseInt(c.dataset.row);
    const cIdx = parseInt(c.dataset.col);
    const box = parseInt(c.dataset.box);
    const v = c.textContent;

    if (v == val && (
        r === row ||
        cIdx === col ||
        box === (Math.floor(row / 3) * 3 + Math.floor(col / 3))
    )) {
      if (r === row && cIdx === col) return;
      c.classList.add("conflict");
      selectedCell.cell.classList.add("error");
      conflict = true;
    }
  });

  if (!conflict) {
    selectedCell.cell.classList.remove("error");
  }
}

function checkAnswer() {
  const board = document.querySelectorAll("#sudoku-board td");
  let valid = true;

  board.forEach(c => c.classList.remove("error"));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r * 9 + c];
      const val = parseInt(cell.textContent);
      if (!val || !isValid(puzzles[currentSheet], r, c, val)) {
        cell.classList.add("error");
        valid = false;
      }
    }
  }

  const result = document.getElementById("result");
  if (valid) {
    result.textContent = getRandomPraise();
    result.className = "success";
    handleSuccess();
  } else {
    result.textContent = "間違いがあります";
    result.className = "fail";
  }
}

function giveUp() {
  const result = document.getElementById("result");
  result.textContent = getRandomEncouragement();
  result.className = "fail";
  setTimeout(() => {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("mode-select").style.display = "block";
    result.textContent = "";
  }, 5000);
}

function getRandomPraise() {
  const praises = [
    "貴方は天才だ！",
    "また一つ脳をアップデートした！",
    "この集中力、脱帽です！",
    "ひらめきの神様降りてきた!?",
    "脳みそビカビカに光ってる！"
  ];
  return praises[Math.floor(Math.random() * praises.length)];
}

function getRandomEncouragement() {
  const messages = [
    "また挑戦してな！",
    "次はきっとできる！",
    "あきらめへん心、最高や！",
    "一歩ずつ前進中や！",
    "ヒント使ってでも解こうとする貴方、最高だ！"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
function handleSuccess() {
  const elapsed = (Date.now() - startTime) / 1000;
  let stars = 1;
  const key = `${currentMode}-${currentSheet}`;

  if (elapsed <= 180) stars = 3;
  else if (document.querySelectorAll("#sudoku-board td.error").length === 0) stars = 2;

  starsData[key] = Math.max(starsData[key] || 0, stars);
  localStorage.setItem("starsData", JSON.stringify(starsData));

  if ((currentMode === "hard" && stars === 3) || currentMode === "toudai") {
    brainCount++;
    localStorage.setItem("brainCount", brainCount);
  }

  updateBrainUI();
}

function updateBrainUI() {
  document.getElementById("brain-count").textContent = brainCount;
  document.getElementById("total-brains").textContent = brainCount;

  let totalStars = 0;
  for (const key in starsData) totalStars += starsData[key];
  document.getElementById("total-stars").textContent = totalStars;

  const title = document.getElementById("current-title");
  const brainTitles = [
    { threshold: 50, label: "脳神" },
    { threshold: 30, label: "覚醒者" },
    { threshold: 15, label: "集中マスター" },
    { threshold: 5, label: "挑戦者" },
    { threshold: 0, label: "初心者" }
  ];

  for (const { threshold, label } of brainTitles) {
    if (brainCount >= threshold || totalStars >= threshold * 2) {
      title.textContent = label;
      break;
    }
  }

  document.getElementById("stanford-btn").disabled = brainCount < 50;
}

function toggleStarInfo() {
  const info = document.getElementById("star-info-popup");
  info.style.display = info.style.display === "none" ? "block" : "none";
}
