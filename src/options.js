document.addEventListener("DOMContentLoaded", () => {
    const enablePopupCheckbox = document.getElementById("enablePopup");
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("csvFile");
    const status = document.getElementById("status");

    const statusSave = document.getElementById("statusSave");

    const saveBtn = document.getElementById("saveBtn");
    const positionSelect = document.getElementById("positionSelect");
    const displayDurationInput = document.getElementById("displayDuration");
    const intervalMinutesInput = document.getElementById("intervalMinutes");
    const enablePronounceCheckbox = document.getElementById("enablePronounce");
    const autoPronounceCheckbox = document.getElementById("autoPronounce");


    // 页面加载时读取上次保存状态
    chrome.storage.local.get(["enablePopup"], ({ enablePopup }) => {
        if (enablePopup !== undefined) {
            enablePopupCheckbox.checked = enablePopup;
        }
    });



    // 页面加载时显示上次上传的词库
    chrome.storage.local.get(
        ["fileCsv",
            "wordList",
            "cardPosition",
            "displayDuration",
            "intervalMinutes",
            "enablePronounce",
            "autoPronounce"],
        ({ fileCsv,
            wordList,
            cardPosition,
            displayDuration,
            intervalMinutes,
            enablePronounce,
            autoPronounce }) => {

            // 将上次保存的状态重新加载
            if (fileCsv && wordList && wordList.length > 0) {
                status.textContent = `
                ✅ 已加载上次上传的词库，共 ${wordList.length} 个单词
                ✅ 文件：${fileCsv.name}
                `;
            }
            if (cardPosition) positionSelect.value = cardPosition;
            if (displayDuration) displayDurationInput.value = displayDuration;
            if (intervalMinutes) intervalMinutesInput.value = intervalMinutes;
            if (enablePronounce !== undefined) enablePronounceCheckbox.checked = enablePronounce;
            if (autoPronounce !== undefined) autoPronounceCheckbox.checked = autoPronounce;
        });

    // 上传 CSV 按键
    uploadBtn.addEventListener("click", () => {
        const file = fileInput.files[0];// 从choose file选中的路径获取
        if (!file) return alert("请选择 CSV 文件");

        // papaparse.min.js 解释.cvs
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const words = results.data.map(r => ({
                    word: r["单词"],
                    meaning: r["解释"],
                    phonetic: (r["音标"] || "").match(/美:\/(.*?)\//)?.[1] || "",
                    reviewCount: 0,
                    nextShowTime: Date.now()
                })).filter(w => w.word && w.meaning);

                chrome.storage.local.set(
                    {
                        fileCsv: file,
                        wordList: words
                    },
                    () => {
                        if (file) {
                            status.textContent = `
                            ✅ 上传成功，共 ${words.length} 个单词
                            ✅ 文件：${file.name} `;
                        } else {
                            status.textContent = `未检测到.cvs文件，请选择后上传`;

                        }
                    });
            }
        });
    });

    // 保存设置
    saveBtn.addEventListener("click", () => {
        chrome.storage.local.set({
            cardPosition: positionSelect.value,
            displayDuration: parseFloat(displayDurationInput.value),
            intervalMinutes: parseFloat(intervalMinutesInput.value),
            enablePronounce: enablePronounceCheckbox.checked,
            autoPronounce: autoPronounceCheckbox.checked,
            enablePopup: enablePopupCheckbox.checked, // 新增
            // fileUrl: file || null,
        }, () => {
            statusSave.textContent = "✅ 设置已保存";
        });
    });
});