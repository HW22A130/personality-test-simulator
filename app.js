// ===============================
// ▼ 診断質問（ここに追加するだけ）
// ===============================
const questions = [
    { text: "お金を使い過ぎたと感じることがある？", weight: 1 },
    { text: "時間を忘れて遊んでしまう？", weight: 1 },

    // ★大事な質問
    { text: "負けた分を取り返したいと思う？", weight: 3 },
    { text: "やめたいと思っても続けてしまう？", weight: 3 },

    // 通常質問（ここに追加可能）
    { text: "使った金額を家族に言えないと感じる？", weight: 2 },
    { text: "日常生活に支障が出ることがある？", weight: 2 },
    { text: "気晴らしとしてギャンブルを選びがち？", weight: 1 },
    { text: "勝つとテンションが異常に上がる？", weight: 1 },
    { text: "負けるとイライラすることが多い？", weight: 1 }
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