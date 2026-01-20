// ===============================
// ▼ ユーザーID（匿名・行動ログ用）
// ===============================
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    localStorage.setItem("userId", userId);
}

// ===============================
// ▼ 診断質問
// ===============================
const questions = [
    {
        text: "公営ギャンブル等をしていること、およびその結果について、家族や周囲の人に事実と違う説明をしたことはありますか？",
        weight: 3,
        image: "images/q01.png"
    },
    {
        text: "公営ギャンブルなどでの損失分を取り返そうとして、別の日に続けて参加したことはありますか？",
        weight: 3,
        image: "images/q02.png"
    },

    // ★重要質問
    {
        text: "自分の公営ギャンブル等との関わり方について、問題があると考えていますか？",
        weight: 1,
        image: "images/q03.png"
    },
    {
        text: "あらかじめ決めていた金額をこえて、公営ギャンブル等を続けてしまったことはありますか？",
        weight: 1,
        image: "images/q04.png"
    },

    // 通常質問
    {
        text: "公営ギャンブル等のことで、周囲の人から注意されたり、心配されたことはありますか？",
        weight: 2,
        image: "images/q05.png"
    },
    {
        text: "公営ギャンブル等のあとで、後悔や引っかかりを感じたことはありますか？",
        weight: 1,
        image: "images/q06.png"
    },
    {
        text: "公営ギャンブル等をやめたいと思いながら、続けてしまったことはありますか？",
        weight: 1,
        image: "images/q07.png"
    },
    {
        text: "公営ギャンブル等に使った時間や金額を、周囲の人に伝えなかったことはありますか？",
        weight: 1,
        image: "images/q08.png"
    },
    {
        text: "公営ギャンブル等のためにお金を借り、返済に困ったことはありますか？",
        weight: 2,
        image: "images/q09.png"
    },
    {
        text: "公営ギャンブル等のために仕事や授業を休んだことはありますか？",
        weight: 2,
        image: "images/q10.png"
    },
    {
        text: "公営ギャンブル等でできた借金返済のために、さらにお金を借りたことはありますか？",
        weight: 2,
        image: "images/q11.png"
    }
];

// ===============================
// ▼ 状態管理
// ===============================
let currentIndex = 0;
let totalScore = 0;
let phase = "question"; // question | time

// ===============================
// ▼ HTML要素
// ===============================
const questionBox = document.getElementById("questionBox");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

// ===============================
// ▼ 初期表示
// ===============================
showQuestion();

// ===============================
// ▼ 質問表示
// ===============================
function showQuestion() {
    if (currentIndex >= questions.length) {
        showTimeInput();
        return;
    }

    // ※ 現状はテキストのみ表示（画像はcheck.html側で対応可能）
    questionBox.textContent = questions[currentIndex].text;
}

// ===============================
// ▼ 回答処理
// ===============================
yesBtn.onclick = () => {
    if (phase !== "question") return;
    totalScore += questions[currentIndex].weight;
    currentIndex++;
    showQuestion();
};

noBtn.onclick = () => {
    if (phase !== "question") return;
    currentIndex++;
    showQuestion();
};

// ===============================
// ▼ 時間入力画面
// ===============================
function showTimeInput() {
    phase = "time";

    document.querySelector(".buttons").style.display = "none";

    questionBox.innerHTML = `
      <p style="font-size:16px;">
        1日の自由時間のうち、<br>
        <strong>公営ギャンブル等に使っている割合</strong>はどれくらいですか？
      </p>

      <div style="
        margin:20px auto;
        width:180px;
        height:180px;
        border-radius:50%;
        background:conic-gradient(#d32f2f 0% 20%, #e0e0e0 20% 100%);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        font-weight:bold;"
        id="donut">
        <span id="donutText">20%</span>
      </div>

      <input type="range" min="0" max="100" value="20" id="timeSlider">
      <p>現在：<strong><span id="rateValue">20</span>%</strong></p>

      <button id="finishBtn"
        style="
        margin-top:20px;
        width:100%;
        padding:15px;
        font-size:18px;
        border:none;
        border-radius:8px;
        background:#1976d2;
        color:#fff;">
        診断結果を見る
      </button>

      <p style="font-size:13px; color:#555;">
        ※ 仕事・睡眠・家事を除いた「自由時間」を想定しています
      </p>
    `;

    const slider = document.getElementById("timeSlider");
    const donut = document.getElementById("donut");
    const donutText = document.getElementById("donutText");
    const rateValue = document.getElementById("rateValue");

    function updateDonut(val) {
        donut.style.background =
            `conic-gradient(#d32f2f 0% ${val}%, #e0e0e0 ${val}% 100%)`;
        donutText.textContent = val + "%";
        rateValue.textContent = val;
    }

    slider.addEventListener("input", () => {
        updateDonut(slider.value);
    });

    document.getElementById("finishBtn").onclick = () => {
        finishTest(Number(slider.value));
    };
}

// ===============================
// ▼ 診断終了処理
// ===============================
function finishTest(timeRate) {
    const resultData = {
        userId,
        riskScore: totalScore,
        timeRate,
        questionCount: questions.length,
        finishedAt: new Date().toISOString()
    };

    localStorage.setItem("riskResult", JSON.stringify(resultData));

    const adminLogs = JSON.parse(localStorage.getItem("adminLogs")) || [];
    adminLogs.push(resultData);
    localStorage.setItem("adminLogs", JSON.stringify(adminLogs));

    window.location.href = "result.html";
}