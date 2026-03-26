const defaultInterval = 0.25; // 15秒

// 设置定时器
function setupAlarm(intervalMinutes) {
    chrome.alarms.clear("wordAlarm", () => {
        chrome.alarms.create("wordAlarm", { periodInMinutes: intervalMinutes });
        console.log(`Alarm set: every ${intervalMinutes} minutes`);
    });
}

// 初始化
chrome.storage.local.get("intervalMinutes", ({ intervalMinutes }) => {
    setupAlarm(intervalMinutes || defaultInterval);
});

// 记忆曲线
function getNextTime(reviewCount) {
    const now = Date.now();
    switch (reviewCount) {
        case 0: return now + 15 * 1000;
        case 1: return now + 60 * 1000;
        case 2: return now + 10 * 60 * 1000;
        default: return now + 60 * 60 * 1000;
    }
}

// 弹词逻辑
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== "wordAlarm") return;

    chrome.storage.local.get([
        "wordList",
        "enablePopup"],
        ({
            wordList,
            enablePopup
        }) => {

            if (!enablePopup) return; // ❌ 开关关闭，不弹卡
            if (!wordList || wordList.length === 0) return;//没有词库

            /* dueWords 词库中可以出现的词：
                   - 没有排过时间!w.nextShowTime，和
                   - 已经到时间了，可以再次出现w.nextShowTime
            */
            const now = Date.now();
            const dueWords = wordList.filter(
                w => !w.nextShowTime || w.nextShowTime <= now);
            if (dueWords.length === 0) return;

            const word = dueWords[Math.floor(Math.random() * dueWords.length)];
            word.reviewCount = (word.reviewCount || 0) + 1;
            word.nextShowTime = getNextTime(word.reviewCount);

            chrome.storage.local.set({ wordList });

            //给所有页弹词
            chrome.tabs.query({}, (tabs) => { // {} 查询所有 Tab
                tabs.forEach(tab => {
                    // 避免 chrome://、扩展页、文件页报错
                    if (!tab.url.startsWith("http") && !tab.url.startsWith("https")) return;

                    chrome.tabs.sendMessage(
                        tab.id,
                        { action: "showWord", word },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`Tab ${tab.id} 没有 content script`, chrome.runtime.lastError.message);
                            }
                        });
                });
            });
        });
});

// 安装时立即触发一次
chrome.runtime.onInstalled.addListener(() => {
    setupAlarm(defaultInterval);
});