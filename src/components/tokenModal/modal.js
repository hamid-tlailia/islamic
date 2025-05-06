import React, { useEffect, useState } from "react";
import { useTranslation } from "../languages/provider";
import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import "firebase/messaging";
import { Modal, Box, Typography, Button, Stack } from "@mui/material";

const firebaseConfig = {
  apiKey: "AIzaSyB_RZPaSTSKyQFs53p1aAmj29qtsQhWGzw",
  authDomain: "islamic-app-90797.firebaseapp.com",
  projectId: "islamic-app-90797",
  storageBucket: "islamic-app-90797.firebasestorage.app",
  messagingSenderId: "638328114408",
  appId: "1:638328114408:web:e19eb1f1abd71b67160d5d",
  measurementId: "G-2KV5EGH6D9",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapid =
  "BFYeYcvYDn_s4o0DRF1Htrp-WhyjZ6bHt_CKz0Md3x2C1TFiiBIQARhOL-9snvL4rZIZ-KktaSFnZ2ZB_Bl6KjY";

const FCMModal = () => {
  const { language } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("deviceToken");
    const declinedData = JSON.parse(
      localStorage.getItem("notificationDeclined") || "null"
    );

    if (token) return;

    const now = Date.now();
    if (declinedData && declinedData.expiry > now) {
      return; // still within 3 weeks decline period
    }

    setOpen(true);
  }, []);

  const handleAllow = async () => {
    try {
      localStorage.removeItem("notificationDeclined");

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, { vapidKey: vapid }).catch(
          (err) => {
            console.error("Error retrieving FCM token:", err);
            throw err;
          }
        );
        if (!token) {
          console.warn("No FCM token retrieved.");
          return;
        }

        localStorage.setItem("deviceToken", token);

        const res = await fetch(
          "https://islamic-notifs-backend.onrender.com/api/save-token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );
        const data = await res.json();
        console.log("save-token response:", data);

        // استخدم اللغة من useTranslation
        // language === "ar" أو "en"
        const titles = {
          ar: "✅ تم تفعيل الإشعارات",
          en: "✅ Notifications enabled",
        };
        const bodies = {
          ar: "سوف تصلك تذكيرات مواقيت الصلاة تلقائيًا.",
          en: "You'll receive prayer time reminders.",
        };

        new Notification(titles[language], {
          body: bodies[language],
          tag: "registration-success",
        });

        setOpen(false);
      } else if (permission === "denied") {
        console.warn("User denied notifications.");
        localStorage.setItem("notificationDeclined", "true");
        setOpen(false);
      }
    } catch (error) {
      console.error("FCM error:", error);
    }
  };

  const handleDecline = () => {
    // احسب تاريخ انتهاء الرفض بعد 3 أسابيع
    const threeWeeksLater = Date.now() + 1000 * 60 * 60 * 24 * 21;
    localStorage.setItem(
      "notificationDeclined",
      JSON.stringify({ expiry: threeWeeksLater })
    );

    // نص العنوان والرسالة حسب اللغة
    const titles = {
      ar: "رفض الخدمة ❌",
      en: "Service Declined ❌",
    };
    const bodies = {
      ar: "لقد قمت بإلغاء الاشتراك في الإشعارات اليومية، يمكنك إعادة تفعيلها تلقائيًا بعد ثلاثة أسابيع.",
      en: "You’ve unsubscribed from daily notifications. You can re-enable them automatically after three weeks.",
    };

    // إذا الإذن مباح، عرض إشعار محلي لتأكيد الرفض
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(titles[language], {
        body: bodies[language],
        tag: "decline-confirmation",
      });
    }

    // أغلق المودال
    setOpen(false);
  };

  const translations = {
    ar: {
      title: "هل ترغب في تلقي الإشعارات؟",
      body: "سنرسل لك إشعارات لأوقات الصلاة، الأذكار، والمناسبات الإسلامية.",
      accept: "نعم، أرسل ",
      decline: "لا، شكراً",
    },
    en: {
      title: "Do you want to receive notifications?",
      body: "We'll send you prayer times, adhkar, and Islamic reminders.",
      accept: "Yes, please",
      decline: "No, thanks",
    },
  };

  const t = translations[language] || translations.en;

  return (
    <Modal open={open} onClose={handleDecline}>
      <Box
        sx={{
          backgroundColor: "background.paper",
          p: 4,
          mx: "auto",
          mt: "20vh",
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: 24,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t.body}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          gap={3}
          justifyContent="start"
          mt={3}
        >
          <Button variant="contained" color="success" onClick={handleAllow}>
            {t.accept}
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleDecline}>
            {t.decline}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default FCMModal;
