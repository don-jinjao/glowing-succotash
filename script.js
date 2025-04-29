let clearCount = localStorage.getItem('clearCount') ? parseInt(localStorage.getItem('clearCount')) : 0;
let hintsUsed = false;

const startBtn = document.getElementById('startBtn');
const difficultyDiv = document.getElementById('difficulty');
const levelBtns = document.querySelectorAll('.levelBtn');
const gameDiv = document.getElementById('game');
const board = document.getElementById('board');
const checkBtn = document.getElementById('checkBtn');
const messageDiv = document.getElementById('message');
const clearCountSpan = document.getElementById('clearCount');
const titleSpan = document.getElementById('title');
const starsSpan = document.getElementById('stars');

startBtn.addEventListener('click', () => {
    document.getElementById('opening').style.display = 'none';
    difficultyDiv.style.display = 'block';
});

levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyDiv.style.display = 'none';
        gameDiv.style.display = 'block';
        createBoard();
    });
});

checkBtn.addEventListener('click', () => {
    if (checkClear()) {
        messageDiv.textContent = hintsUsed ? 'ヒント使ってでも諦めなかった貴方、最高だ！' : '貴方は天才だ！';
        clearCount++;
        localStorage.setItem('clearCount', clearCount);
        updateStatus();
    } else {
        messageDiv.textContent = 'まだ完成していないよ！';
    }
});

function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.maxLength = 1;
        input.dataset.index = i;
        board.appendChild(input);
    }
}

function checkClear() {
    const cells = document.querySelectorAll('#board input');
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].value === '') return false;
    }
    return true;
}

function updateStatus() {
    clearCountSpan.textContent = clearCount;
    if (clearCount < 5) {
        titleSpan.textContent = '挑戦者';
        starsSpan.innerHTML = '★';
    } else if (clearCount < 10) {
        titleSpan.textContent = 'ひらめきの探求者';
        starsSpan.innerHTML = '★★';
    } else if (clearCount < 20) {
        titleSpan.textContent = '脳力の開拓者';
        starsSpan.innerHTML = '★★★';
    } else if (clearCount < 30) {
        titleSpan.textContent = '神速のロジシャン';
        starsSpan.innerHTML = '★★★★';
    } else {
        titleSpan.textContent = '伝説のナンプレ王';
        starsSpan.innerHTML = '★★★★★';
    }
}

updateStatus();