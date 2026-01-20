/*************************
 * 初期ポイント管理
 *************************/
let userPoint = Number(localStorage.getItem("cubeRacePoint")) || 50000;

function savePoint() {
    localStorage.setItem("cubeRacePoint", userPoint);
}

/*************************
 * UI初期化
 *************************/
const cubeList = document.getElementById("cubeList");
const pointEl = document.getElementById("point");
const resultArea = document.getElementById("resultArea");
const raceTrack = document.getElementById("raceTrack");

let selectedCubes = [];
let isRacing = false;

function updatePoint() {
    pointEl.textContent = userPoint;
    savePoint();
}

updatePoint();

/*************************
 * 人気・オッズ表示用
 *************************/
function getPopularityStars(pop) {
    const stars = Math.max(1, 6 - pop);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
}

function getOddsColor(odds) {
    if (odds < 2) return "#2e7d32";
    if (odds < 4) return "#f9a825";
    return "#c62828";
}

/*************************
 * オッズ計算
 *************************/
function getWinOdds(pop) {
    return 1 + pop * 0.6;
}

function getPlaceOdds(pop) {
    return 1.2 + pop * 0.3;
}

function getWideOdds(pop1, pop2) {
    return 1.5 + (pop1 + pop2) * 0.25;
}

/*************************
 * キューブ生成
 *************************/
for (let i = 1; i <= 8; i++) {
    const div = document.createElement("div");
    div.className = "cube";

    const winOdds = getWinOdds(i);

    div.innerHTML = `
        <strong>${i}番キューブ</strong><br>
        人気：${getPopularityStars(i)}<br>
        単勝：
        <span style="color:${getOddsColor(winOdds)}">
            ${winOdds.toFixed(1)}倍
        </span>
    `;

    div.onclick = () => toggleCube(i, div);
    cubeList.appendChild(div);
}

/*************************
 * 選択処理
 *************************/
function toggleCube(num, el) {
    if (isRacing) return;

    if (selectedCubes.includes(num)) {
        selectedCubes = selectedCubes.filter(n => n !== num);
        el.classList.remove("selected");
    } else {
        selectedCubes.push(num);
        el.classList.add("selected");
    }
}

/*************************
 * レースロジック
 *************************/
function runRace() {
    const cubes = [];

    for (let i = 1; i <= 8; i++) {
        const base = 1 / i;
        const rand = Math.random();
        cubes.push({
            num: i,
            score: base + rand
        });
    }

    cubes.sort((a, b) => b.score - a.score);
    return cubes;
}

/*************************
 * レース演出（番号固定）
 *************************/
function animateRace(result) {
    raceTrack.innerHTML = "";
    isRacing = true;

    const trackWidth = raceTrack.clientWidth - 100;

    // 着順を {番号: 順位} の形に変換
    const rankMap = {};
    result.forEach((c, index) => {
        rankMap[c.num] = index;
    });

    // 1〜8番を必ず同じ縦位置に配置
    for (let num = 1; num <= 8; num++) {
        const runner = document.createElement("div");
        runner.className = "runner";
        runner.textContent = `${num}番`;

        // 縦位置は番号固定
        runner.style.top = `${(num - 1) * 28 + 10}px`;
        raceTrack.appendChild(runner);

        const rank = rankMap[num];
        const moveX = trackWidth - rank * 40;

        setTimeout(() => {
            runner.style.transform = `translateX(${moveX}px)`;

            if (rank === 0) {
                runner.classList.add("win");
            } else {
                runner.classList.add("lose");
            }
        }, 100);
    }

    setTimeout(() => {
        isRacing = false;
    }, 2400);
}

/*************************
 * 券購入・判定
 *************************/
function buyTicket() {
    if (isRacing) return;

    const type = document.getElementById("betType").value;
    const amount = Number(document.getElementById("betAmount").value);

    if (amount > userPoint) {
        alert("ポイントが足りません");
        return;
    }

    if (
        (type !== "ワイド" && selectedCubes.length !== 1) ||
        (type === "ワイド" && selectedCubes.length !== 2)
    ) {
        alert("選択数が券種と合っていません");
        return;
    }

    userPoint -= amount;

    const result = runRace();
    animateRace(result);

    const race = {
        first: result[0].num,
        second: result[1].num,
        third: result[2].num
    };

    let hit = false;
    let payout = 0;

    if (type === "単勝" && race.first === selectedCubes[0]) {
        hit = true;
        payout = amount * getWinOdds(selectedCubes[0]);
    }

    if (
        type === "複勝" &&
        [race.first, race.second, race.third].includes(selectedCubes[0])
    ) {
        hit = true;
        payout = amount * getPlaceOdds(selectedCubes[0]);
    }

    if (type === "ワイド") {
        const [a, b] = selectedCubes;
        const top3 = [race.first, race.second, race.third];

        if (top3.includes(a) && top3.includes(b)) {
            hit = true;
            payout = amount * getWideOdds(a, b);
        }
    }

    payout = Math.floor(payout);
    userPoint += payout;
    updatePoint();

    resultArea.innerHTML = `
        <p><strong>レース結果</strong></p>
        <p>1着：${race.first}番 ／ 2着：${race.second}番 ／ 3着：${race.third}番</p>
        <hr>
        <p>${hit ? "🎉 的中！" : "❌ 不的中"}</p>
        <p>払い戻し：${payout}P</p>
    `;

    selectedCubes = [];
    document.querySelectorAll(".cube")
        .forEach(c => c.classList.remove("selected"));
}