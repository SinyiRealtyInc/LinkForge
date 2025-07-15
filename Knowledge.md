# LinkForge 專案知識庫

歡迎加入團隊！這份文件旨在幫助你快速了解專案中一些重要的架構和慣例。

## 1. 為什麼我們使用 `import / export` 語法？ (ESM)

你可能會在舊的 Node.js 教學中看到 `require()` 和 `module.exports`。我們的專案已經全面升級到更新、更標準的寫法。

*   **舊的寫法 (已淘汰)**: `const express = require('express');`
*   **新的寫法 (現行標準)**: `import express from 'express';`

**為什麼要改？**
很簡單，`import / export` 是現在 JavaScript 的官方標準，稱為 **ES 模組 (ESM)**。這讓我們的專案：
1.  **語法更統一**：與前端 JavaScript 語法一致。
2.  **相容性更好**：許多新的套件（例如 `got`）只支援這種新寫法。
3.  **更現代化**：跟上技術潮流。

**關鍵設定**：我們透過在 `package.json` 檔案中加入 `"type": "module";` 來告訴 Node.js 整個專案都採用這種新標準。

## 2. 如何取得「目前資料夾路徑」？ (取代 `__dirname`)

在舊的寫法中，有一個叫 `__dirname` 的「神奇變數」可以直接取得目前檔案所在的資料夾路徑。但在新的 ESM 標準中，這個變數消失了。

現在，我們用以下這段**標準程式碼**來取得它：

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

**白話文解釋這段程式碼在做什麼：**

1.  `import.meta.url`：先取得這個檔案的「網路路徑」(URL)，長得像 `file:///Users/..../app.js`。
2.  `fileURLToPath(...)`：把上面那個「網路路徑」翻譯成電腦看得懂的「檔案總管路徑」，例如 `/Users/..../app.js`。
3.  `path.dirname(...)`：從檔案總管路徑中，只取出「資料夾」的部分。

**結論：當你需要知道目前資料夾的路徑時（例如設定樣板或靜態檔案位置），直接複製貼上這段程式碼就對了。**
