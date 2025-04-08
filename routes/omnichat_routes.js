const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to omnichat home."
  };

  res.status(200).send(JSON.stringify(result));
});

router.post("/lineFlexMessageWithParameter", (req, res) => {
  res.status(200).send({
    "messages": [
      {
        "type": "lineFlexMessageTemplates",
        "lineFlexMessageTemplates": [
          {
            "templateId": "67e37ac3bcb81f09e0394cd7",
            "parameters": [
              {
                "key": "button_title",
                "value": "測試變數"
              }
            ]
          }
        ]
      }
    ]
  });
});

router.post("/textmessage", (req, res) => {
  let result = {
   "messages": [
      {
        "type": "text",
        "text": "Send textmessage template."
      }
    ]
  };

  res.status(200).send(JSON.stringify(result));
});

module.exports = router; 