# 名字

PopWord

# 效果视图

![效果视图](/screenshot.png)

# 功能描述

| 环境                        | 能做什么           |
| --------------------------- | ------------------ |
| content script              | 操作网页 DOM       |
| background (service worker) | 定时任务、全局逻辑 |
| popup                       | UI 控制            |
| options page                | 设置页             |

# option.html

设置：

- 启动开关
- .cvs词库路径

- 卡片显示位置
- 时长设置
- 间隔设置

- 点击发音设置
- 自动发音设置

\*保存按钮

# options.js

- 重载启动开关
- 重载设置参数
- 提供.cvs文件路径，上传成功后保存文件名，并将拆解{单词，解释，音标}到wordList本地存储
- 重载wordList

# background.js

- 后台设置定时器 setupAlarm()
- 后台设置弹词逻辑 chrome.alarms.onAlarm.addListener()
