import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Icon for Qiblah symbol
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
      "Rotate your device to align with the Qiblah direction.",
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
      "قم بتدوير جهازك لمحاذاة اتجاه القبلة.",
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

    const y = Math.sin(lambdaK - lambda);
    const x =
      Math.cos(phi) * Math.tan(phiK) -
      Math.sin(phi) * Math.cos(lambdaK - lambda);

    let qiblahBearing = radiansToDegrees(Math.atan2(y, x));
    qiblahBearing = (qiblahBearing + 360) % 360;

    return qiblahBearing;
  };

  const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
  const radiansToDegrees = (radians) => (radians * 180) / Math.PI;

  const getArrowRotation = () => {
    if (deviceOrientation !== null && qiblahDirection !== null) {
      // Correcting the rotation calculation
      const rotation = (deviceOrientation - qiblahDirection + 360) % 360;
      return rotation;
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
        padding={2}
      >
        <Typography variant="h6" color="error" align="center">
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
        padding={2}
      >
        <CircularProgress />
        <Typography style={{ marginTop: 16 }}>{t("gettingLocation")}</Typography>
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
        padding={2}
      >
        <Typography variant="h6" gutterBottom align="center">
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
          style={{ marginTop: 16 }}
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
      padding={2}
    >
      <Typography variant="h5" gutterBottom>
        {t("qiblahDirection")}
      </Typography>
      <Box
        position="relative"
        width={250}
        height={250}
        marginTop={2}
      >
        {/* Compass Circle */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius="50%"
          border="2px solid rgba(11, 107, 203, 1)"
          boxSizing="border-box"
        ></Box>

        {/* Fixed Qiblah Symbol at the top (e.g., Kaaba) */}
        <Box
          position="absolute"
          top="10%"
          left="50%"
          transform="translate(-50%, -50%)"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <LocationOnIcon style={{ fontSize: 40, color: "red" }} />
          <Typography variant="caption" style={{ color: "red" }}>
            Qiblah
          </Typography>
        </Box>

        {/* Rotating Arrow */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          style={{
            transform: `translate(-50%, -50%) rotate(${getArrowRotation()}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <ArrowDownwardOutlinedIcon style={{ fontSize: 100, color: "blue" }} />
        </Box>
      </Box>
      <Typography
        variant="body1"
        style={{ marginTop: 24, textAlign: "center", maxWidth: 300 }}
      >
        {t("rotateDevice")}
      </Typography>
    </Box>
  );
};

export default Qiblah;
