import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";
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
    let alpha = event.alpha; // 0 to 360 degrees
    const absolute = event.absolute;
    const webkitCompassHeading = event.webkitCompassHeading;

    console.log("Device Orientation Event:", event);

    if (typeof webkitCompassHeading !== "undefined") {
      // For iOS devices
      alpha = webkitCompassHeading;
    } else if (absolute === true && alpha !== null) {
      // For devices that provide absolute alpha
      alpha = alpha;
    } else if (alpha !== null) {
      // For devices that provide relative alpha
      alpha = 360 - alpha; // Adjust to match compass heading
    } else {
      setErrorMessage(t("deviceOrientationNotSupported"));
      return;
    }

    // Normalize alpha to [0, 360)
    alpha = (alpha + 360) % 360;

    setDeviceOrientation(alpha);
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
      const rotation = (qiblahDirection - deviceOrientation + 360) % 360;
      console.log("Qiblah Direction:", qiblahDirection);
      console.log("Device Orientation:", deviceOrientation);
      console.log("Arrow Rotation:", rotation);
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
        {/* Compass circle */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width={250}
          height={250}
          borderRadius="50%"
          border="2px solid #000"
        >
          {/* Makkah symbol fixed at the top */}
          <Box
            position="absolute"
            top="10px"
            left="50%"
            fontSize="24px"
            style={{
              transform: `translate(-50%, -50%) rotate(${getArrowRotation()}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.5s ease-in-out",
            }}
          >
            🕋
          </Box>
        </Box>
        {/* Arrow indicating the Qiblah direction relative to user's orientation */}
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
          <ArrowUpward style={{ fontSize: 100, color: "blue" }} />
        </Box>
      </Box>
      <Typography variant="body1" style={{ marginTop: 16 }}>
        {t("rotateDevice")}
      </Typography>
    </Box>
  );
};

export default Qiblah;
