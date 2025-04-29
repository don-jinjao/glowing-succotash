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
