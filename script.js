let currentPuzzle = [
  [5,3,null,null,7,null,null,null,null],
  [6,null,null,1,9,5,null,null,null],
  [null,9,8,null,null,null,null,6,null],
  [8,null,null,null,6,null,null,null,3],
  [4,null,null,8,null,3,null,null,1],
  [7,null,null,null,2,null,null,null,6],
  [null,6,null,null,null,null,2,8,null],
  [null,null,null,4,1,9,null,null,5],
  [null,null,null,null,8,null,null,7,9]
];
let currentAnswer = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];
let timer = 0;
let timerInterval = null;
let selectedCell = null;

function startGame() {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  drawBoard();
  drawPalette();
  startTimer();
}

function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  const table = document.createElement("table");
  for (let r = 0; r < 9; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < 9; c++) {
      const td = document.createElement("td");
      td.dataset.row = r;
      td.dataset.col = c;
      if (currentPuzzle[r][c] !== null) {
        td.textContent = currentPuzzle[r][c];
        td.classList.add("fixed");
      }
      td.addEventListener("click", () => {
        if (td.classList.contains("fixed")) return;
        document.querySelectorAll("td").forEach(cell => cell.classList.remove("selected"));
        td.classList.add("selected");
        selectedCell = td;
      });
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  boardDiv.appendChild(table);
}

function drawPalette() {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      if (selectedCell) {
        selectedCell.textContent = i;
      }
    };
    palette.appendChild(btn);
  }
  const eraseBtn = document.createElement("button");
  eraseBtn.textContent = "消";
  eraseBtn.onclick = () => {
    if (selectedCell) {
      selectedCell.textContent = "";
    }
  };
  palette.appendChild(eraseBtn);
}

function startTimer() {
  timer = 0;
  document.getElementById("timer").textContent = `タイマー：0秒`;
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = `タイマー：${timer}秒`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getCurrentBoard() {
  const board = Array.from({length: 9}, () => Array(9).fill(null));
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
  let mistakeFree = true;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
      if (!board[r][c]) {
        allFilled = false;
        mistakeFree = false;
        cell.style.background = "#fffb91";
      } else if (board[r][c] !== currentAnswer[r][c]) {
        allCorrect = false;
        mistakeFree = false;
        cell.style.background = "#ff9999";
      }
    }
  }

  const msg = document.getElementById("result-message");
  if (allFilled && allCorrect) {
    let stars = "⭐️";
    if (timer <= 180) stars = "⭐️⭐️⭐️";
    else if (mistakeFree) stars = "⭐️⭐️";
    msg.textContent = `君は天才だ！クリア！ ${stars}`;
  } else {
    msg.textContent = "間違いか空欄があるで！";
  }
}

function giveUp() {
  stopTimer();
  document.getElementById("result-message").textContent = "また挑戦してな！";
}
