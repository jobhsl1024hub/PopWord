
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
            async (settings) => {

                const card = await createCard(msg.word, settings);
                setCardPosition(card, settings.cardPosition || "top-center", "40px");
                document.body.appendChild(card);
                showCardWithAnimation(card, settings.displayDuration || 5);
                sendResponse({ status: "ok" });
            }
        );

        return true; // 保证异步 sendResponse 有效
    });



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



function showCardWithAnimation(card, duration) {
    requestAnimationFrame(() => { card.style.opacity = 1; });
    setTimeout(() => {
        card.style.opacity = 0;
        card.style.transform += " translateY(-60px)";
        setTimeout(() => card.remove(), 500);
    }, duration * 1000);
}