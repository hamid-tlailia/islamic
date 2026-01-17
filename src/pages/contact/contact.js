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

import emailjs from "emailjs-com";
import { toast } from "react-toastify";

const Contact = () => {
  const { language } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [inputDirection, setInputDirection] = useState(
    language === "ar" ? "rtl" : "ltr",
  );

  useEffect(() => {
    const newTitle =
      language === "ar" ? "دين الله | الاتصال" : "God's religion | Contact";
    document.title = newTitle;
    localStorage.setItem("pageTitle", newTitle);
  }, [language]);

  useEffect(() => {
    localStorage.removeItem("last-category-position");
  }, []);

  const isArabicText = (text) => /[\u0600-\u06FF]/.test(text);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value.length > 0)
      setInputDirection(isArabicText(value) ? "rtl" : "ltr");
    else setInputDirection(language === "ar" ? "rtl" : "ltr");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceID = "service_q9ux1k2";
    const templateID = "template_2lguhoe";
    const userID = "an4QUGfU0CzKLoFMB";

    emailjs.send(serviceID, templateID, formData, userID).then(
      () => {
        toast.success(
          language === "ar"
            ? "شكراً لتواصلك معنا، سنقوم بالرد في أقرب وقت."
            : "Thanks for contacting us — we’ll reply as soon as possible.",
        );
        setFormData({ name: "", email: "", message: "" });
        setLoading(false);
        setInputDirection(language === "ar" ? "rtl" : "ltr");
      },
      (err) => {
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء إرسال الرسالة."
            : "An error occurred while sending your message.",
        );
        console.error("EmailJS Error:", err);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    setInputDirection(language === "ar" ? "rtl" : "ltr");
  }, [language]);

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const t = (ar, en) => (language === "ar" ? ar : en);

  return (
    <Box className={`contact-page ${language === "ar" ? "rtl" : "ltr"}`}>
      {/* Hero */}
      <Box className="contact-hero">
        <Typography level="h2" className="contact-title">
          {t("تواصل معنا", "Contact Us")}
        </Typography>
        <Typography level="body-md" className="contact-subtitle">
          {t(
            "يسعدنا سماع رسالتك. اختر الطريقة المناسبة أو أرسل رسالة مباشرة.",
            "We'd love to hear from you. Use any method below or send a message.",
          )}
        </Typography>
      </Box>

      <Box className="contact-grid">
        {/* Contact Info */}
        <Box className="contact-left">
          <Typography level="h4" className="section-title">
            {t("معلومات الاتصال", "Contact Information")}
          </Typography>

          <Box className="info-grid">
            <Card variant="outlined" className="info-card">
              <span className="info-icon">
                <EmailIcon />
              </span>
              <Box className="info-content">
                <Typography level="title-md" className="info-title">
                  {t("البريد الإلكتروني", "Email")}
                </Typography>
                <MuiLink
                  href="mailto:tlailia757@gmail.com"
                  className="info-link"
                >
                  tlailia757@gmail.com
                </MuiLink>
              </Box>
            </Card>

            <Card variant="outlined" className="info-card">
              <span className="info-icon">
                <PhoneIcon />
              </span>
              <Box className="info-content">
                <Typography level="title-md" className="info-title">
                  {t("الهاتف", "Phone")}
                </Typography>
                <MuiLink href="tel:+97450445182" className="info-link tel">
                  +974 50 445 182
                </MuiLink>
              </Box>
            </Card>

            <Card variant="outlined" className="info-card">
              <span className="info-icon">
                <LocationOnIcon />
              </span>
              <Box className="info-content">
                <Typography level="title-md" className="info-title">
                  {t("العنوان", "Address")}
                </Typography>
                <Typography level="body-sm" className="info-text">
                  Doha, Qatar (QA)
                </Typography>
              </Box>
            </Card>

            <Card variant="outlined" className="info-card">
              <span className="info-icon">
                <LinkIcon />
              </span>
              <Box className="info-content">
                <Typography level="title-md" className="info-title">
                  {t("المعرض", "Portfolio")}
                </Typography>
                <MuiLink
                  href="https://hamidos-portfolio.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  {t("زيارة موقعنا", "Visit our website")}
                </MuiLink>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Form */}
        <Box className="contact-right">
          <Typography level="h4" className="section-title">
            {t("أرسل لنا رسالة", "Send Us a Message")}
          </Typography>

          <Card variant="outlined" className="form-card">
            <Box component="form" onSubmit={handleSubmit} className="form">
              <FormControl>
                <FormLabel className="form-label">
                  {t("الاسم", "Name")}
                </FormLabel>
                <input
                  name="name"
                  value={formData.name}
                  placeholder={t("الاسم الكامل...", "Full name...")}
                  onChange={handleChange}
                  required
                  className="field"
                  style={{ direction: inputDirection }}
                />
              </FormControl>

              <FormControl>
                <FormLabel className="form-label">
                  {t("البريد الإلكتروني", "Email")}
                </FormLabel>
                <input
                  name="email"
                  type="text"
                  value={formData.email}
                  placeholder={t(
                    "البريد الإلكتروني أو رقم الهاتف...",
                    "Email or phone number...",
                  )}
                  onChange={handleChange}
                  required
                  className="field"
                  style={{ direction: inputDirection }}
                />
              </FormControl>

              <FormControl>
                <FormLabel className="form-label">
                  {t("الرسالة", "Message")}
                </FormLabel>
                <textarea
                  name="message"
                  value={formData.message}
                  placeholder={t("نص الرسالة...", "Your message...")}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="field textarea"
                  style={{ direction: inputDirection }}
                />
              </FormControl>

              <Box className="form-actions">
                <Button
                  type="submit"
                  variant="solid"
                  className="send-btn"
                  sx={{
                    "&:hover": {
                      backgroundColor: "inherit",
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size="sm" />
                  ) : (
                    t("إرسال", "Send")
                  )}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Contact;
