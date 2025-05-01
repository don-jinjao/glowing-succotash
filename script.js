let puzzles = generatePuzzles(); // 各モードごとに100問（仮→本番へ切替可）
let currentMode = "";
let currentSheet = 0;
let startTime = 0;
let selectedCell = null;

let starsHistory = JSON.parse(localStorage.getItem("starsHistory") || "{}");
let starsData = JSON.parse(localStorage.getItem("starsData") || "{}");
let brainCount = parseInt(localStorage.getItem("brainCount") || "0");

window.onload = () => {
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
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("sheet-select").style.display = "block";
  document.getElementById("sheet-title").textContent = `${mode} モードのシート選択`;
  loadSheetButtons();
}

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(2025, 0, 1); // 1月1日基準
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
  return `week-${diff}`;
}

function loadSheetButtons() {
  const container = document.getElementById("sheet-list");
  container.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const btn = document.createElement("div");
    btn.className = "sheet-button";
    btn.textContent = i + 1;
    btn.onclick = () => startGame(i);

    const key = `${currentMode}-${i}`;
    const historyKey = getCurrentWeek();
    const stars = (starsHistory[historyKey]?.[key]) || 0;
    const best = starsData[key] || 0;

    btn.innerHTML += `<div class="stars">⭐️${stars}</div>`;
    if (best >= 3 && (currentMode === "hard" || currentMode === "toudai")) {
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

  // エラーリセット
  allCells.forEach(c => {
    c.classList.remove("error", "error-existing");
  });

  // エラーチェック
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
      if (c.classList.contains("fixed")) c.classList.add("error-existing");
      else c.classList.add("error");
    });
  }
}

function checkAnswer() {
  const elapsed = (Date.now() - startTime) / 1000;
  const board = document.querySelectorAll("#sudoku-board td");
  let valid = true;
  board.forEach(cell => cell.classList.remove("error"));

  board.forEach(cell => {
    if (!cell.textContent || isNaN(parseInt(cell.textContent))) {
      valid = false;
      cell.classList.add("error");
    }
  });

  const result = document.getElementById("result");
  if (valid) {
    result.textContent = "貴方は天才だ！";
    result.className = "success";
    showParticles();
    handleSuccess(elapsed);
  } else {
    result.textContent = "間違いがあります";
    result.className = "fail";
  }
}

function giveUp() {
  const result = document.getElementById("result");
  result.textContent = "また挑戦してな";
  result.className = "fail";
  setTimeout(() => {
    result.textContent = "";
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("mode-select").style.display = "block";
  }, 2000);
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

  if ((currentMode === "hard" && stars === 3) || currentMode === "toudai") {
    brainCount++;
    localStorage.setItem("brainCount", brainCount);
  }

  updateBrainUI();
}

function updateBrainUI() {
  const total = Object.values(starsData).reduce((a, b) => a + b, 0);
  document.getElementById("brain-count").textContent = brainCount;
  document.getElementById("total-stars").textContent = total;

  const title = document.getElementById("current-title");
  if (brainCount >= 50) {
    title.textContent = "脳神";
    document.getElementById("stanford-btn").disabled = false;
  } else if (brainCount >= 30) title.textContent = "覚醒者";
  else if (brainCount >= 15) title.textContent = "集中マスター";
  else if (brainCount >= 5) title.textContent = "挑戦者";
  else title.textContent = "初心者";
}

function toggleStarInfo() {
  const info = document.getElementById("star-info-popup");
  info.style.display = info.style.display === "none" ? "block" : "none";
}

function generatePuzzles() {
  // 仮盤面（easyモード用） ※本番用は固定配列に差し替え
  return [
    [[5,3,null,null,7,null,null,null,null],[6,null,null,1,9,5,null,null,null],[null,9,8,null,null,null,null,6,null],
    [8,null,null,null,6,null,null,null,3],[4,null,null,8,null,3,null,null,1],[7,null,null,null,2,null,null,null,6],
    [null,6,null,null,null,null,2,8,null],[null,null,null,4,1,9,null,null,5],[null,null,null,null,8,null,null,7,9]],
    ...Array(9).fill(null).map(() => Array(9).fill(null))
  ];
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
