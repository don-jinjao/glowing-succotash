
// 記録系変数
let clearCount = Number(localStorage.getItem("clearCount")) || 0;
let brainCount = Number(localStorage.getItem("brainCount")) || 0;
let clearedSheets = JSON.parse(localStorage.getItem("clearedSheets") || '{}');
let selectedCell = null;
let timer = 0;
let timerInterval;
let currentAnswer = [];
let currentSheetId = "";

// オープニング → メニュー遷移
window.onload = function () {
  const logo = document.getElementById("logo");
  const title = document.getElementById("title");
  const nampure = document.getElementById("nampure");
  const mainMenu = document.getElementById("main-menu");
  const banner = document.getElementById("weekly-update-banner");

  if (new Date().getDay() === 1) {
    banner.style.display = "block";
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

// シート表示
function showSheets(level) {
  const list = document.getElementById("sheet-list");
  list.innerHTML = "";
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  for (let i = 0; i < 10; i++) {
    let id = `${level}_${(week + i) % 100}`;
    let btn = document.createElement("button");
    btn.className = "sheet-button";
    let stars = clearedSheets[id] || "";
    btn.innerHTML = `No.${i + 1}<span class="stars">${stars}</span>`;
    btn.onclick = () => startGame(level, id);
    list.appendChild(btn);
  }
}

// ゲームスタート
function startGame(level, id) {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("sheet-list").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  currentSheetId = id;
  currentAnswer = getFixedAnswer();
  createBoard(currentAnswer);
  showPalette();
  startTimer();
}

// 仮固定問題データ
function getFixedAnswer() {
  return [
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
}

function createBoard(answer) {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement("input");
      input.maxLength = 1;
      input.dataset.row = r;
      input.dataset.col = c;
      if (Math.random() < 0.5) {
        input.value = answer[r][c];
        input.disabled = true;
        input.classList.add("fixed");
      }
      input.onclick = () => selectedCell = input;
      board.appendChild(input);
    }
  }
}

function showPalette() {
  const p = document.getElementById("palette");
  p.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const b = document.createElement("button");
    b.textContent = i;
    b.onclick = () => { if (selectedCell && !selectedCell.disabled) selectedCell.value = i; };
    p.appendChild(b);
  }
  const eraser = document.createElement("button");
  eraser.textContent = "消";
  eraser.onclick = () => { if (selectedCell && !selectedCell.disabled) selectedCell.value = ""; };
  p.appendChild(eraser);
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

function submitAnswer() {
  stopTimer();
  let correct = true;
  const inputs = document.querySelectorAll("#board input");
  for (let i = 0; i < 81; i++) {
    if (!inputs[i].value || isNaN(inputs[i].value)) {
      correct = false;
    }
  }

  const msg = document.getElementById("result-message");
  if (correct) {
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
