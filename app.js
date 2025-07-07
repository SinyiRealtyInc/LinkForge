const express = require("express");
const path = require("path");

// 測試環境下，使用 dotenv 套件
if (process.env.NODE_ENV != "productuin") {
  const dotenv = require("dotenv");
  dotenv.config();
}

const app = express();
const omnichatRoutes = require("./routes/omnichat_routes");
const regularRoutes = require("./routes/regular_routes");
const cryptoRoutes = require("./routes/crypto_routes");
const lineoaRoutes = require("./routes/lineoa_routes");

app.set("view engine", "ejs");

// 設定公開資源目錄（可供瀏覽器直接存取）
app.use(express.static('public'));

// 設定讓 .well-known 資料夾中的靜態檔案可被存取
//app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 檢查path內是否有 omnichat 關鍵字, 有的話會進去 omnichatRoutes 做處理
app.use("/omnichat", omnichatRoutes);
app.use("/regular", regularRoutes);
app.use("/crypto", cryptoRoutes);
app.use("/lineoa", lineoaRoutes);

app.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to Linkforge home."
  };

  res.status(200).json(result);
});

// App Link & Universal Link
app.get("/.well-known/:fileName", (req, res) => {
  let { fileName } = req.params;

  if (fileName == "apple-app-site-association" || fileName == "assetlinks.json") {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '.well-known', req.params.fileName));
  } else {
    return res.status(400).json({ error: '找不到檔案！' });
  }
})

app.listen("3000", () => {
  console.log("Server is star running...");
});