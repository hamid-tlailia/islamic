// Qiblah.js
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // Importing Arrow Icon
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
    rotateDevice: "Rotate your device to find the Qiblah direction.",
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
    rotateDevice: "قم بتدوير جهازك للعثور على اتجاه القبلة.",
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
    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          // Calculate the Qiblah direction
          const qiblahBearing = calculateQiblahDirection(userLat, userLon);
          setQiblahDirection(qiblahBearing);
          setLocationLoading(false);
        },
        (error) => {
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
      // Request permission for device orientation
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        // iOS 13+ requires permission
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              setPermissionGranted(true);
            } else {
              setErrorMessage(t("permissionDenied"));
            }
          })
          .catch((e) => {
            setErrorMessage(t("errorRequestingPermission"));
          });
      } else {
        // Non iOS 13+ devices
        setPermissionGranted(true);
      }
    }
    // eslint-disable-next-line
  }, [qiblahDirection]);

  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
      window.addEventListener("deviceorientation", handleOrientation, true);
      return () => {
        window.removeEventListener(
          "deviceorientationabsolute",
          handleOrientation,
          true
        );
        window.removeEventListener(
          "deviceorientation",
          handleOrientation,
          true
        );
      };
    }
  }, [permissionGranted]);

  const handleOrientation = (event) => {
    const alpha = event.alpha; // 0 to 360 degrees
    if (alpha !== null) {
      setDeviceOrientation(alpha);
    }
  };

  const calculateQiblahDirection = (lat, lon) => {
    // Coordinates of Kaaba
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

    return (qiblahBearing + 360) % 360; // Normalize to 0-360 degrees
  };

  const degreesToRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  const radiansToDegrees = (radians) => {
    return (radians * 180) / Math.PI;
  };

  const getArrowRotation = () => {
    if (deviceOrientation !== null && qiblahDirection !== null) {
      // Calculate the rotation needed to point the arrow towards Qiblah
      const rotation = qiblahDirection - deviceOrientation;
      return rotation % 360;
    }
    return 0;
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
                .catch((e) => {
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
        {/* Compass Circle */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width={250}
          height={250}
          borderRadius="50%"
          border="2px solid #000"
        >
          {/* Fixed Red Dot at the Top (Qiblah) */}
          <Box
            position="absolute"
            width={12}
            height={12}
            borderRadius="50%"
            bgcolor="red"
            top={-6} // Half of the dot's height to center it
            left="50%"
            transform="translateX(-50%)"
          />
        </Box>
        {/* Rotating Arrow Icon */}
        <ArrowUpwardIcon
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            fontSize: 100, // Adjust size for a longer arrow
            color: "blue",
            transform: `translate(-50%, -100%) rotate(${getArrowRotation()}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 0.5s ease-in-out",
          }}
        />
        {/* Center Dot */}
        <Box
          position="absolute"
          width={10}
          height={10}
          borderRadius="50%"
          bgcolor="black"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        />
      </Box>
      <Typography variant="body1" style={{ marginTop: 16 }}>
        {t("rotateDevice")}
      </Typography>
    </Box>
  );
};

export default Qiblah;
