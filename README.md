# 專案歷史紀錄：從 CommonJS (CJS) 遷移至 ES 模組 (ESM)

**日期**: 2025年7月14日
**主要貢獻者**: Gemini

## 摘要 (Summary)

為了使專案現代化並與當前的 JavaScript 生態系保持一致，本次更新將整個專案的模組系統從傳統的 CommonJS (CJS) 遷移到了標準的 ES 模組 (ESM)。這項改動統一了專案的語法，並解決了在使用如 `got` v12+ 等純 ESM 套件時的相容性問題。

## 核心變更 (Core Changes)

### 1. 啟用 ESM 專案模式

*   **檔案**: `package.json`
*   **變更**: 新增了 `"type": "module"` 欄位。
*   **目的**: 這是遷移的關鍵步驟，它指示 Node.js 將專案中所有的 `.js` 檔案預設作為 ES 模組來處理。

### 2. 語法現代化轉換

*   **檔案**: `app.js`, `routes/*.js` (所有路由檔案)
*   **變更**:
    *   所有的 `const ... = require('...')` 語句被替換為 `import ... from '...'`。
    *   所有的 `module.exports = ...` 語句被替換為 `export default ...`。
*   **目的**: 全面採用 ESM 的標準導入/導出語法，使程式碼更簡潔且符合現代標準。

### 3. 檔案路徑處理

*   **檔案**: `app.js`, `routes/apns_routes.js`
*   **變更**: 由於 `__dirname` 和 `__filename` 在 ESM 中不可用，採用了 Node.js 官方推薦的標準模式進行替代：
    ```javascript
    import { fileURLToPath } from 'url';
    import path from 'path';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    ```
*   **目的**: 確保檔案路徑（例如用於 `express.static` 或讀取私鑰）的解析在 ESM 環境下依然穩定可靠。

### 4. 修正模組導入路徑

*   **檔案**: `app.js`
*   **變更**: 所有本地路由模組的 `import` 路徑都加上了 `.js` 副檔名。
    ```javascript
    // Before
    import regularRoutes from './routes/regular_routes';
    // After
    import regularRoutes from './routes/regular_routes.js';
    ```
*   **目的**: 遵循 ESM 的嚴格要求，即導入本地檔案時必須提供完整的檔案路徑，包含副檔名。

## 受影響的檔案列表

*   `package.json`
*   `app.js`
*   `routes/apns_routes.js`
*   `routes/crypto_routes.js`
*   `routes/lineoa_routes.js`
*   `routes/omnichat_routes.js`
*   `routes/regular_routes.js`

## 遷移帶來的好處

1.  **語法統一**: 專案不再需要混用 `require` 和動態 `import()`。
2.  **生態系相容**: 可以無縫地直接 `import` 最新的純 ESM 套件。
3.  **未來就緒**: 使專案與 JavaScript 語言的未來發展方向保持一致。