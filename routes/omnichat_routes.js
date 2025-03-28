const express = require("express");
const router = express.Router();

router.get("/lineFlexMessage", (req, res) => {
  res.status(200).send("Good");
});

module.exports = router; 