import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const router = express.Router();

router.get("/home", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Welcome to FCM home."
  });
});

// Firebase FCM
// https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
// https://firebase.google.com/docs/reference/fcm/rest/v1/FcmError
// https://firebase.google.com/docs/cloud-messaging/send-message

firebaseFCMinit();

function firebaseFCMinit() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serviceAccountPath = path.join(__dirname, '..', 'public/resource', 'firebase-admin-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
}

function createFCMPayload() {
  return {
    notification: {
      title: 'Hello from Admin SDK',
      body: '這是使用 firebase-admin 發送的通知',
      image: 'https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=350'
    },
    android: {
      priority: 'HIGH',
      // ttl = 1小時(毫秒)
      ttl: 3600 * 1000,
      direct_boot_ok: true,
      data: {
        fcm_server: 'Linkforge',
        utm_source: 'sinyi_push',
        utm_medium: 'app_push',
        utm_campaign: '',
        utm_code: '',
      }
    },
    apns: {
      headers: {
        'apns-priority': "10"
      },
      payload: {
        aps: {
          badge: 1
        },
        fcm_server: 'Linkforge',
        utm_source: 'sinyi_push',
        utm_medium: 'app_push',
        utm_campaign: '',
        utm_code: '',
      }
    }
  };
}

router.post("/push/send", async (req, res) => {
  const { deviceToken } = req.body;

  let message = createFCMPayload();
  message.token = deviceToken;

  try {
    const result = await admin.messaging().send(message);
    
    res.status(200).json({
      "status": 200,
      "message": result
    });
  } catch (err) {
    res.status(200).json({
      "status": 400,
      "message": err.errorInfo || err
    });
  }
})

router.post('/push/sendEachForMulticast', async (req, res) => {
  const { deviceTokens } = req.body;

  let message = createFCMPayload();
  message.tokens = deviceTokens;

  try {
    const result = await admin.messaging().sendEachForMulticast(message);
    
    res.status(200).json({
      "status": 200,
      "message": result
    });
  } catch (err) {
    res.status(200).json({
      "status": 400,
      "message": err.errorInfo || err
    });
  }

});

export default router;