const express = require("express");
const router = express.Router();

router.get("/lineFlexMessageWithParameter", (req, res) => {
  res.status(200).json({
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