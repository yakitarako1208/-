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

// ===== モード3：日常の違和感（場面データ） =====
// 文字列 = ふつうの言葉 ／ オブジェクト = 違和感のある言葉
//   text: 表示する言葉, bad: 紛れ込んでいる文字, note: 解説
const scenes = [
    {
        place: "コンビニのレシート",
        kind: "receipt",
        lines: [
            ["ご利用", "ありがとう", "ございます"],
            ["おにぎり", "¥150"],
            ["お茶", "¥140"],
            [
                {
                    text: "ビニ一ル袋",
                    bad: "一",
                    note: "長音の「ー」ではなく、漢数字の「一」でした。横棒だけの形がそっくりです。"
                },
                "¥3"
            ],
            ["合計", "¥293"]
        ]
    },
    {
        place: "LINEのトーク",
        kind: "chat",
        lines: [
            ["おつかれさま！"],
            ["明日の", "打ち合わせ", "リモートで", "大丈夫？"],
            [
                {
                    text: "あリがとう！",
                    bad: "リ",
                    note: "ひらがなの「り」ではなく、カタカナの「リ」でした。丸い字の中に混ざると気づきにくい。"
                },
                "助かります"
            ]
        ]
    },
    {
        place: "駅の案内看板",
        kind: "station",
        lines: [
            ["JR", "山手線"],
            ["←", "東口", "バス乗り場"],
            ["→", "西口", "タクシー"],
            [
                "↓", "トイレ",
                {
                    text: "出ロ",
                    bad: "ロ",
                    note: "漢字の「口」ではなく、カタカナの「ロ」でした。看板だと読み流してしまう。"
                }
            ]
        ]
    },
    {
        place: "喫茶店のメニュー",
        kind: "menu",
        lines: [
            ["ブレンド", "¥450"],
            [
                {
                    text: "力レーライス",
                    bad: "力",
                    note: "カタカナの「カ」ではなく、漢字の「力」でした。1画の違いです。"
                },
                "¥900"
            ],
            ["ナポリタン", "¥850"],
            ["ミルクティー", "¥500"]
        ]
    },
    {
        place: "スーパーのチラシ",
        kind: "flyer",
        lines: [
            ["本日限り！"],
            [
                {
                    text: "夕イムサービス",
                    bad: "夕",
                    note: "カタカナの「タ」ではなく、漢字の「夕」（ゆう）でした。"
                }
            ],
            ["卵", "1パック", "198円"],
            ["牛乳", "1本", "148円"]
        ]
    },
    {
        place: "マンションの掲示板",
        kind: "notice",
        lines: [
            ["お知らせ"],
            [
                {
                    text: "工レベーター",
                    bad: "工",
                    note: "カタカナの「エ」ではなく、漢字の「工」でした。工事の「工」です。"
                },
                "点検のため"
            ],
            ["午前10時から", "停止します"]
        ]
    },
    {
        place: "公共施設の案内",
        kind: "sign",
        lines: [
            ["1階", "受付", "ロビー"],
            ["2階", "会議室", "展示室"],
            [
                "B1", "駐車場",
                {
                    text: "卜イレ",
                    bad: "卜",
                    note: "カタカナの「ト」ではなく、漢字の「卜」（ぼく）でした。"
                }
            ]
        ]
    }
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

// モード3用
let sceneOrder = [];
let sceneIndex = 0;
let currentSeg = null;

function shuffle(array) {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

function getModeName() {
    if (mode === "time") return "タイムアタック";
    if (mode === "scene") return "日常の違和感";
    if (mode === "object") return "モノの違和感";
    return "スコアアタック";
}

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
    } else if (mode === "scene") {
        modeLabel.textContent = "日常の違和感";
        extraLabel.textContent = "LIFE";
        timerArea.hidden = true;
        sceneOrder = shuffle(scenes);
        sceneIndex = 0;
    } else if (mode === "object") {
        modeLabel.textContent = "モノの違和感";
        extraLabel.textContent = "LIFE";
        timerArea.hidden = true;
        sceneIndex = 0;
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

function markOdd(button, seg) {
    const i = seg.text.indexOf(seg.bad);
    const mark = document.createElement("mark");

    mark.textContent = seg.bad;
    button.textContent = "";
    button.append(
        seg.text.slice(0, i),
        mark,
        seg.text.slice(i + seg.bad.length)
    );
}

function startSceneRound() {
    if (gameOver) return;

    if (sceneIndex >= sceneOrder.length) {
        endGame("clear");
        return;
    }

    answered = false;
    stage = sceneIndex + 1;
    updateStatus();

    const scene = sceneOrder[sceneIndex];

    stageTitle.textContent = `場面 ${sceneIndex + 1} / ${sceneOrder.length}`;
    instruction.textContent = "1か所だけ、違和感がある。";
    answerDisplay.textContent = "";
    message.textContent = "違和感のある言葉をクリックしよう。";

    board.innerHTML = "";
    board.className = "game-board scene-board";
    board.style.gridTemplateColumns = "";

    const card = document.createElement("div");
    card.className = `scene-card kind-${scene.kind}`;

    const place = document.createElement("p");
    place.className = "scene-place";
    place.textContent = scene.place;
    card.appendChild(place);

    cells = [];

    scene.lines.forEach((line) => {
        const row = document.createElement("div");
        row.className = "scene-line";

        line.forEach((item) => {
            const seg = typeof item === "string" ? { text: item } : item;
            const index = cells.length;
            const button = document.createElement("button");

            button.type = "button";
            button.className = "seg";
            button.textContent = seg.text;

            if (seg.bad) {
                targetIndex = index;
                currentTarget = seg.bad;
                currentSeg = seg;
            }

            button.addEventListener("click", () => {
                handleSceneClick(index, button);
            });

            cells.push(button);
            row.appendChild(button);
        });

        card.appendChild(row);
    });

    board.appendChild(card);
}

function handleSceneClick(index, button) {
    if (answered || gameOver || button.disabled) return;

    if (index === targetIndex) {
        // 正解
        answered = true;
        correctCount++;
        score += 10;
        sceneIndex++;

        button.classList.add("correct");
        markOdd(button, currentSeg);
        cells.forEach((c) => { c.disabled = true; });

        answerDisplay.textContent =
            `正解！「${currentTarget}」が紛れていました。`;
        message.textContent = currentSeg.note;

        scoreText.textContent = score;

        nextRoundTimeout = setTimeout(() => {
            if (!gameOver) startSceneRound();
        }, 2600);

    } else {
        // 不正解
        button.classList.add("wrong");
        button.disabled = true;
        lives--;
        updateStatus();

        if (lives <= 0) {
            answered = true;
            cells.forEach((c) => { c.disabled = true; });
            cells[targetIndex].classList.add("reveal");
            markOdd(cells[targetIndex], currentSeg);

            answerDisplay.textContent =
                `正解は「${currentTarget}」でした。`;
            message.textContent = currentSeg.note;

            nextRoundTimeout = setTimeout(() => {
                endGame("life");
            }, 2600);
            return;
        }

        message.textContent = `不正解！ ライフが減りました。残り ${lives}`;
    }
}

// ===== モード4：モノの違和感 =====
// 文字ではなく「かたち・色・ならび」の違和感。やさしい順に並べてある。
const objectRounds = [
    {
        place: "お米の選別", type: "rice", variant: "yellow",
        cols: 8, rows: 6,
        bad: "黄ばんだ米",
        note: "1粒だけ、黄ばんだ米が混ざっていました。"
    },
    {
        place: "卵のパック", type: "egg",
        cols: 6, rows: 2,
        bad: "赤玉",
        note: "白い卵の中に、1個だけ赤みがかった卵（赤玉）が混ざっていました。"
    },
    {
        place: "壁掛け時計", type: "clock",
        bad: "傾いた目盛り",
        note: "12本の目盛りのうち、1本だけ傾いていました。毎日見ていても気づきにくい。"
    },
    {
        place: "お米の選別", type: "rice", variant: "spot",
        cols: 8, rows: 6,
        bad: "黒い点のある米",
        note: "黒い点のある米（斑点米）でした。お米の選別でも取り除かれる粒です。"
    },
    {
        place: "お米の選別", type: "rice", variant: "small",
        cols: 8, rows: 6,
        bad: "小さい米",
        note: "ほんの少しだけ小さい米でした。形がそろっていると、見落としやすい。"
    },
    {
        place: "お米の選別", type: "rice", variant: "crack",
        cols: 8, rows: 6,
        bad: "ひびの入った米",
        note: "ひびの入った米（胴割れ米）でした。最後は線1本の違いです。"
    }
];

function rand(min, max) {
    return min + Math.random() * (max - min);
}

function riceSvg(odd, variant) {
    const angle = rand(-30, 30).toFixed(1);
    const rx = (8 * rand(0.96, 1.04)).toFixed(2);
    let ry = 14 * rand(0.96, 1.04);
    let fill = "#f4efe0";
    let extra = "";

    if (odd) {
        if (variant === "yellow") fill = "#e6c864";
        if (variant === "small") ry = 11.2;
        if (variant === "spot") {
            extra = '<circle cx="20" cy="14.5" r="2.1" fill="#4a3b2c"/>';
        }
        if (variant === "crack") {
            extra = '<path d="M13.5 22 L26.5 19.5" stroke="#a08f6b" ' +
                'stroke-width="1.3" fill="none" stroke-linecap="round"/>';
        }
    }

    return `<svg viewBox="0 0 40 40" aria-hidden="true">` +
        `<g transform="rotate(${angle} 20 20)">` +
        `<ellipse cx="20" cy="20" rx="${rx}" ry="${ry.toFixed(2)}" ` +
        `fill="${fill}" stroke="#cfc6ad" stroke-width="1"/>${extra}</g></svg>`;
}

function eggSvg(odd) {
    const fill = odd ? "#efd9ba" : "#f8f1e4";

    return `<svg viewBox="0 0 40 48" aria-hidden="true">` +
        `<path d="M20 4 C30 4 35 22 35 30 C35 39 28 44 20 44 ` +
        `C12 44 5 39 5 30 C5 22 10 4 20 4 Z" ` +
        `fill="${fill}" stroke="#d8cbb2" stroke-width="1.2"/></svg>`;
}

function tickSvg(angle, odd) {
    const a = angle + (odd ? 13 : 0);

    return `<svg viewBox="0 0 40 40" aria-hidden="true">` +
        `<rect x="18" y="7" width="4" height="26" rx="2" fill="#2b2b28" ` +
        `transform="rotate(${a} 20 20)"/></svg>`;
}

function startObjectRound() {
    if (gameOver) return;

    if (sceneIndex >= objectRounds.length) {
        endGame("clear");
        return;
    }

    answered = false;
    stage = sceneIndex + 1;
    updateStatus();

    const round = objectRounds[sceneIndex];

    stageTitle.textContent = `場面 ${sceneIndex + 1} / ${objectRounds.length}`;
    instruction.textContent = "1つだけ、ちがうものが混ざっている。";
    answerDisplay.textContent = "";
    message.textContent = "違和感のあるものをクリックしよう。";

    board.innerHTML = "";
    board.className = "game-board scene-board";
    board.style.gridTemplateColumns = "";

    const kind = round.type === "clock" ? "clock"
        : round.type === "egg" ? "egg" : "rice";

    const card = document.createElement("div");
    card.className = `scene-card kind-${kind}`;

    const place = document.createElement("p");
    place.className = "scene-place";
    place.textContent = round.place;
    card.appendChild(place);

    cells = [];
    currentSeg = round;
    currentTarget = round.bad;

    const makeButton = (index, html) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "obj";
        button.setAttribute("aria-label", `${index + 1}番目`);
        button.innerHTML = html;
        button.addEventListener("click", () => {
            handleObjectClick(index, button);
        });

        cells.push(button);
        return button;
    };

    if (round.type === "clock") {
        targetIndex = Math.floor(Math.random() * 12);

        const face = document.createElement("div");
        face.className = "clock-face";

        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const rad = angle * Math.PI / 180;
            const button = makeButton(i, tickSvg(angle, i === targetIndex));

            // 300×300 の文字盤を基準に、% で配置（画面幅に合わせて縮む）
            button.style.left = `${(150 + 112 * Math.sin(rad) - 20) / 3}%`;
            button.style.top = `${(150 - 112 * Math.cos(rad) - 20) / 3}%`;
            face.appendChild(button);
        }

        // 針（10時10分）。飾りなのでクリックできない
        const hands = document.createElement("div");
        hands.innerHTML =
            '<svg class="clock-hands" viewBox="0 0 300 300" aria-hidden="true">' +
            '<line x1="150" y1="150" x2="99.2" y2="114.4" stroke="#2b2b28" ' +
            'stroke-width="7" stroke-linecap="round"/>' +
            '<line x1="150" y1="150" x2="229.7" y2="104" stroke="#2b2b28" ' +
            'stroke-width="4" stroke-linecap="round"/>' +
            '<circle cx="150" cy="150" r="6" fill="#2b2b28"/></svg>';
        face.appendChild(hands.firstChild);

        card.appendChild(face);
    } else {
        const total = round.cols * round.rows;
        targetIndex = Math.floor(Math.random() * total);

        const grid = document.createElement("div");
        grid.className = "obj-grid";
        grid.style.gridTemplateColumns = `repeat(${round.cols}, minmax(0, 1fr))`;

        for (let i = 0; i < total; i++) {
            const odd = i === targetIndex;
            const html = round.type === "egg"
                ? eggSvg(odd)
                : riceSvg(odd, round.variant);

            grid.appendChild(makeButton(i, html));
        }

        card.appendChild(grid);
    }

    board.appendChild(card);
}

