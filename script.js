
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

// シート表示（別ページ風に切り替え）
function showSheets(level) {
  const mainMenu = document.getElementById("main-menu");
  const sheetList = document.getElementById("sheet-list");
  mainMenu.style.display = "none";
  sheetList.innerHTML = "";
  sheetList.style.display = "flex";

  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  for (let i = 0; i < 10; i++) {
    let id = `${level}_${(week + i) % 100}`;
    let btn = document.createElement("button");
    btn.className = "sheet-button";
    let stars = clearedSheets[id] || "";
    btn.innerHTML = `No.${i + 1}<span class="stars">${stars}</span>`;
    btn.onclick = () => startGame(level, id);
    sheetList.appendChild(btn);
  }
}

// 以下：ステータスやゲーム進行部は省略せず全て現状のままでOK
