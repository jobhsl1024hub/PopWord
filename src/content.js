console.log("Pop-word function loaded!");

/**
 * 从background.js那边的chrome.tabs.sendMessage接收"showWord"
 */
chrome.runtime.onMessage.addListener(
    (msg, sender, sendResponse) => {
        if (msg.action !== "showWord") {
            sendResponse({
                status: "ignored"
            });
            return;
        }

        // 读取设置参数
        chrome.storage.local.get(
            [
                "cardPosition",
                "displayDuration",
                "enablePronounce",
                "autoPronounce"
            ],
            ({
                cardPosition,
                displayDuration,
                enablePronounce,
                autoPronounce
            }) => {

                // 创建一个卡片div
                const divItem = document.createElement("div");
                setupCardStyle(divItem);
                setCardPosition(divItem, cardPosition || "top-center", "40px");
                fillCardContent(divItem, msg.word);
                setupMeaningCollapse(divItem, msg.word.meaning);
                setupFavorite(divItem, msg.word);

                if (enablePronounce !== false) {
                    divItem.addEventListener("click", () => speakWord(msg.word.word));
                    if (autoPronounce) speakWord(msg.word.word);
                }

                showCardWithAnimation(divItem, displayDuration || 5);
                document.body.appendChild(divItem);

                sendResponse({ status: "ok" }); // 返回响应，避免报错
            }
        );

        return true; // 保证异步 sendResponse 有效
    });

/* ===== 工具函数（和你原来的 content.js 相同） ===== */

function setupCardStyle(card) {
    Object.assign(card.style, {
        position: "fixed",
        background: "rgba(37,99,235,0.9)",
        color: "#fff",
        padding: "20px",
        borderRadius: "12px",
        zIndex: "999999999",
        boxShadow: "0 6px 20px rgba(9, 3, 41, 0.6)",
        fontFamily: "Arial",
        maxWidth: "300px",
        cursor: "pointer",
        opacity: 0,
        transition: "opacity 0.5s, transform 0.5s",
    });
}

function setCardPosition(card, position, gap) {
    switch (position) {
        case "top-left": card.style.top = gap; card.style.left = gap; break;
        case "top-center": card.style.top = gap; card.style.left = "50%"; card.style.transform = "translateX(-50%)"; break;
        case "top-right": card.style.top = gap; card.style.right = gap; break;
        case "middle-left": card.style.top = "50%"; card.style.left = gap; card.style.transform = "translateY(-50%)"; break;
        case "center": card.style.top = "50%"; card.style.left = "50%"; card.style.transform = "translate(-50%, -50%)"; break;
        case "middle-right": card.style.top = "50%"; card.style.right = gap; card.style.transform = "translateY(-50%)"; break;
        case "bottom-left": card.style.bottom = gap; card.style.left = gap; break;
        case "bottom-center": card.style.bottom = gap; card.style.left = "50%"; card.style.transform = "translateX(-50%)"; break;
        case "bottom-right": card.style.bottom = gap; card.style.right = gap; break;
    }
}

function fillCardContent(card, wordData) {
    card.innerHTML = `
    <div style="font-size:18px;font-weight:bold;">
      ${wordData.word}
      <span style="font-size:13px;opacity:0.8;margin-left:8px;font-style:italic;">
        ${wordData.phonetic || ""}
      </span>
      <span id="favStar" style="cursor:pointer; color:yellow;">⭐</span>
    </div>
  `;
}

function setupFavorite(card, wordData) {
    const favStar = card.querySelector("#favStar");
    favStar.addEventListener("click", (e) => {
        e.stopPropagation();
        chrome.storage.local.get("favorites", ({ favorites }) => {
            favorites = favorites || [];
            if (!favorites.find(w => w.word === wordData.word)) favorites.push(wordData);
            chrome.storage.local.set({ favorites });
            alert(`收藏成功: ${wordData.word}`);
        });
    });
}

function setupMeaningCollapse(card, meanings) {
    const meaningDiv = document.createElement("div");
    Object.assign(meaningDiv.style, {
        fontSize: "14px",
        opacity: "0.8",
        maxHeight: "120px",
        overflow: "hidden",
        paddingTop: "0.3rem",
        transition: "max-height 0.3s",
    });

    if (typeof meanings === "string") meanings = [{ pos: "", text: meanings }];

    meanings.forEach((m) => {
        const line = document.createElement("div");
        line.innerHTML = `<strong>${m.pos || ""}</strong> ${m.text || ""}`;
        line.style.marginBottom = "4px";
        meaningDiv.appendChild(line);
    });

    meaningDiv.addEventListener("click", () => {
        meaningDiv.style.maxHeight = meaningDiv.style.maxHeight === "none" ? "120px" : "none";
    });

    card.appendChild(document.createElement("hr"));
    card.appendChild(meaningDiv);
}

function speakWord(word) {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    const voices = speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang === "en-US");
    if (usVoice) utter.voice = usVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
}

function showCardWithAnimation(card, duration) {
    requestAnimationFrame(() => { card.style.opacity = 1; });
    setTimeout(() => {
        card.style.opacity = 0;
        card.style.transform += " translateY(-10px)";
        setTimeout(() => card.remove(), 500);
    }, duration * 1000);
}