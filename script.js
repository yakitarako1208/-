
const board = document.getElementById("game-board");
const levelText = document.getElementById("level");
const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");

let level = 1;
let score = 0;
let targetIndex = 0;
let answered = false;

function startGame() {
    answered = false;

    levelText.textContent = level;
    scoreText.textContent = score;
    message.textContent = "違う文字をクリックしよう。";

    board.innerHTML = "";

    // レベルが上がるほど文字数が増える
    const columns = 10;
    const rows = Math.min(6 + Math.floor((level - 1) / 2), 10);
    const total = columns * rows;

    // 違う文字をランダムな位置に配置
    targetIndex = Math.floor(Math.random() * total);

    for (let i = 0; i < total; i++) {
        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "cell";

        // 1文字だけ「エ」、ほかは「工」
        cell.textContent = i === targetIndex ? "エ" : "工";
        cell.setAttribute("aria-label", `文字 ${i + 1}`);

        cell.addEventListener("click", () => {
            if (answered) return;

            if (i === targetIndex) {
                answered = true;
                score += 10;
                level += 1;

                cell.classList.add("correct");
                message.textContent = "正解。違和感を見つけました。";
                scoreText.textContent = score;
                levelText.textContent = level;

                // 少し待ってから次の問題へ
                setTimeout(startGame, 700);
            } else {
                cell.classList.add("wrong");
                message.textContent = "本当にそれかな？ もう一度探そう。";
            }
        });

        board.appendChild(cell);
    }

    // 画面幅に合わせて列数を指定
    board.style.gridTemplateColumns =
        `repeat(${columns}, minmax(0, 1fr))`;
}

restartButton.addEventListener("click", () => {
    level = 1;
    score = 0;
    startGame();
});

startGame();
