import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.AES_KEY, 'utf8');
const IV  = Buffer.from(process.env.AES_IV, 'utf8');

/**
 * 一個高階函數，它接收一個函數 `fn` 和一個次數 `times`，
 * 並回傳一個新的函數。這個新函數會對其參數重複執行 `fn` 共 `times` 次。
 * @param {Function} fn 要重複執行的函數。
 * @param {number} times 重複執行的次數。
 * @returns {Function} 一個會重複執行 `fn` 的新函數。
 */
const repeat = (fn, times) => (x) => {
  return Array.from({ length: times }).reduce((acc) => fn(acc), x);
};

router.post('/encrypt', (req, res) => {
  const { content } = req.body;
  const encrypt = encryptFor(content);
  const encode = encodeURIComponent(encrypt);
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: `${content}`,
    encrypt: encode
  });
});

router.post('/encrypt/encodetwice', (req, res) => {
  const content = JSON.stringify(req.body);
  const encrypt = encryptFor(content);
  const encodedContent = repeat(encodeURIComponent, 2)(encrypt);
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: `${content}`,
    local: `https://localhost:3000/liff/shareobjectinfo?UtmSource=Sinyi_liff&UtmMedium=app_staff_share&UtmCampaign=func_houseeinfo&UtmContent=liff_houseeinfo&UtmTerm=broadcast&tk=${encodedContent}`,
    // {} 請帶入對應的 LIFF ID
    liff: `https://liff.line.me/{}/liff/shareobjectinfo?UtmSource=Sinyi_liff&UtmMedium=app_staff_share&UtmCampaign=func_houseeinfo&UtmContent=liff_houseeinfo&UtmTerm=broadcast&tk=${encodedContent}`
  });
});

router.post('/decrypt', (req, res) => {
  const { content } = req.body;
  const decode = decodeURIComponent(content);
  const decrypt = decryptFor(decode);
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: `${content}`,
    decrypt: decrypt
  });
});

router.post('/decrypt/decodetwice', (req, res) => {
  const { content } = req.body;
  const decodedContent = repeat(decodeURIComponent, 2)(content);
  const decrypt = decryptFor(decodedContent);
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: `${content}`,
    decrypt: decrypt
  });
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

export default router;