import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.AES_KEY, 'utf8');
const IV  = Buffer.from(process.env.AES_IV, 'utf8');

router.get('/encrypt/:content', (req, res) => {
  const { content } = req.params;
  const encrypt = encryptFor(content);
  const encode = encodeURIComponent(encrypt);
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: `${content}`,
    encrypt: encode
  });
});

router.get('/decrypt/:content', (req, res) => {
  const { content } = req.params;
  const decode = decodeURIComponent(content);
  const decrypt = decryptFor(decode);
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