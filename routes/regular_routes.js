const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to regualr home."
  };

  res.status(200).send(JSON.stringify(result));
});

router.get("/taiwanaddress/:address", (req, res) => {
  let { address } = req.params;

  let result = {
    "status": true,
    "errCode": "00000",
    "message": `${address}`,
    "regualr": null
  };

  let regualr = normalizeTaiwanAddress(address);

  if (regualr != null) {
    result.regualr = regualr;
  }
  
  res.status(200).send(JSON.stringify(result));
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

module.exports = router; 