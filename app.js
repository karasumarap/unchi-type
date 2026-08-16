/* ============================================================
   うんちMBTI - app.js
   4軸: HA(Home/Anywhere) / FR(Fast/Relax) / BS(Broadcast/Secret) / TD(Trust/Doubt)
   各軸3問・全12問・6段階回答 → 4文字タイプ判定
   ============================================================ */

(() => {
  "use strict";

  /* ----------------------------------------------------------
     1. 質問データ（回答value高いほど→の極に近づく）
  ---------------------------------------------------------- */
  const QUESTIONS = [
    { id: 1,  axis: "HA", text: "友達の家でも、便意が来たら遠慮なくうんこできる。" },
    { id: 2,  axis: "TD", text: "「これは屁だ」と思ったら、自分のケツを信じて勝負できる。" },
    { id: 3,  axis: "BS", text: "友達に「ちょっとうんこしてくるわ」と普通に言える。" },
    { id: 4,  axis: "FR", text: "うんち中は、気づいたらスマホを見ながら長居している。" },
    { id: 5,  axis: "HA", text: "海外で謎のトイレに遭遇しても、「穴があるならいける」と思う。" },
    { id: 6,  axis: "TD", text: "お腹の調子が怪しくても、屁だと信じて屁を出せる。" },
    { id: 7,  axis: "BS", text: "人生最高クラスの一本が出たら、誰かに報告したくなる。" },
    { id: 8,  axis: "FR", text: "うんちが出ても、「第二波がいるかもしれない」と少し待つ。" },
    { id: 9,  axis: "HA", text: "駅のトイレでも、コンビニでも、便座さえあれば戦える。" },
    { id: 10, axis: "TD", text: "過去に裏切られていても、また屁を信じてしまうと思う。" },
    { id: 11, axis: "BS", text: "恋人に、自分が今うんこしたいことを普通に伝えられる。" },
    { id: 12, axis: "FR", text: "トイレは排泄する場所というより、ちょっとした休憩所だと思う。" },
  ];

  const SCREENS = [
    QUESTIONS.slice(0, 4),
    QUESTIONS.slice(4, 8),
    QUESTIONS.slice(8, 12),
  ];

  const SCALE_LABELS = ["そう思わない", "そう思う"];

  /* ----------------------------------------------------------
     2. 軸メタ情報（結果画面のバー表示用）
     ※ leftLetter = 低スコア側 / rightLetter = 高スコア側
  ---------------------------------------------------------- */
  const AXIS_META = [
    { key: "HA", leftLetter: "H", leftLabel: "家派",       rightLetter: "A", rightLabel: "どこでも派",   color: "var(--blue-deep)" },
    { key: "FR", leftLetter: "F", leftLabel: "速攻", rightLetter: "R", rightLabel: "まったり長居", color: "var(--mint-deep)" },
    { key: "BS", leftLetter: "S", leftLabel: "秘密にしたい",   rightLetter: "B", rightLabel: "オープン報告",  color: "var(--pink-deep)" },
    { key: "TD", leftLetter: "D", leftLabel: "屁を疑う",      rightLetter: "T", rightLabel: "屁を信じる",   color: "var(--yellow-deep)" },
  ];

  /* ----------------------------------------------------------
     3. 16タイプ定義（コード順: [HA][FR][BS][TD]）
  ---------------------------------------------------------- */
  const TYPES = {
    HFBT: { name: "ホームベース速報部",     tagline: "自宅の便座に座った瞬間、最速でフィニッシュ。終わった瞬間みんなに「出た」と即報告するタイプ。" },
    HFBD: { name: "地元オープン慎重派",     tagline: "家じゃないと無理。でも速攻で済ませて、一応みんなには報告しておく系。屁のサインはあまり信じない。" },
    HFST: { name: "サイレント高速便座",     tagline: "自宅で瞬殺フィニッシュ、誰にも言わず涼しい顔。でも直感だけはガチで信じている。" },
    HFSD: { name: "要塞スピードステルス",   tagline: "家でしか無理、速攻で終わらせて誰にも言わない。屁も一切信用しない超慎重派。" },
    HRBT: { name: "リビング滞在実況者",     tagline: "自宅の便座で長居しつつ、堂々と実況するタイプ。直感には絶大な信頼を置いている。" },
    HRBD: { name: "おうち長期戦オープン派", tagline: "家じゃないと落ち着かないのに長居派。報告はするけど、屁のサインはあまり信じない。" },
    HRST: { name: "隠れ家まったり派",       tagline: "自分の巣で長居して直感を信じるけど、誰にも言わない静かなこだわり屋。" },
    HRSD: { name: "自宅要塞シークレット",   tagline: "家のトイレが最強の避難所。長居して、黙って、屁のサインも疑ってかかる超慎重派。" },
    AFBT: { name: "電撃遠征オープン部隊",   tagline: "どこでも即座に戦場にできる。サクッと終わらせて「出先で出た」と即報告する行動派。" },
    AFBD: { name: "スピード遠征シェア魂",   tagline: "アウェーOK、速攻で済ませて報告するタイプ。でも屁のサインはあまり信じていない。" },
    AFST: { name: "ノーマーク旅人",         tagline: "どこでも戦えるうえに速攻で終わらせて、誰にも言わない。直感だけは強く信じている。" },
    AFSD: { name: "ステルス遠征部隊",       tagline: "アウェーで速攻フィニッシュ、誰にも言わず、屁のサインも信じない完全独立型。" },
    ARBT: { name: "世界を旅する実況者",     tagline: "どこでも長居できて、堂々とみんなに共有する自由人。直感を信じて突き進むタイプ。" },
    ARBD: { name: "放浪シェア慎重派",       tagline: "アウェーで長居、報告はするけど屁のサインはあまり信じない。用心深い自由人。" },
    ARST: { name: "自由気ままな隠密",       tagline: "どこでも長居できるのに、誰にも言わず涼しい顔。直感は強く信じている一匹狼。" },
    ARSD: { name: "完全究極ステルス",       tagline: "どこでも長居、誰にも言わず、屁のサインも信じない。全方位に隙のない最強の慎重派。" },
  };

  const AURA_COLORS = ["#FFC7D6", "#BEF3DA", "#C4E4FF", "#FFEBA8"];

  /* ----------------------------------------------------------
     4. キャラクタープレースホルダー SVG
  ---------------------------------------------------------- */
  let svgUidCounter = 0;
  function characterSVG(auraColor) {
    const uid = `c${svgUidCounter++}`;
    return `
<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="うんちキャラクター">
  <defs>
    <linearGradient id="body-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFDDA1"/>
      <stop offset="55%" stop-color="#F3B15D"/>
      <stop offset="100%" stop-color="#D9944A"/>
    </linearGradient>
    <radialGradient id="aura-${uid}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${auraColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${auraColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <ellipse cx="100" cy="108" rx="96" ry="96" fill="url(#aura-${uid})"/>
  <ellipse cx="100" cy="200" rx="60" ry="10" fill="#6B4226" opacity="0.12"/>

  <path d="M40,190
           C25,190 20,165 35,155
           C20,140 28,115 52,110
           C40,95 50,72 75,68
           C68,52 82,34 100,38
           C104,24 124,20 132,34
           C150,30 162,46 156,62
           C176,64 184,86 170,100
           C186,112 184,138 166,148
           C178,162 170,186 148,188
           Z"
        fill="url(#body-${uid})" stroke="#B8783A" stroke-width="2" stroke-linejoin="round"/>

  <path d="M120,40 C126,26 116,14 104,18 C112,24 112,34 120,40 Z"
        fill="url(#body-${uid})" stroke="#B8783A" stroke-width="2" stroke-linejoin="round"/>

  <ellipse cx="82" cy="70" rx="18" ry="10" fill="#FFF3D9" opacity="0.75" transform="rotate(-18 82 70)"/>
  <ellipse cx="60" cy="130" rx="13" ry="7" fill="#FFF3D9" opacity="0.55" transform="rotate(-10 60 130)"/>

  <ellipse cx="78" cy="118" rx="7" ry="9" fill="#6B4226"/>
  <ellipse cx="122" cy="118" rx="7" ry="9" fill="#6B4226"/>
  <circle cx="80.5" cy="114" r="2.2" fill="#fff"/>
  <circle cx="124.5" cy="114" r="2.2" fill="#fff"/>

  <ellipse cx="60" cy="140" rx="9" ry="6" fill="#FF9DB8" opacity="0.55"/>
  <ellipse cx="140" cy="140" rx="9" ry="6" fill="#FF9DB8" opacity="0.55"/>

  <path d="M90,140 Q100,150 110,140" stroke="#6B4226" stroke-width="3.5" fill="none" stroke-linecap="round"/>

  <path d="M164,48 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 l8,-3 z" fill="#FFD75E" opacity="0.9"/>
</svg>`;
  }

  /* ----------------------------------------------------------
     5. 状態
  ---------------------------------------------------------- */
  const state = {
    answers: new Array(QUESTIONS.length).fill(null),
    screenIndex: 0,
  };

  /* ----------------------------------------------------------
     6. DOM参照
  ---------------------------------------------------------- */
  const screenStart = document.getElementById("screen-start");
  const screenQuiz = document.getElementById("screen-quiz");
  const screenResult = document.getElementById("screen-result");

  const btnStart = document.getElementById("btn-start");
  const btnNext = document.getElementById("btn-next");
  const btnRetry = document.getElementById("btn-retry");

  const quizQuestionsEl = document.getElementById("quiz-questions");
  const quizStepEl = document.getElementById("quiz-step");
  const quizCountEl = document.getElementById("quiz-count");
  const progressFillEl = document.getElementById("progress-fill");

  const resultCodeEl = document.getElementById("result-code");
  const resultNameEl = document.getElementById("result-name");
  const resultTaglineEl = document.getElementById("result-tagline");
  const resultAxesEl = document.getElementById("result-axes");
  const resultCharSlot = document.getElementById("result-char-slot");
  const startCharSlot = document.getElementById("start-char-slot");

  const toastEl = document.getElementById("toast");

  let lastResultCode = null;

  /* ----------------------------------------------------------
     7. 画面遷移
  ---------------------------------------------------------- */
  function showScreen(el) {
    [screenStart, screenQuiz, screenResult].forEach((s) => s.classList.remove("is-active"));
    el.classList.add("is-active");
    window.scrollTo(0, 0);
  }

  /* ----------------------------------------------------------
     8. クイズ画面描画
  ---------------------------------------------------------- */
  function renderQuizScreen(idx) {
    const questions = SCREENS[idx];
    quizStepEl.textContent = `${idx + 1} / ${SCREENS.length}`;
    quizCountEl.textContent = `Q${questions[0].id}–${questions[questions.length - 1].id}`;

    quizQuestionsEl.innerHTML = questions
      .map((q, i) => {
        const selected = state.answers[q.id - 1];
        const dots = [1, 2, 3, 4, 5, 6]
          .map(
            (v) => `
          <button type="button" class="dot-btn${selected === v ? " is-selected" : ""}"
                  data-qid="${q.id}" data-value="${v}"
                  aria-label="${v}"></button>`
          )
          .join("");

        return `
        <div class="q-card">
          <span class="q-index">Q${q.id}</span>
          <p class="q-text">${q.text}</p>
          <div class="q-scale">
            <div class="q-scale-labels">
              <span>${SCALE_LABELS[0]}</span>
              <span>${SCALE_LABELS[1]}</span>
            </div>
            <div class="q-scale-dots">${dots}</div>
          </div>
        </div>`;
      })
      .join("");

    updateNextButtonState();
    updateProgress();
  }

  function updateNextButtonState() {
    const questions = SCREENS[state.screenIndex];
    const allAnswered = questions.every((q) => state.answers[q.id - 1] !== null);
    btnNext.disabled = !allAnswered;
    btnNext.textContent = state.screenIndex === SCREENS.length - 1 ? "結果を見る" : "次へ";
  }

  function updateProgress() {
    const answeredCount = state.answers.filter((v) => v !== null).length;
    const pct = (answeredCount / QUESTIONS.length) * 100;
    progressFillEl.style.width = `${pct}%`;
  }

  quizQuestionsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".dot-btn");
    if (!btn) return;
    const qid = Number(btn.dataset.qid);
    const value = Number(btn.dataset.value);
    state.answers[qid - 1] = value;

    const card = btn.closest(".q-card");
    card.querySelectorAll(".dot-btn").forEach((d) => d.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    updateNextButtonState();
    updateProgress();
  });

  btnNext.addEventListener("click", () => {
    if (state.screenIndex < SCREENS.length - 1) {
      state.screenIndex += 1;
      renderQuizScreen(state.screenIndex);
    } else {
      const result = computeResult();
      renderResult(result);
      showScreen(screenResult);
    }
  });

  btnStart.addEventListener("click", () => {
    state.screenIndex = 0;
    renderQuizScreen(0);
    showScreen(screenQuiz);
  });

  btnRetry.addEventListener("click", () => {
    state.answers = new Array(QUESTIONS.length).fill(null);
    state.screenIndex = 0;
    renderQuizScreen(0);
    showScreen(screenQuiz);
  });

  /* ----------------------------------------------------------
     9. 判定ロジック
  ---------------------------------------------------------- */
  function computeResult() {
    const sums = { HA: 0, FR: 0, BS: 0, TD: 0 };
    QUESTIONS.forEach((q) => {
      sums[q.axis] += state.answers[q.id - 1] || 0;
    });

    const letters = {
      HA: sums.HA > 10.5 ? "A" : "H",
      FR: sums.FR > 10.5 ? "R" : "F",
      BS: sums.BS > 10.5 ? "B" : "S",
      TD: sums.TD > 10.5 ? "T" : "D",
    };

    const code = `${letters.HA}${letters.FR}${letters.BS}${letters.TD}`;

    const percents = {};
    AXIS_META.forEach((meta) => {
      const sum = sums[meta.key];
      const rightPct = Math.round(((sum - 3) / 15) * 100);
      percents[meta.key] = { right: rightPct, left: 100 - rightPct };
    });

    return { code, sums, percents };
  }

  /* ----------------------------------------------------------
     10. 結果画面描画
  ---------------------------------------------------------- */
  function renderResult(result) {
    const { code, percents } = result;
    const typeData = TYPES[code] || { name: "謎のタイプ", tagline: "診断結果を取得できませんでした。" };

    lastResultCode = code;

    const typeIndex = Object.keys(TYPES).indexOf(code);
    const aura = AURA_COLORS[((typeIndex >= 0 ? typeIndex : 0)) % AURA_COLORS.length];

    resultCharSlot.innerHTML = characterSVG(aura);
    resultCodeEl.textContent = code;
    resultNameEl.textContent = typeData.name;
    resultTaglineEl.textContent = typeData.tagline;

    resultAxesEl.innerHTML = AXIS_META.map((meta) => {
      const p = percents[meta.key];
      const dominantIsRight = p.right > 50;
      return `
      <div class="axis-row">
        <div class="axis-labels">
          <span class="axis-label-left${!dominantIsRight ? " is-dominant" : ""}">${meta.leftLetter} ${meta.leftLabel} ${p.left}%</span>
          <span class="axis-label-right${dominantIsRight ? " is-dominant" : ""}">${meta.rightLabel} ${meta.rightLetter} ${p.right}%</span>
        </div>
        <div class="axis-bar">
          <div class="axis-bar-fill" style="width:${p.right}%; background:${meta.color};"></div>
        </div>
      </div>`;
    }).join("");
  }

  /* ----------------------------------------------------------
     11. シェア
  ---------------------------------------------------------- */
  function shareText() {
    const typeData = TYPES[lastResultCode];
    if (!typeData) return "うんちMBTI診断やってみた！";
    return `私は「${typeData.name}（${lastResultCode}）」タイプでした！ #うんちMBTI`;
  }

  function currentUrl() {
    return window.location.href.split("#")[0];
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("is-visible"), 2000);
  }

  document.getElementById("btn-share-x").addEventListener("click", () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}&url=${encodeURIComponent(currentUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  document.getElementById("btn-share-line").addEventListener("click", () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(shareText())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  document.getElementById("btn-share-copy").addEventListener("click", async () => {
    const text = `${shareText()} ${currentUrl()}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("コピーしました！");
    } catch (err) {
      showToast("コピーに失敗しました");
    }
  });

  /* ----------------------------------------------------------
     12. 初期化
  ---------------------------------------------------------- */
  startCharSlot.innerHTML = characterSVG("#FFD9A0");
  showScreen(screenStart);
})();
