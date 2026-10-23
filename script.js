
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const board = document.getElementById("game-board");
const stageText = document.getElementById("stage");
const scoreText = document.getElementById("score");
const stageTitle = document.getElementById("stage-title");
const instruction = document.getElementById("instruction");
const message = document.getElementById("message");
const answerDisplay = document.getElementById("answer-display");

const modeLabel = document.getElementById("mode-label");
const extraLabel = document.getElementById("extra-label");
const extraValue = document.getElementById("extra-value");
const timerArea = document.getElementById("timer-area");
const timerBar = document.getElementById("timer-bar");

const resultTitle = document.getElementById("result-title");
const resultMode = document.getElementById("result-mode");
const finalScore = document.getElementById("final-score");
const finalCorrect = document.getElementById("final-correct");
const finalStage = document.getElementById("final-stage");
const resultMessage = document.getElementById("result-message");

const stage1Pairs = [
    ["エ", "工"], ["ニ", "二"], ["ロ", "口"],
    ["カ", "力"], ["ハ", "八"], ["ト", "卜"],
    ["タ", "夕"], ["オ", "才"], ["ヒ", "匕"],
    ["ム", "厶"]
];

const stage2Pairs = [
    ["ア", "了"], ["ア", "卩"], ["イ", "亻"],
    ["イ", "人"], ["ウ", "宀"], ["ク", "𠂊"],
    ["コ", "匚"], ["サ", "艹"], ["シ", "氵"],
    ["ス", "入"], ["セ", "乜"], ["ナ", "左"],
    ["ネ", "示"]
];

const stage3Pairs = [
    ...stage1Pairs,
    ...stage2Pairs
];

// ゲームの状態
let mode = "";
let score = 0;
let correctCount = 0;
let stage = 1;
let lives = 3;
let timeLeft = 60;
let targetIndex = 0;
let currentTarget = "";
let answered = false;
let gameOver = false;

let timerInterval = null;
let nextRoundTimeout = null;
let cells = [];

function getStage() {
    if (score > 200) return 3;
    if (score > 100) return 2;
    return 1;
}

function getPairs() {
    if (stage === 1) return stage1Pairs;
    if (stage === 2) return stage2Pairs;
    return stage3Pairs;
}

function getStageTitle() {
    if (stage === 1) return "形の違いに気づく";
    if (stage === 2) return "文字の認識が揺らぐ";
    return "カタカナと漢字の境界";
}

function stopTimers() {
    clearInterval(timerInterval);
    clearTimeout(nextRoundTimeout);

    timerInterval = null;
    nextRoundTimeout = null;
}

function showScreen(screen) {
    startScreen.hidden = screen !== "start";
    gameScreen.hidden = screen !== "game";
    resultScreen.hidden = screen !== "result";
}

function chooseMode(selectedMode) {
    stopTimers();

    mode = selectedMode;
    score = 0;
    correctCount = 0;
    stage = 1;
    lives = 3;
    timeLeft = 60;
    gameOver = false;

    showScreen("game");

    if (mode === "time") {
        modeLabel.textContent = "タイムアタック";
        extraLabel.textContent = "TIME";
        timerArea.hidden = false;
    } else {
        modeLabel.textContent = "スコアアタック";
        extraLabel.textContent = "LIFE";
        timerArea.hidden = true;
    }

    updateStatus();
    startRound();
    startModeTimer();
}

function updateStatus() {
    stageText.textContent = stage;
    scoreText.textContent = score;

    if (mode === "time") {
        extraValue.textContent = timeLeft;
    } else {
        extraValue.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
    }
}

function updateTimerBar() {
    timerBar.style.width = `${(timeLeft / 60) * 100}%`;
    timerBar.style.background =
        timeLeft <= 10 ? "#c7463d" : "#303d35";
}

