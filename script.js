
const board = document.getElementById("game-board");
const stageText = document.getElementById("stage");
const scoreText = document.getElementById("score");
const stageTitle = document.getElementById("stage-title");
const instruction = document.getElementById("instruction");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");
const timerText = document.getElementById("timer");
const timerBar = document.getElementById("timer-bar");
const answerDisplay = document.getElementById("answer-display");

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

let score = 0;
let stage = 1;
let targetIndex = 0;
let answered = false;
let timeLeft = 30;
let timerInterval = null;
let nextQuestionTimeout = null;
let currentTarget = "";
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
    clearTimeout(nextQuestionTimeout);
}

function updateTimerDisplay() {
    timerText.textContent = timeLeft;
    timerBar.style.width = `${(timeLeft / 30) * 100}%`;

    timerBar.style.background =
        timeLeft <= 10 ? "#c7463d" : "#333";
}

function startTimer() {
    timeLeft = 30;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishByTimeout();
        }
    }, 1000);
}

function showAnswer() {
    cells[targetIndex]?.classList.add("reveal");
    answerDisplay.textContent =
        `正解は「${currentTarget}」でした。`;
}

function finishByTimeout() {
    if (answered) return;

    answered = true;
    showAnswer();
    message.textContent = "時間切れ！ 次の問題に進みます。";

    nextQuestionTimeout = setTimeout(startGame, 1800);
}

function startGame() {
    stopTimers();
    answered = false;

    const previousStage = stage;
    stage = getStage();

    stageText.textContent = stage;
    scoreText.textContent = score;
    stageTitle.textContent = getStageTitle();

    if (stage !== previousStage) {
        message.textContent = `STAGE ${stage} に進みました！`;
    } else {
        message.textContent = "違う文字をクリックしよう。";
    }

    answerDisplay.textContent = "";

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
            if (answered) return;

            if (i === targetIndex) {
                answered = true;
                clearInterval(timerInterval);

                score += 10;
                scoreText.textContent = score;

                cell.classList.add("correct");
                answerDisplay.textContent =
                    `正解！「${commonChar}」ではなく「${currentTarget}」でした。`;
                message.textContent = "よく見つけました！";

                nextQuestionTimeout = setTimeout(startGame, 1800);
            } else {
                cell.classList.add("wrong");
                message.textContent = "不正解。もう一度探してみよう。";
            }
        });

        cells.push(cell);
        board.appendChild(cell);
    }

    board.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;

    startTimer();
}

restartButton.addEventListener("click", () => {
    stopTimers();
    score = 0;
    stage = 1;
    startGame();
});

startGame();
