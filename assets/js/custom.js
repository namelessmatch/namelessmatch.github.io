// ✅ GASの汎用取得関数（URLは自分のWebアプリURLに置換！）
function fetchJson(mode = "weekly", type = null) {
    const base = "https://script.google.com/macros/s/AKfycbz2Qro8GMl3RTOrcJoFq0Wy_6PrnLLoZfo1zTqWnJFjToYUE-ybb7cLMzRuctuWG4mu/exec"; // ← URL差し替え必要
    const url = `${base}?mode=${mode}` + (type ? `&type=${type}` : "");
    return fetch(url).then(res => res.json());
}

// ✅ ランダム記事表示（ローディング演出＋テンプレCSSでフェード風に）
function loadRandomArticles(mode = "latest", type = null, count = 3, containerId = "latest-list") {
    const url = `https://script.google.com/macros/s/AKfycbz2Qro8GMl3RTOrcJoFq0Wy_6PrnLLoZfo1zTqWnJFjToYUE-ybb7cLMzRuctuWG4mu/exec?mode=${mode}` + (type ? `&type=${type}` : "");

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "<li>読み込み中です...</li>";

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = "<li>コンテンツが見つかりませんでした。</li>";
                return;
            }
            container.innerHTML = ""; // ← ここが重要！
            data.slice(0, count).forEach(item => {
                const li = document.createElement("li");

                const a = document.createElement("a");
                a.href = item.URL || "#";
                a.className = "mini-post";
                a.target = "_blank";

                const title = document.createElement("h3");
                title.textContent = item.タイトル || "（無題）";

                const small = document.createElement("small");
                const date = new Date(item.公開日 || null);
                small.textContent = !isNaN(date) ? date.toLocaleDateString("ja-JP") : "";

                const p = document.createElement("p");
                p.textContent = item.要約 || "";

                a.appendChild(title);
                a.appendChild(small);
                a.appendChild(p);
                li.appendChild(a);

                container.appendChild(li);
            });


        })
        .catch(e => {
            console.error("読み込み失敗:", e);
            container.innerHTML = "<li>読み込みに失敗しました。</li>";
        });
}

// ✅ search.html 専用：本気検索処理（クエリ→all.json→フィルタ→表示）
function runSearchPage() {
    const container = document.getElementById("search-result");
    if (!container) return;

    // 検索語取得
    const query = new URLSearchParams(window.location.search).get("query");
    if (!query || query.trim() === "") {
        container.innerHTML = `<p class="loading">検索ワードが指定されていません。</p>`;
        return;
    }

    // ローディング演出
    container.innerHTML = `<p class="loading">「${query}」の検索結果を取得中…</p>`;

    // GASから all.json を取得
    const base = "https://script.google.com/macros/s/AKfycbz2Qro8GMl3RTOrcJoFq0Wy_6PrnLLoZfo1zTqWnJFjToYUE-ybb7cLMzRuctuWG4mu/exec"; // ←自分のURLに置換
    fetch(`${base}?mode=all`)
        .then(res => res.json())
        .then(data => {
            // フィルタ（タイトル・キーワード・要約 に query を含む）
            const result = data.filter(item =>
                (item.タイトル && item.タイトル.includes(query)) ||
                (item.キーワード && item.キーワード.includes(query)) ||
                (item.要約 && item.要約.includes(query))
            );

            if (result.length === 0) {
                container.innerHTML = `<p class="loading">「${query}」に一致する記事は見つかりませんでした。</p>`;
                return;
            }

            // 検索結果を表示（テンプレ内CSS活用）
            container.innerHTML = "";
            result.forEach(item => {
                const div = document.createElement("div");
                div.className = "box transition"; // ← テンプレ内クラス
                div.style.opacity = 0;

                div.innerHTML = `
          <h3><a href="${item.URL}" target="_blank">${item.タイトル}</a></h3>
          <p>${item.要約?.slice(0, 100) || "（要約なし）"}…</p>
        `;

                container.appendChild(div);
                setTimeout(() => {
                    div.style.opacity = 1;
                }, 50);
            });
        });
}
// ✅ LINE登録ボタンのクリックを gtag に送信（全ページ共通で動作）
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('a[href="https://lin.ee/7teX4nMG"]');
    links.forEach(link => {
        link.addEventListener("click", () => {
            let label = "場所不明";

            // aタグの中の画像 or テキストを判定
            const img = link.querySelector("img");
            if (img && img.alt) {
                label = img.alt;
            } else if (link.textContent.trim() !== "") {
                label = link.textContent.trim();
            }

            // GA送信
            if (typeof gtag === "function") {
                gtag("event", "line_cta", {
                    event_category: "cta",
                    event_label: `LINE登録ボタン（${label}）`
                });
            }
        });
    });
});
// ✅ 汎用：URLパラメータを取得（例：getParam("query")）
function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// ✅ 汎用：記事カードHTML生成（必要なら今後共通化できる）
function renderArticleCard(item) {
    const div = document.createElement("div");
    div.className = "box transition";
    div.style.opacity = 0;

    div.innerHTML = `
    <h3><a href="${item.URL}" target="_blank">${item.タイトル}</a></h3>
    <p>${item.要約?.slice(0, 100) || "（要約なし）"}…</p>
  `;

    return div;
}
// custom.js の末尾に追加
window.addEventListener("DOMContentLoaded", () => {
    // ページごとに表示すべきモードを切り替える
    if (document.getElementById("latest-list")) {
        loadRandomArticles("latest", null, 3, "latest-list");
    }
    if (document.getElementById("teacher-list")) {
        loadRandomArticles("weekly", "teacher", 3, "teacher-list");
    }
    if (document.getElementById("student-list")) {
        loadRandomArticles("weekly", "student", 3, "student-list");
    }
    if (document.getElementById("family-list")) {
        loadRandomArticles("weekly", "family", 3, "family-list");
    }
    if (document.getElementById("self-list")) {
        loadRandomArticles("weekly", "self", 3, "self-list");
    }
});
// サイドバー検索フォームの送信処理をJSで制御（クロスブラウザ対応）
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('#search form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const keyword = form.querySelector('input[name="query"]').value.trim();
      if (keyword !== "") {
        window.location.href = `/articles/search.html?query=${encodeURIComponent(keyword)}`;
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("search-result")) {
    runSearchPage();
  }
});
