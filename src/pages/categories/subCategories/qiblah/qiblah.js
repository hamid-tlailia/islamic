import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import { useTranslation } from "../../../../components/languages/provider";

const translations = {
  en: {
    errorGettingLocation: "Error getting location.",
    geolocationNotSupported: "Geolocation is not supported by this browser.",
    gettingLocation: "Getting your location...",
    allowDeviceOrientation:
      "Please allow access to device orientation to use the Qiblah compass.",
    permissionDenied: "Permission to access device orientation was denied.",
    errorRequestingPermission:
      "Error requesting device orientation permission.",
    deviceOrientationNotSupported: "Device orientation not supported.",
    allowDeviceOrientationButton: "Allow Device Orientation",
    qiblahDirection: "Qiblah Direction",
    rotateDevice:
      "Place the phone on a straight surface and rotate your device to find the Qiblah direction.",
  },
  ar: {
    errorGettingLocation: "خطأ في الحصول على الموقع.",
    geolocationNotSupported: "المتصفح لا يدعم تحديد الموقع الجغرافي.",
    gettingLocation: "جاري الحصول على موقعك...",
    allowDeviceOrientation:
      "يرجى السماح بالوصول إلى اتجاه الجهاز لاستخدام بوصلة القبلة.",
    permissionDenied: "تم رفض الإذن بالوصول إلى اتجاه الجهاز.",
    errorRequestingPermission: "خطأ في طلب إذن الوصول إلى اتجاه الجهاز.",
    deviceOrientationNotSupported: "اتجاه الجهاز غير مدعوم.",
    allowDeviceOrientationButton: "السماح باتجاه الجهاز",
    qiblahDirection: "اتجاه القبلة",
    rotateDevice:
      "ضع الهاتف على سطح مستقيم ثم قم بتدوير جهازك للعثور على اتجاه القبلة.",
  },
};

const Qiblah = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [qiblahDirection, setQiblahDirection] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const { language } = useTranslation();

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const qiblahBearing = calculateQiblahDirection(userLat, userLon);
          setQiblahDirection(qiblahBearing);
          setLocationLoading(false);
        },
        () => {
          setErrorMessage(t("errorGettingLocation"));
          setLocationLoading(false);
        }
      );
    } else {
      setErrorMessage(t("geolocationNotSupported"));
      setLocationLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (qiblahDirection !== null) {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              setPermissionGranted(true);
            } else {
              setErrorMessage(t("permissionDenied"));
            }
          })
          .catch(() => {
            setErrorMessage(t("errorRequestingPermission"));
          });
      } else {
        setPermissionGranted(true);
      }
    }
    // eslint-disable-next-line
  }, [qiblahDirection]);

  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      return () => {
        window.removeEventListener(
          "deviceorientation",
          handleOrientation,
          true
        );
      };
    }
    // eslint-disable-next-line
  }, [permissionGranted]);

  const handleOrientation = (event) => {
    let alpha = event.alpha;
    const webkitCompassHeading = event.webkitCompassHeading;

    if (typeof webkitCompassHeading !== "undefined") {
      alpha = webkitCompassHeading;
    } else if (alpha !== null) {
      alpha = 360 - alpha;
    } else {
      setErrorMessage(t("deviceOrientationNotSupported"));
      return;
    }

    alpha = (alpha + 360) % 360;
    setDeviceOrientation(alpha);
  };

  const calculateQiblahDirection = (lat, lon) => {
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const phiK = degreesToRadians(kaabaLat);
    const lambdaK = degreesToRadians(kaabaLon);

    const phi = degreesToRadians(lat);
    const lambda = degreesToRadians(lon);

    const qiblahBearing = radiansToDegrees(
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      )
    );

    return (qiblahBearing + 360) % 360;
  };

  const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
  const radiansToDegrees = (radians) => (radians * 180) / Math.PI;

  const getArrowRotation = () => {
    if (deviceOrientation !== null && qiblahDirection !== null) {
      const rotation = (qiblahDirection - deviceOrientation + 360) % 360;
      return rotation;
    }
    return 0;
  };

  const isFacingQiblah = () => {
    if (deviceOrientation !== null && qiblahDirection !== null) {
      let difference = Math.abs(qiblahDirection - deviceOrientation) % 360;
      if (difference > 180) difference = 360 - difference;
      return difference <= 5; // Tolerance of ±5 degrees
    }
    return false;
  };

  if (errorMessage) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="error">
          {errorMessage}
        </Typography>
      </Box>
    );
  }

  if (locationLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        justifyContent="center"
      >
        <CircularProgress />
        <Typography>{t("gettingLocation")}</Typography>
      </Box>
    );
  }

  if (!permissionGranted) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        justifyContent="center"
      >
        <Typography variant="h6" gutterBottom>
          {t("allowDeviceOrientation")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (
              typeof DeviceOrientationEvent !== "undefined" &&
              typeof DeviceOrientationEvent.requestPermission === "function"
            ) {
              DeviceOrientationEvent.requestPermission()
                .then((response) => {
                  if (response === "granted") {
                    setPermissionGranted(true);
                  } else {
                    setErrorMessage(t("permissionDenied"));
                  }
                })
                .catch(() => {
                  setErrorMessage(t("errorRequestingPermission"));
                });
            } else {
              setErrorMessage(t("deviceOrientationNotSupported"));
            }
          }}
        >
          {t("allowDeviceOrientationButton")}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      justifyContent="center"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Typography variant="h5">{t("qiblahDirection")}</Typography>
      <Box position="relative" width={250} height={250} marginTop={4}>
        {/* Compass circle */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width={250}
          height={250}
          borderRadius="50%"
          border="2px solid #000"
        ></Box>
        {/* Arrow pointing towards Qiblah direction */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          display="flex"
          flexDirection="column-reverse"
          alignItems="center"
          style={{
            transform: `translate(-50%, -50%) rotate(${getArrowRotation()}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <Typography variant="h6" component="span">
            🕋
          </Typography>
          <ArrowDownwardOutlinedIcon
            style={{ fontSize: 100, color: isFacingQiblah() ? "green" : "red" }}
          />
        </Box>
      </Box>
      <Typography variant="body1" style={{ marginTop: 16 }}>
        {t("rotateDevice")}
      </Typography>
    </Box>
  );
};

export default Qiblah;
