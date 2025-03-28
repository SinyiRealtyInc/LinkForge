const express = require("express");
const app = express();
const omnichatRoutes = require("./routes/omnichat_routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 檢查path內是否有 omnichat 關鍵字, 有的話會進去 omnichatRoutes 做處理
app.use("/omnichat", omnichatRoutes);

app.get("/linkforge", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Linkforge repo test success."
  };
  res.status(200).json(result);
});

app.listen("3000", () => {
  console.log("Server is star running...");
});