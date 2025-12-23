// ===============================
// ▼ ユーザーID（匿名・行動ログ用）
// ===============================
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    localStorage.setItem("userId", userId);
}

// ===============================
// ▼ 診断質問（ここに追加するだけ）
// ===============================
const questions = [
    { text: "ギャンブル等についてうそをついたことがありますか？", weight: 3 },
    { text: "負けた分を別の日によく取り返しにいきますか？", weight: 3 },

    // ★重要質問
    { text: "自分にギャンブルの問題があると思っていますか？", weight: 1 },
    { text: "思っていた軍資金をこえて続けてしまいますか？", weight: 1 },

    // 通常質問
    { text: "自分のギャンブル等の行動について非難されたことはありますか？", weight: 2 },
    { text: "自分のギャンブル等の行動に罪悪感を感じたことはありますか？", weight: 1 },
    { text: "やめたいと思いながら続けてしまったことはありますか？", weight: 1 },
    { text: "ギャンブル等の関わりについて隠したことはありますか？", weight: 1 },
    { text: "ギャンブルのためにお金を借り、返せなくなったことはありますか？", weight: 2 },
    { text: "ギャンブル等のために仕事や授業を休んだことはありますか？", weight: 2 },
    { text: "借金返済のために、さらにお金を借りたことはありますか？", weight: 2 },
];

// ===============================
// ▼ 状態管理
// ===============================
let currentIndex = 0;
let totalScore = 0;

// ===============================
// ▼ HTML要素取得
// ===============================
const questionBox = document.getElementById("questionBox");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

// ===============================
// ▼ 初期表示
// ===============================
showQuestion();

// ===============================
// ▼ 関数群
// ===============================

// 質問表示
function showQuestion() {
    if (currentIndex >= questions.length) {
        finishTest();
        return;
    }
    questionBox.textContent = questions[currentIndex].text;
}

// 「はい」
yesBtn.onclick = () => {
    totalScore += questions[currentIndex].weight;
    currentIndex++;
    showQuestion();
};

// 「いいえ」
noBtn.onclick = () => {
    currentIndex++;
    showQuestion();
};

// 診断終了処理
function finishTest() {
    const resultData = {
        userId: userId,
        riskScore: totalScore,
        questionCount: questions.length,
        finishedAt: new Date().toISOString()
    };

    // ユーザー個別結果
    localStorage.setItem("riskResult", JSON.stringify(resultData));

    // 管理者用ログ（累積）
    const adminLogs = JSON.parse(localStorage.getItem("adminLogs")) || [];
    adminLogs.push(resultData);
    localStorage.setItem("adminLogs", JSON.stringify(adminLogs));

    // 結果ページへ
    window.location.href = "result.html";
}