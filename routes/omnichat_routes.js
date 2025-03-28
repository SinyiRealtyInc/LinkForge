const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Omnichat router test success."
  };

  res.status(200).send(result);
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

module.exports = router; 