function handleObjectClick(index, button) {
    if (answered || gameOver || button.disabled) return;

    if (index === targetIndex) {
        // 正解
        answered = true;
        correctCount++;
        score += 10;
        sceneIndex++;

        button.classList.add("correct");
        cells.forEach((c) => { c.disabled = true; });

        scoreText.textContent = score;
        answerDisplay.textContent = `正解！「${currentTarget}」でした。`;
        message.textContent = currentSeg.note;

        nextRoundTimeout = setTimeout(() => {
            if (!gameOver) startObjectRound();
        }, 2600);

    } else {
        // 不正解
        button.classList.add("wrong");
        button.disabled = true;
        lives--;
        updateStatus();

        if (lives <= 0) {
            answered = true;
            cells.forEach((c) => { c.disabled = true; });
            cells[targetIndex].classList.add("reveal");

            answerDisplay.textContent =
                `正解は「${currentTarget}」でした。`;
            message.textContent = currentSeg.note;

            nextRoundTimeout = setTimeout(() => {
                endGame("life");
            }, 2600);
            return;
        }

        message.textContent = `不正解！ ライフが減りました。残り ${lives}`;
    }
}

function startRound() {
    if (gameOver) return;

    if (mode === "scene") {
        startSceneRound();
        return;
    }

    if (mode === "object") {
        startObjectRound();
        return;
    }

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
    board.className = "game-board";

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
    } else if (reason === "clear") {
        resultTitle.textContent = "全部見つけた！";
        resultMessage.textContent = mode === "object"
            ? "身近なモノに潜む違和感を、すべて見つけました。"
            : "身近な場面に潜む違和感を、すべて見つけました。";
    } else {
        resultTitle.textContent = "ゲーム終了！";
        resultMessage.textContent =
            "最後まで挑戦してくれてありがとう。";
    }

    resultMode.textContent = getModeName();

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