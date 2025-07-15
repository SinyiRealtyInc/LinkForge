import express from 'express';

const router = express.Router();

router.get("/home", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Welcome to regualr home."
  });
});

router.get("/taiwanaddress/:address", (req, res) => {
  const { address } = req.params;
  const regualr = normalizeTaiwanAddress(address);
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: `${address}`,
    regualr: regualr
  });
});

function normalizeTaiwanAddress(address) {
  const regex = /^(?<areacode>(\d{5}|\d{3})?)?(?<city>\D+?[縣市])?(?<district>\D+?(市區|鎮區|鎮市|[鄉鎮市區]))?(?<village>\D+?(村里|里村|[村里]))?(?<neighbor>\d+鄰)?(?<road>\D+?(路\D+?街|村路|[路街道段]))?(?<section>\D?段)?(?<lane>(\d+|\D+)巷)?(?<alley>\d+弄)?(?<suballey>\d+衖)?(?<localName>\D{2,4})?(?<no>\d+號?)?(?<seq>(-|之)\d+(號?))?(?<floor>(\d+|\D+)[樓層])?(?<others>.+)?$/;
  const match = address.match(regex);
  if (match && match.groups) {
    return match.groups;
  } else {
    return null;
  }
}

export default router;