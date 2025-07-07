const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to LINE OA home."
  };

  res.status(200).send(JSON.stringify(result));
});

router.get("/redirect", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Success to redirect."
  };

  res.status(200).send(JSON.stringify(result));
});

module.exports = router; 