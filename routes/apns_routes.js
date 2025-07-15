import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import got from "got";
import { fileURLToPath } from 'url';

const router = express.Router();

// Reference:
// 1. https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns
// 2. https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns

const apnsConfig = {
  keyId: process.env.APNS_KEY_ID,
  teamId: process.env.APNS_TEAM_ID,
  p8Name: process.env.APNS_P8_NAME,
  // App Bundle ID
  topic: "com.sinyi.customerAppTest",
};

// JWT Token 緩存
const jwtTokenCache = {
  token: null,
  // 過期時間
  expiresAt: 0,
};

// p8 key content
const privateKey = readPrivateKey();

function generateJWTToken(key, config) {
  // Date.now() 回傳 從 1970.1.1 到現在毫秒數
  const issuedAt = Math.floor(Date.now() / 1000);

  // 55 minutes = 3300 seconds
  const expiresAt = issuedAt + 3300; 

  const token = jwt.sign({}, key, {
    algorithm: "ES256",
    issuer: config.teamId,
    header: { alg: "ES256", kid: config.keyId },
    // 設定過期時間 55分鐘
    expiresIn: "55m"
  });

  return { token, expiresAt };
}

function createAPNsPayload(title, subtitle, body) {
  return {
    aps: {
      alert: { title, subtitle, body },
      sound: "default",
      // thread-id: 
      // 1. 將多則通知歸類為同一個群組，例如聊天室 thread、email 帳號等
      "thread-id": "LinkForge2025",
      // mutable-content: 
      // 1. 通知送出後會先進入 App 的 Notification Service Extension，允許修改內容（如下載圖片）
      "mutable-content": 1,
      // content-available: 
      // 1. 表示這是一則「靜默推播」，不會顯示通知，只讓 App 在背景執行處理
      // 2. 要啟用 Background Modes 中的 Remote Notifications，且 App 必須在背景執行狀態
      "content-available": 1
    }
  };
}

function readPrivateKey() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const privateKeyPath = path.join(__dirname, '..', 'public/resource', apnsConfig.p8Name);
  
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`FATAL: APNs private key file not found at: ${privateKeyPath}`);
  }
  
  return fs.readFileSync(privateKeyPath);
}

function getValidToken(cache, key, config) {
  const now = Math.floor(Date.now() / 1000);

  // 判斷 Token 是否過期
  // now + 300 seconds 用意如下：
  // 1. 預防性更新：不要等到 Token 即將過期時才更新，而是提早一段時間就主動換新。
  // 2. 增加可靠性：確保我們發送出去的請求，在經過網路延遲後，到達目的地時依然有效。
  // 3. 避免競態條件：從根本上消除了「檢查時有效，送達時失效」的風險。
  if (cache.token && cache.expiresAt > now + 300) {
    return cache.token;
  }
  
  const newTokenData = generateJWTToken(key, config);
  cache.token = newTokenData.token;
  cache.expiresAt = newTokenData.expiresAt;

  console.log(`Generating new APNs JWT Token to ${token}`);

  return cache.token;
}

async function sendAPNsRequest(deviceToken, jwtToken, payload, isProduction) {
  const baseUrl = isProduction 
    ? "https://api.push.apple.com" 
    : "https://api.sandbox.push.apple.com";
  const apnsURL = `${baseUrl}/3/device/${deviceToken}`;

  return got(apnsURL, {
    method: 'POST',
    http2: true,
    headers: {
      authorization: `bearer ${jwtToken}`,
      "apns-topic": apnsConfig.topic,
      "apns-push-type": "alert",
      "apns-priority": "5"
    },
    json: payload,
    responseType: "json",
    retry: { limit: 0 }
  });
}

router.post("/push/:deviceToken", async (req, res) => {
  try {
    // 組合我們的函式
    const jwtToken = getValidToken(jwtTokenCache, privateKey, apnsConfig);
    const payload = createAPNsPayload("Got 推播 Title", "Got 推播 SubTitle", "Got 推播 Body");
    const isProduction = process.env.NODE_ENV === "production";

    const response = await sendAPNsRequest(req.params.deviceToken, jwtToken, payload, isProduction);

    res.status(200).json({ success: true, response: response });
  } catch (error) {
    const errorMessage = error.response?.body || error.message;
    console.error('APNs Error:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;