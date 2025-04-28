const express = require("express");

// 測試環境下，使用 dotenv 套件
if (process.env.NODE_ENV != "productuin") {
  const dotenv = require("dotenv");
  dotenv.config();
}

const app = express();
const omnichatRoutes = require("./routes/omnichat_routes");
const regularRoutes = require("./routes/regular_routes");
const cryptoRoutes = require("./routes/crypto_routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 檢查path內是否有 omnichat 關鍵字, 有的話會進去 omnichatRoutes 做處理
app.use("/omnichat", omnichatRoutes);
app.use("/regular", regularRoutes);
app.use("/crypto", cryptoRoutes);

app.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to Linkforge home."
  };

  res.status(200).json(result);
});

app.listen("3000", () => {
  console.log("Server is star running...");
});