let puzzles = generatePuzzles(); // 10枚仮生成（100枚に拡張可）
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
  selectedCell.cell.textContent = num;
  selectedCell.cell.dataset.value = num;
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
    result.textContent = "貴方は天才だ！";
    result.className = "success";
    handleSuccess();
  } else {
    result.textContent = "間違いがあります";
    result.className = "fail";
  }
}

function giveUp() {
  document.getElementById("result").textContent = "また挑戦してな";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("mode-select").style.display = "block";
}

function isValid(puzzle, row, col, val) {
  for (let i = 0; i < 9; i++) {
    if (i !== col && parseInt(document.querySelector(`#sudoku-board tr:nth-child(${row + 1}) td:nth-child(${i + 1})`).textContent) === val) return false;
    if (i !== row && parseInt(document.querySelector(`#sudoku-board tr:nth-child(${i + 1}) td:nth-child(${col + 1})`).textContent) === val) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) &&
          parseInt(document.querySelector(`#sudoku-board tr:nth-child(${r + 1}) td:nth-child(${c + 1})`).textContent) === val) return false;
    }
  }

  return true;
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
  const title = document.getElementById("title-name");

  if (brainCount >= 50) {
    document.getElementById("stanford-btn").disabled = false;
  }

  if (brainCount >= 50) title.textContent = "脳神";
  else if (brainCount >= 30) title.textContent = "覚醒者";
  else if (brainCount >= 15) title.textContent = "集中マスター";
  else if (brainCount >= 5) title.textContent = "挑戦者";
  else title.textContent = "初心者";
}

function toggleStarInfo() {
  const info = document.getElementById("star-info-popup");
  info.style.display = info.style.display === "none" ? "block" : "none";
}

function generatePuzzles() {
  return [
    // 10個だけサンプル生成（必要なら100枚に置換可）
    [[5,3,null,null,7,null,null,null,null],[6,null,null,1,9,5,null,null,null],[null,9,8,null,null,null,null,6,null],[8,null,null,null,6,null,null,null,3],[4,null,null,8,null,3,null,null,1],[7,null,null,null,2,null,null,null,6],[null,6,null,null,null,null,2,8,null],[null,null,null,4,1,9,null,null,5],[null,null,null,null,8,null,null,7,9]],
    [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))],
    [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))], [[...Array(9)].map(_=>Array(9).fill(null))]
  ];
}
