import express from 'express';

const router = express.Router();

router.get("/home", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Welcome to LINE OA home."
  });
});

router.get("/redirect", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Success to redirect."
  });
});

export default router;