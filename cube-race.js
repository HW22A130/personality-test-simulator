// ===============================
// キューブレース（学習用の簡易体験）
// - 連単 / 連複 追加
// - 5レース後に使用金額内訳＋注意メッセージ
// - オッズ（配当倍率）を控えめに調整
// ===============================

const START_POINT = 5000;

// UI
const pointEl = document.getElementById("point");
const raceCountEl = document.getElementById("raceCount");
const cubeListEl = document.getElementById("cubeList");
const betTypeEl = document.getElementById("betType");
const betAmountEl = document.getElementById("betAmount");
const resultAreaEl = document.getElementById("resultArea");
const raceTrackEl = document.getElementById("raceTrack");
const messageBoxEl = document.getElementById("messageBox");
const pickHintEl = document.getElementById("pickHint");

// 状態
let point = Number(localStorage.getItem("cubeRacePoint")) || START_POINT;
let raceCount = Number(localStorage.getItem("cubeRaceCount")) || 0;

// 5レース集計
let spentTotal = Number(localStorage.getItem("cubeRaceSpentTotal")) || 0;
let spentByType = JSON.parse(localStorage.getItem("cubeRaceSpentByType") || "{}");

// 選択状態
let selected = []; // キューブ番号（1..4）を入れる

// キューブ定義（見た目）
const cubes = [
    { id: 1, label: "CUBE 1" },
    { id: 2, label: "CUBE 2" },
    { id: 3, label: "CUBE 3" },
    { id: 4, label: "CUBE 4" },
];

// 券種ごとの「必要選択数」
function requiredPicks(type) {
    if (type === "単勝" || type === "複勝") return 1;
    // ワイド / 連複 / 連単
    return 2;
}

// オッズ（配当倍率）を全体的に控えめに
// ※ 実際のオッズとは違う学習用の簡易レンジ
const ODDS_RANGE = {
    "単勝": [1.8, 3.2],
    "複勝": [1.2, 1.9],
    "ワイド": [1.4, 2.6],
    "連複": [2.2, 4.8],
    "連単": [3.5, 8.0],
};

function randBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

function formatP(n) {
    return `${Math.round(n).toLocaleString("ja-JP")}P`;
}

// ===============================
// 初期描画
// ===============================
renderCubes();
updateUI();
updatePickHint();
renderTrack();

// 券種変更時：選択数のルールを案内＋必要なら選択を整理
betTypeEl.addEventListener("change", () => {
    updatePickHint();

    const need = requiredPicks(betTypeEl.value);
    if (selected.length > need) {
        selected = selected.slice(0, need);
        renderCubes();
    }

    messageBoxEl.innerHTML =
        `券種：<strong>${betTypeEl.value}</strong> を選びました。<br>` +
        (need === 1
            ? "キューブを<strong>1つ</strong>選んでください。"
            : "キューブを<strong>2つ</strong>選んでください（連単は選んだ順番も扱います）。");
});

// ===============================
// キューブ表示
// ===============================
function renderCubes() {
    cubeListEl.innerHTML = "";

    cubes.forEach(c => {
        const div = document.createElement("div");
        div.className = "cube" + (selected.includes(c.id) ? " selected" : "");
        div.textContent = c.label;

        div.addEventListener("click", () => {
            const type = betTypeEl.value;
            const need = requiredPicks(type);

            if (selected.includes(c.id)) {
                // もう一度押したら解除
                selected = selected.filter(x => x !== c.id);
            } else {
                if (selected.length >= need) {
                    // 先に選んだ方を外して入れ替え（直感操作）
                    selected.shift();
                }
                selected.push(c.id);
            }

            renderCubes();
            updatePickHint();
        });

        cubeListEl.appendChild(div);
    });
}

function updatePickHint() {
    const type = betTypeEl.value;
    const need = requiredPicks(type);

    if (need === 1) {
        pickHintEl.textContent = `選択数：1（今 ${selected.length}）`;
    } else {
        pickHintEl.textContent =
            `選択数：2（今 ${selected.length}）` +
            (type === "連単" ? " ※選んだ順番が「1着→2着」になります" : "");
    }
}

// ===============================
// レース演出（簡易）
// ===============================
function renderTrack() {
    raceTrackEl.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const runner = document.createElement("div");
        runner.className = "runner";
        runner.style.top = `${20 + i * 56}px`;
        runner.textContent = `CUBE ${i + 1}`;
        raceTrackEl.appendChild(runner);
    }
}

// ランダムな順位（1..4をシャッフル）
function makeResultOrder() {
    const arr = [1, 2, 3, 4];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr; // [1着, 2着, 3着, 4着]
}

function animateRace(order) {
    const runners = Array.from(raceTrackEl.querySelectorAll(".runner"));
    // いったんリセット
    runners.forEach(r => {
        r.classList.remove("win", "lose");
        r.style.transform = "translateX(0px)";
    });

    // ゴール位置（px）
    const finish = 560;

    // 順位に応じて到達距離を変える（1着が一番遠い）
    const rankToX = {};
    order.forEach((cubeId, idx) => {
        // 1着=finish, 2着=finish-60, ...
        rankToX[cubeId] = finish - idx * 60;
    });

    // 動かす
    runners.forEach((r, idx) => {
        const cubeId = idx + 1;
        const x = rankToX[cubeId];
        r.style.transform = `translateX(${x}px)`;
    });
}

