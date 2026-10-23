
const board = document.getElementById("game-board");
const stageText = document.getElementById("stage");
const scoreText = document.getElementById("score");
const stageTitle = document.getElementById("stage-title");
const instruction = document.getElementById("instruction");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");

// 各ペア：[カタカナ, 似ている漢字・漢字の部品]
const stage1Pairs = [
    ["エ", "工"],
    ["ニ", "二"],
    ["ロ", "口"],
    ["カ", "力"],
    ["ハ", "八"],
    ["ト", "卜"],
    ["タ", "夕"],
    ["オ", "才"],
    ["ヒ", "匕"],
    ["ム", "厶"]
];

const stage2Pairs = [
    ["ア", "了"],
    ["ア", "卩"],
    ["イ", "亻"],
    ["イ", "人"],
    ["ウ", "宀"],
    ["ク", "𠂊"],
    ["コ", "匚"],
    ["サ", "艹"],
    ["シ", "氵"],
    ["ス", "入"],
    ["セ", "乜"],
    ["ナ", "左"],
    ["ネ", "示"]
];

// 最終ステージでは、これまでの文字を混ぜる
const stage3Pairs = [
    ...stage1Pairs,
    ...stage2Pairs,
    ["ネ", "礻"],
    ["ノ", "ノ"]
];

let score = 0;
let stage = 1;
let targetIndex = 0;
let answered = false;

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

function startGame() {
    answered = false;

    const previousStage = stage;
    stage = getStage();

    stageText.textContent = stage;
    scoreText.textContent = score;
    stageTitle.textContent = getStageTitle();

    if (stage !== previousStage) {
        message.textContent = `STAGE ${stage} に進みました。`;
    } else {
        message.textContent = "違う文字をクリックしよう。";
    }

    const pairs = getPairs();
    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    const commonChar = pair[0];
    const targetChar = pair[1];

    instruction.textContent =
        `「${commonChar}」の中から「${targetChar}」を探せ。`;

    board.innerHTML = "";

    // ステージが上がるほど文字数を増やす
    const columns = 10;
    const rows = stage === 1 ? 6 : stage === 2 ? 8 : 10;
    const total = columns * rows;

    targetIndex = Math.floor(Math.random() * total);

    for (let i = 0; i < total; i++) {
        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "cell";

        cell.textContent =
            i === targetIndex ? targetChar : commonChar;

        cell.setAttribute(
            "aria-label",
            `文字 ${i + 1}: ${cell.textContent}`
        );

        cell.addEventListener("click", () => {
            if (answered) return;

            if (i === targetIndex) {
                answered = true;
                score += 10;
                scoreText.textContent = score;

                cell.classList.add("correct");
                message.textContent = "正解。違和感を見つけました。";

                // 次のステージに進むか判定
                const nextStage = getStage();

                if (nextStage !== stage) {
                    message.textContent =
                        `正解！スコア ${score}。次のステージへ！`;
                }

                setTimeout(startGame, 700);
            } else {
                cell.classList.add("wrong");
                message.textContent =
                    "本当にそれかな？ もう一度探そう。";
            }
        });

        board.appendChild(cell);
    }

    board.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;
}

restartButton.addEventListener("click", () => {
    score = 0;
    stage = 1;
    startGame();
});

startGame();
