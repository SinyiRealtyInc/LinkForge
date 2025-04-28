const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.AES_KEY, 'utf8');
const IV  = Buffer.from(process.env.AES_IV, 'utf8');

router.get('/encrypt/:content', (req, res) => {
  let { content } = req.params;

  let result = {
    "status": true,
    "errCode": "00000",
    "message": `${content}`,
    "encrypt": null
  };

  const encrypt = encryptFor(content);
  const encode = encodeURIComponent(encrypt);
  result.encrypt = encode;
  res.status(200).send(JSON.stringify(result));
});

router.get('/decrypt/:content', (req, res) => {
  let { content } = req.params;

  let result = {
    "status": true,
    "errCode": "00000",
    "message": `${content}`,
    "decrypt": null
  };

  const decode = decodeURIComponent(content);
  const decrypt = decryptFor(decode);
  result.decrypt = decrypt;
  res.status(200).send(JSON.stringify(result));
});

function encryptFor(plainText) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final()
  ]);

  return encrypted.toString('base64');
}

function decryptFor(base64Cipher) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(base64Cipher, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

module.exports = router; 