function startModeTimer() {
    if (mode !== "time") return;

    updateTimerBar();

    timerInterval = setInterval(() => {
        if (gameOver) return;

        timeLeft--;
        updateStatus();
        updateTimerBar();

        if (timeLeft <= 0) {
            endGame("time");
        }
    }, 1000);
}

function startRound() {
    if (gameOver) return;

    answered = false;
    stage = getStage();

    updateStatus();
    stageTitle.textContent = getStageTitle();

    answerDisplay.textContent = "";
    message.textContent = "違う文字をクリックしよう。";

    const pairs = getPairs();
    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    const commonChar = pair[0];
    currentTarget = pair[1];

    instruction.textContent =
        `「${commonChar}」の中から「${currentTarget}」を探せ。`;

    board.innerHTML = "";

    const columns = 10;
    const rows = stage === 1 ? 6 : stage === 2 ? 8 : 10;
    const total = columns * rows;

    targetIndex = Math.floor(Math.random() * total);
    cells = [];

    for (let i = 0; i < total; i++) {
        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "cell";
        cell.textContent = i === targetIndex
            ? currentTarget
            : commonChar;

        cell.setAttribute("aria-label", `文字 ${i + 1}`);

        cell.addEventListener("click", () => {
            handleCellClick(i, cell);
        });

        cells.push(cell);
        board.appendChild(cell);
    }

    board.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;
}

function handleCellClick(index, cell) {
    if (answered || gameOver || cell.disabled) return;

    if (index === targetIndex) {
        // 正解
        answered = true;
        correctCount++;
        score += 10;

        cell.classList.add("correct");
        cell.disabled = true;

        answerDisplay.textContent =
            `正解！「${currentTarget}」でした。`;
        message.textContent = "+10 POINTS";

        const oldStage = stage;
        stage = getStage();

        if (stage > oldStage) {
            message.textContent = `STAGE ${stage} に進みました！`;
        }

        updateStatus();

        nextRoundTimeout = setTimeout(() => {
            if (!gameOver) startRound();
        }, 850);

    } else {
        // 不正解
        cell.classList.add("wrong");
        cell.disabled = true;

        if (mode === "life") {
            lives--;
            updateStatus();

            if (lives <= 0) {
                message.textContent = "ライフがなくなりました！";
                showAnswer();
                nextRoundTimeout = setTimeout(() => {
                    endGame("life");
                }, 1200);
                return;
            }

            message.textContent = `不正解！ ライフが減りました。残り ${lives}`;
        } else {
            message.textContent = "不正解！ ほかの文字を探そう。";
        }
    }
}

function showAnswer() {
    cells[targetIndex]?.classList.add("reveal");

    answerDisplay.textContent =
        `正解は「${currentTarget}」でした。`;
}

function endGame(reason) {
    if (gameOver) return;

    gameOver = true;
    stopTimers();

    if (reason === "time") {
        message.textContent = "時間切れ！";
        showAnswer();
    }

    showScreen("result");

    if (reason === "time") {
        resultTitle.textContent = "タイムアップ！";
        resultMessage.textContent =
            "60秒間の挑戦、お疲れさまでした。";
    } else {
        resultTitle.textContent = "ゲーム終了！";
        resultMessage.textContent =
            "最後まで挑戦してくれてありがとう。";
    }

    resultMode.textContent =
        mode === "time" ? "タイムアタック" : "スコアアタック";

    finalScore.textContent = score;
    finalCorrect.textContent = correctCount;
    finalStage.textContent = stage;
}

function returnToTitle() {
    stopTimers();
    gameOver = true;
    showScreen("start");
}

document.querySelectorAll(".mode-card").forEach((button) => {
    button.addEventListener("click", () => {
        chooseMode(button.dataset.mode);
    });
});

document.getElementById("retry-button").addEventListener("click", () => {
    chooseMode(mode);
});

document.getElementById("home-button").addEventListener("click", () => {
    returnToTitle();
});

document.getElementById("back-button").addEventListener("click", () => {
    returnToTitle();
});

showScreen("start");
