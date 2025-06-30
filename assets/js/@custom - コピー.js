// public/assets/js/custom.js

document.addEventListener("DOMContentLoaded", async () => {
    // === 関連記事の動的読み込み処理 (テンプレ２.htmlにあったもの) ===
    const relatedUrl = "https://script.google.com/macros/s/AKfycbz2Qro8GMl3RTOrcJoFq0Wy_6PrnLLoZfo1zTqWnJFjToYUE-ybb7cLMzRuctuWG4mu/exec?mode=select20";
    const relatedContainer = document.querySelector(".related .recommend-list");

    if (relatedContainer) {
        try {
            const res = await fetch(relatedUrl);
            const articles = await res.json();

            if (!Array.isArray(articles) || articles.length === 0) return;

            // ランダムに2件選ぶ
            const shuffled = articles.sort(() => 0.5 - Math.random()).slice(0, 2);

            // 表示
            shuffled.forEach(item => {
                const li = document.createElement("li");

                const a = document.createElement("a");
                a.href = item.URL || "#";
                a.classList.add("article-link");

                // タイトル
                const title = document.createElement("strong");
                title.classList.add("article-title");
                title.textContent = item.タイトル || "（無題）";

                a.appendChild(title);
                a.appendChild(document.createElement("br"));

                // 日付と媒体（キーワードの代わり）
                const tags = document.createElement("small");
                tags.classList.add("article-tags");
                const date = item.公開日 ? `📅 ${item.公開日}` : "";
                const source = item.媒体 ? ` / 📰 ${item.媒体}` : "";
                tags.textContent = date + source;

                // 要約
                const summary = document.createElement("p");
                summary.classList.add("article-summary");
                summary.textContent = item.要約 || "";

                // パーツ組み立て
                a.appendChild(tags);
                a.appendChild(summary);
                li.appendChild(a);
                relatedContainer.appendChild(li);
            });
        } catch (e) {
            console.error("記事の取得に失敗しました", e);
        }
    }

    // === 最新コンテンツの動的読み込み処理 (index.htmlにあったもの) ===
    const latestUrl = "https://script.google.com/macros/s/AKfycbz2Qro8GMl3RTOrcJoFq0Wy_6PrnLLoZfo1zTqWnJFjToYUE-ybb7cLMzRuctuWG4mu/exec?mode=latest";
    const latestContainer = document.getElementById("latest-list");

    if (latestContainer) {
        try {
            const res = await fetch(latestUrl);
            const articles = await res.json();

            if (!Array.isArray(articles) || articles.length === 0) {
                latestContainer.innerHTML = "<li>コンテンツが見つかりませんでした。</li>";
                return;
            }

            articles.forEach(item => {
                const a = document.createElement("a");
                a.href = item.URL || "#";
                a.target = "_blank"; // 新しいタブで開く
                a.className = "mini-posts"; // HTMLのクラス名に合わせて修正

                const li = document.createElement("li");

                const title = document.createElement("h3");
                title.textContent = item.タイトル || "（無題）";

                const small = document.createElement("small");
                const date = new Date(item.公開日 || null);
                small.textContent = !isNaN(date) ? date.toLocaleDateString("ja-JP") : "";

                const p = document.createElement("p");
                p.textContent = item.要約 || "";

                li.appendChild(title);
                li.appendChild(small);
                li.appendChild(p);
                a.appendChild(li); // aタグの中にli要素を配置
                latestContainer.appendChild(a); // コンテナにaタグを追加
            });
        } catch (e) {
            console.error("最新コンテンツの読み込みエラー:", e);
            latestContainer.innerHTML = "<li>最新コンテンツの読み込みに失敗しました</li>";
        }
    }


    // === 検索フォームの処理 (index.htmlとテンプレ２.htmlにあったもの) ===
    const searchForm = document.querySelector('#search form');
    const searchInput = document.getElementById('query');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault(); // フォームのデフォルト送信を防ぐ
            const q = searchInput.value.trim();
            if (q) {
                // 検索結果ページにリダイレクト
                location.href = `/articles/search.html?q=${encodeURIComponent(q)}`;
            }
        });
    }

    // === 全てのLINE登録ボタンのクリックイベントトラッキング ===
    // サイト内の全てのLINE登録ボタンを取得します。
    // href属性が指定のURLである全ての<a>タグが対象になります。
    const lineCtaButtons = document.querySelectorAll('a[href="https://lin.ee/7teX4nMG"]');

    lineCtaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // gtag関数が存在する場合にのみ実行
            if (typeof gtag === 'function') {
                // イベントラベルをより具体的にするため、alt属性やinnerTextを考慮
                let label = 'LINE登録ボタン';
                const img = button.querySelector('img'); // ボタン内に画像があるかチェック

                if (img && img.alt) {
                    label += '（' + img.alt + '）'; // 画像のalt属性があればそれを使用
                } else if (button.textContent.trim()) {
                    label += '（' + button.textContent.trim().replace(/\s+/g, '') + '）'; // テキストコンテンツがあればそれを使用。空白は除去。
                } else {
                    label += '（場所不明）'; // どちらもなければ「場所不明」
                }

                gtag('event', 'line_cta', {
                    event_category: 'cta',
                    event_label: label
                });
            }
        });
    });
});