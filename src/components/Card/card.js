async function createCard(
    wordData,
    settings) {

    // 1️⃣ // 👇 用缓存版本
    const html = await getTemplate();

    // 2️⃣ 转成 DOM
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const card = wrapper.firstElementChild;

    // 3️⃣ 填充数据
    card.querySelector(".word").textContent = wordData.word;
    card.querySelector(".phonetic").textContent = wordData.phonetic;
    card.querySelector(".meaning").textContent = wordData.meaning;

    // // 4️⃣ 绑定事件 - 发音
    if (settings.enablePronounce !== false) {
        card.querySelector(".content").onclick =
            () => speakWord(wordData.word);
    }
    if (settings.autoPronounce) {
        speakWord(wordData.word);
    }

    return card;
}


// ✅ 一加载就发请求（预加载，全局变量）
const templatePromise = fetch(chrome.runtime.getURL("components/Card/card.html")
).then(res => res.text());

// ✅ 对外统一入口
async function getTemplate() {
    return templatePromise;
}


function speakWord(word) {
    const speak = () => {
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = "en-US";
        utter.rate = 0.9;

        const voices = speechSynthesis.getVoices();
        const usVoice = voices.find(v => v.lang === "en-US");
        if (usVoice) utter.voice = usVoice;

        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    };

    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
        speak();
    } else {
        speechSynthesis.onvoiceschanged = speak;
    }
}