// ===============================
// ▼ 診断質問（ここに追加するだけ）
// ===============================
const questions = [
    { text: "ギャンブル等についてうそをついたことがありますか？", weight: 3 },
    { text: "負けた分を別の日によく取り返しにいきますか？", weight: 3 },
    // ★大事な質問
    { text: "自分にギャンブルの問題があると思ってますか？", weight: 1 },
    { text: "思っていた軍資金をこえて続けてしまう？", weight: 1 },

    // 通常質問（ここに追加可能）
    { text: "自分のギャンブル等の行動について非難されたことはありますか？", weight: 2 },
    { text: "自分のギャンブル等の行動に罪悪感を感じたことは？", weight: 1 },
    { text: "やめられないとわかっていながらやめたいと感じたことはありますか？", weight: 1 },
    { text: "ギャンブル等の関わりについて隠したことはありますか？", weight: 1 },
    { text: "ギャンブルのためのお金を借りて、返せなくなった時はありますか？", weight: 2 },
    { text: "ギャンブル等のために仕事や授業を休んだことはありますか？", weight: 2 },
    { text: "ギャンブル等の借金を返済するために、さらにお金を借りたことはありますか？", weight: 2 },


];

let current = 0;
let score = 0;

// HTML要素
const questionBox = document.getElementById("questionBox");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

// 初期表示
showQuestion();

function showQuestion() {
    if (current >= questions.length) {
        finishTest();
        return;
    }
    questionBox.innerText = questions[current].text;
}

yesBtn.onclick = () => {
    score += questions[current].weight;
    current++;
    showQuestion();
};

noBtn.onclick = () => {
    current++;
    showQuestion();
};

// 診断終了処理
function finishTest() {
    localStorage.setItem("riskScore", score);
    window.location.href = "result.html";
}