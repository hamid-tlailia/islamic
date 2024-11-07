import React, { useEffect, useState } from "react";
import { useTranslation } from "../../components/languages/provider";
import "./contact.css";
import {
  Box,
  Button,
  Typography,
  Link as MuiLink,
  FormControl,
  FormLabel,
  Card,
  CircularProgress,
} from "@mui/joy";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";

// Import EmailJS
import emailjs from "emailjs-com";
import { toast } from "react-toastify";

const Contact = () => {
  const { language } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false); // Loading state for the submit button
  const [isReady, setIsReady] = useState(false);
  const [inputDirection, setInputDirection] = useState("rtl");
  useEffect(() => {
    // Set a new title and store it in localStorage
    const newTitle =
      language === "ar" ? "دين الله | الاتصال" : "God's religion | Contact";

    // Always update the title (to ensure it's consistent with your desired page title)
    document.title = newTitle;

    // Store the title in localStorage so it persists across reloads
    localStorage.setItem("pageTitle", newTitle);
  }, [isReady, language]); // Keep the empty dependency array

  useEffect(() => {
    localStorage.removeItem("last-category-position");
  }, []);

  useEffect(() => {
    setIsReady(true);
  }, []);
  const isArabicText = (text) => {
    // Arabic Unicode range: \u0600-\u06FF
    return /[\u0600-\u06FF]/.test(text);
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Detect language
    if (e.target.value.length > 0) {
      const isArabic = isArabicText(e.target.value);
      if (isArabic) setInputDirection("rtl");
      else setInputDirection("ltr");
    } else {
      if (language === "ar") setInputDirection("rtl");
      else setInputDirection("ltr");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    // EmailJS parameters
    const serviceID = "service_wkwt0sq";
    const templateID = "template_ceamp5d";
    const userID = "JgnJY3IJDvvpSS4nX";

    emailjs.send(serviceID, templateID, formData, userID).then(
      (response) => {
        toast.success(
          language === "ar"
            ? "شكرا لك على تواصلك معنا  , سنعمل جاهدا للرد قريبا"
            : "Thank you for contact us , we will respond as soon as possible"
        );
        setFormData({ name: "", email: "", message: "" });
        setLoading(false); // Stop loading
        if (language === "ar") setInputDirection("rtl");
        else setInputDirection("ltr");
      },
      (err) => {
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء إرسال الرسالة."
            : "An error occurred while sending your message."
        );
        console.error("EmailJS Error:", err);
        setLoading(false); // Stop loading
      }
    );
  };

  useEffect(() => {
    if (language === "ar") setInputDirection("rtl");
    else setInputDirection("ltr");
  }, [language]);

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "var(--card-color)",
        color: "var(--text-color)",
        mt: 1,
        border: "1px solid white",
      }}
    >
      <Typography
        level="h2"
        sx={{
          mb: 5,
          width: "100%",
          textAlign: "center",
        }}
        color="primary"
      >
        {language === "ar" ? "تواصل معنا" : "Contact Us"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column-reverse", // small screens
            md: "row", // medium and up
          },
          gap: 4,
        }}
      >
        {/* Contact Information */}
        <Box sx={{ flex: 1 }}>
          <Typography level="h4" sx={{ mb: 2, color: "#169777" }}>
            {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            {/* Cards with contact info */}
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                gap: 1,
                p: 2,
                bgcolor: "var(--card-color)",
                color: "var(--text-color)",
              }}
              className="cards"
            >
              <EmailIcon className="text-danger" />
              <Typography sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "البريد الإلكتروني" : "Email"} :{" "}
                <MuiLink
                  href="mailto:tlailia757@gmail.com"
                  sx={{ color: "primary" }}
                >
                  tlailia757@gmail.com
                </MuiLink>
              </Typography>
            </Card>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                gap: 1,
                p: 2,
                bgcolor: "var(--card-color)",
                color: "var(--text-color)",
              }}
              className="cards"
            >
              <PhoneIcon className="text-success" />
              <Typography sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "الهاتف" : "Phone"} :{" "}
                <MuiLink
                  href="tel:+97450445182"
                  sx={{ color: "primary", direction: "ltr" }}
                >
                  +974 50 445 182
                </MuiLink>
              </Typography>
            </Card>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                gap: 1,
                p: 2,
                bgcolor: "var(--card-color)",
                color: "var(--text-color)",
              }}
              className="cards"
            >
              <LocationOnIcon className="text-primary" />
              <Typography sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "العنوان" : "Address"} : Doha, Qatar (QA)
              </Typography>
            </Card>
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                gap: 1,
                p: 2,
                bgcolor: "var(--card-color)",
                color: "var(--text-color)",
              }}
              className="cards"
            >
              <LinkIcon className="text-warning" />
              <Typography sx={{ color: "var(--text-color)" }}>
                {language === "ar" ? "المعرض" : "Portfolio"} :{" "}
                <MuiLink
                  href="https://hamidos-portfolio.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "primary" }}
                >
                  {language === "ar" ? "زر موقعنا" : "Visit our website"}
                </MuiLink>
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Contact Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography level="h4" sx={{ mb: 2, color: "#169777" }}>
            {language === "ar" ? "أرسل لنا رسالة" : "Send Us a Message"}
          </Typography>
          <FormControl>
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? "الاسم" : "Name"}
            </FormLabel>
            <input
              name="name"
              value={formData.name}
              placeholder={
                language === "ar" ? "الاسم الكامل..." : "Full name..."
              }
              onChange={handleChange}
              required
              style={{
                width: "100%",
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "none",
                borderBottom: "1px solid",
                borderRadius: 0,
                padding: "8px 0",
                outline: "none",
                direction: inputDirection,
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? " البريد الإلكتروني" : "Email"}
            </FormLabel>
            <input
              name="email"
              type="text"
              placeholder={
                language === "ar"
                  ? "البريد الإلكتروني أو رقم الهاتف..."
                  : "Email or Phone number..."
              }
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "none",
                borderBottom: "1px solid",
                borderRadius: 0,
                padding: "8px 0",
                outline: "none",
                direction: inputDirection,
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel sx={{ color: "var(--text-color)" }}>
              {language === "ar" ? "الرسالة" : "Message"}
            </FormLabel>
            <textarea
              name="message"
              value={formData.message}
              placeholder={
                language === "ar" ? "نص الرسالة..." : "Your message..."
              }
              onChange={handleChange}
              required
              rows={4}
              style={{
                width: "100%",
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "none",
                borderBottom: "1px solid",
                borderRadius: 0,
                padding: "8px 0",
                outline: "none",
                resize: "none",
                direction: inputDirection,
              }}
            />
          </FormControl>
          <Button
            type="submit"
            variant="outlined"
            sx={{
              border: "1px solid rgba(11,107,203,1)",
              width: "max-content",
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size="sm" />
            ) : language === "ar" ? (
              "إرسال"
            ) : (
              "Send"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Contact;
