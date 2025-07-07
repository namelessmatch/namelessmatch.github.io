// ✅ GASの汎用取得関数（URLは自分のWebアプリURLに置換！）
function fetchJson(mode = "weekly", type = null) {
    const base = "https://script.google.com/macros/s/AKfycbxFblthbQMXLruzVhZAtljX_w1JP8rDxu8B-vv5G0JVeg523LQeFFG1hzG-GC9-UG9miw/exec"; // ← URL差し替え必要
    const url = `${base}?mode=${mode}` + (type ? `&type=${type}` : "");
    return fetch(url).then(res => res.json());
}

// ✅ ランダム記事表示（ローディング演出＋テンプレCSSでフェード風に）
function loadRandomArticles(mode = "latest", type = null, count = 3, containerId = "latest-list") {
    const url = `https://script.google.com/macros/s/AKfycbxFblthbQMXLruzVhZAtljX_w1JP8rDxu8B-vv5G0JVeg523LQeFFG1hzG-GC9-UG9miw/exec?mode=${mode}` + (type ? `&type=${type}` : "");

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

// ✅ LINEスタンプボタンのクリックを gtag に送信（全ページ共通で動作）
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('a[href="https://store.line.me/stickershop/product/30861516/ja"]');
  links.forEach(link => {
    link.addEventListener("click", () => {
      let label = "スタンプ不明";

      // ALTテキスト or テキストでラベルを決定
      const img = link.querySelector("img");
      if (img && img.alt) {
        label = img.alt;
      } else if (link.textContent.trim() !== "") {
        label = link.textContent.trim();
      }

      // GA送信（gtag）
      if (typeof gtag === "function") {
        gtag("event", "line_stamp_cta", {
          event_category: "cta",
          event_label: `LINEスタンプ（${label}）`
        });
      }
    });
  });
});

// ✅ 汎用：URLパラメータを取得（例：getParam("query")）
function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function renderArticleCard(item) {
  const div = document.createElement("div");
  div.className = "box transition";
  //div.style.opacity = 0;

  div.innerHTML = `
    <h3><a href="${item.URL}" target="_blank">${item.タイトル}</a></h3>
    <p><strong>ID:</strong> ${item.ID}</p>
    <p><strong>種別:</strong> ${item.種別}　<strong>媒体:</strong> ${item.媒体}</p>
    <p><strong>チャンネル:</strong> ${item.チャンネル}　<strong>対象:</strong> ${item.対象}</p>
    <p><strong>公開日:</strong> ${formatDate(item.公開日)}</p>
    <p><strong>要約:</strong> ${item.要約 || "（要約なし）"}</p>
    <p><strong>キーワード:</strong> ${item.キーワード || "（なし）"}</p>
  `;

  return div;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
