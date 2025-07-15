import express from 'express';

const router = express.Router();

router.get("/home", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Welcome to omnichat home."
  });
});

router.post("/lineFlexMessageWithParameter", (req, res) => {
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

router.post("/textmessage", (req, res) => {
  res.status(200).json({
   "messages": [
      {
        "type": "text",
        "text": "Send textmessage template."
      }
    ]
  });
});

export default router;