// ===============================
// 勝敗判定
// ===============================
function judge(type, order, picks) {
    const first = order[0];
    const second = order[1];

    if (type === "単勝") {
        return picks[0] === first;
    }

    if (type === "複勝") {
        return picks[0] === first || picks[0] === second;
    }

    if (type === "ワイド") {
        if (picks.length !== 2) return false;
        const s = new Set([first, second]);
        return s.has(picks[0]) && s.has(picks[1]);
    }

    if (type === "連複") {
        if (picks.length !== 2) return false;
        const s = new Set([first, second]);
        return s.has(picks[0]) && s.has(picks[1]);
    }

    if (type === "連単") {
        if (picks.length !== 2) return false;
        return picks[0] === first && picks[1] === second;
    }

    return false;
}

function calcOdds(type) {
    const [min, max] = ODDS_RANGE[type];
    // 小数1桁に整形（見た目）
    const v = randBetween(min, max);
    return Math.round(v * 10) / 10;
}

// ===============================
// 賭け処理（HTMLのonclickから呼ばれる）
// ===============================
window.buyTicket = function buyTicket() {
    const type = betTypeEl.value;
    const need = requiredPicks(type);

    if (selected.length !== need) {
        alert(`この券種はキューブを${need}つ選ぶ必要があります。`);
        return;
    }

    let bet = Number(betAmountEl.value);
    if (!Number.isFinite(bet) || bet <= 0) {
        alert("賭けポイントを正しく入力してください。");
        return;
    }

    // 100刻みに丸め
    bet = Math.round(bet / 100) * 100;
    bet = clamp(bet, 100, 999999);
    betAmountEl.value = bet;

    if (bet > point) {
        alert("所持ポイントが足りません。");
        return;
    }

    // 賭け実行：まず引く
    point -= bet;

    // ログ集計
    spentTotal += bet;
    spentByType[type] = (spentByType[type] || 0) + bet;

    // レース結果生成
    const order = makeResultOrder();

    // オッズ（控えめ）
    const odds = calcOdds(type);

    // 当たり判定
    const isWin = judge(type, order, selected);

    // 払戻
    let payout = 0;
    if (isWin) {
        payout = Math.floor(bet * odds);
        point += payout;
    }

    raceCount += 1;

    // UI更新＆演出
    updateUI();
    animateRace(order);

    // 結果表示
    const pickText =
        (type === "単勝" || type === "複勝")
            ? `選択：CUBE ${selected[0]}`
            : (type === "連単"
                ? `選択：CUBE ${selected[0]} → CUBE ${selected[1]}`
                : `選択：CUBE ${selected[0]} ＆ CUBE ${selected[1]}`);

    const orderText = `結果：1着 CUBE ${order[0]} / 2着 CUBE ${order[1]} / 3着 CUBE ${order[2]} / 4着 CUBE ${order[3]}`;

    const header =
        `【${raceCount}レース目】${type}\n` +
        `${pickText}\n` +
        `${orderText}\n` +
        `賭け：${formatP(bet)}（オッズ目安：×${odds}）\n` +
        (isWin ? `的中！ 払戻：${formatP(payout)}\n` : `はずれ…\n`);

    resultAreaEl.textContent = header + "\n" + resultAreaEl.textContent;

    // 5レース後にまとめ表示
    if (raceCount === 5) {
        appendFiveRaceSummary();
    }

    persist();
};

// ===============================
// 5レースまとめ
// ===============================
function appendFiveRaceSummary() {
    const lines = [];
    lines.push("========== 5レース終了：使用内訳 ==========");
    lines.push(`合計使用：${formatP(spentTotal)}`);

    Object.keys(spentByType).forEach(k => {
        lines.push(`・${k}：${formatP(spentByType[k])}`);
    });

    lines.push("");
    lines.push("【短時間でできるオンライン投票の注意点】");
    lines.push("・1回が短いほど「使った感覚」が薄くなり、回数が増えやすい");
    lines.push("・少額でも積み重なると、短時間で金額が大きくなる");
    lines.push("・判断が雑になりやすく、追いかけ行動（チェイシング）につながりやすい");
    lines.push("========================================");

    resultAreaEl.textContent = lines.join("\n") + "\n\n" + resultAreaEl.textContent;

    // ここで「メッセージ欄」にも表示（目立たせる）
    messageBoxEl.innerHTML =
        `<strong>5レース終了</strong>：使用内訳と注意メッセージを結果欄に追加しました。<br>` +
        `短時間で繰り返せるほど、金額と回数が増えやすい点に注意してください。`;
}

// ===============================
// UI / 永続化
// ===============================
function updateUI() {
    pointEl.textContent = point.toLocaleString("ja-JP");
    raceCountEl.textContent = raceCount.toString();
}

function persist() {
    localStorage.setItem("cubeRacePoint", String(point));
    localStorage.setItem("cubeRaceCount", String(raceCount));
    localStorage.setItem("cubeRaceSpentTotal", String(spentTotal));
    localStorage.setItem("cubeRaceSpentByType", JSON.stringify(spentByType));

    // 管理ログ（任意）
    const logs = JSON.parse(localStorage.getItem("adminLogs") || "[]");
    logs.push({
        type: "cube_race",
        raceCount,
        point,
        spentTotal,
        spentByType,
        at: new Date().toISOString()
    });
    localStorage.setItem("adminLogs", JSON.stringify(logs));
}