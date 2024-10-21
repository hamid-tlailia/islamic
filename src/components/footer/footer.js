import React from "react";
import "./footer.css";
import { useTranslation } from "../languages/provider";
import AddLocationOutlinedIcon from "@mui/icons-material/AddLocationOutlined";
import PhoneEnabledOutlinedIcon from "@mui/icons-material/PhoneEnabledOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { NavLink } from "react-router-dom";

const Footer = ({ onFooterClick }) => {
  const date = new Date();
  const year = date.getFullYear();
  const { translations, language } = useTranslation();
  return (
    <div className="footer">
      <div className="container  text-md-left">
        <div className="row text-md-left">
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              {translations.about}
            </h5>
            <p>
              {language === "en" ? "Welcome to" : "مرحبا بكم في"}{" "}
              <span className="text-warning"> {translations.siteName} </span> ,
              {language === "en"
                ? `a place where we share Islamic
              teachings, articles, and resources. Our mission is to spread
              knowledge and inspire the Ummah.`
                : "مكان نشارك فيه التعاليم الإسلامية والمقالات والموارد. مهمتنا هي نشر المعرفة وإلهام الأمة."}
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              {language === "en" ? "Quick Links" : "روابط مفيدة"}
            </h5>
            <p>
              <NavLink
                to="/api-docs"
                className="text-info"
                style={{ textDecoration: "none" }}
              >
                {translations.APIdocs}
              </NavLink>
            </p>
            <p>
              <NavLink
                to="/categories/times"
                className="text-info"
                style={{ textDecoration: "none" }}
                onClick={() => {
                  localStorage.setItem("component-title", "prayerTimes");
                  onFooterClick();
                }}
              >
                {translations.prayerTimes}
              </NavLink>
            </p>
            <p>
              <NavLink
                to="/contact"
                className="text-info"
                style={{ textDecoration: "none" }}
              >
                {translations.contact}
              </NavLink>
            </p>
          </div>

          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              {language === "en" ? "Hours of Operation" : "ساعات العمل"}
            </h5>
            <p>
              {language === "en" ? "Monday" : "الأثنين"} -{" "}
              {language === "en" ? "Friday" : "الجمعة"} : 9:00 AM - 5:00 PM
            </p>
            <p>
              {language === "en" ? "Saturday" : "السبت"} : 10:00 AM - 2:00 PM
            </p>
            <p>{language === "en" ? "Sunday" : "الأحد"} : Closed</p>
          </div>

          <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              {language === "en" ? "Contact Information " : "معلومات الاتصال"}
            </h5>
            <p>
              <AddLocationOutlinedIcon />{" "}
              {language === "en" ? "Doha ,Qatar" : "قطر , الدوحة"}
            </p>
            <p>
              <PublicOutlinedIcon />{" "}
              <a
                href="https://hamidos-portfolio.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {language === "en" ? "Website" : "الموقع الشخصي"}
              </a>
            </p>
            <p
              className={language === "en" ? "ltr text-start" : "rtl text-end"}
            >
              <PhoneEnabledOutlinedIcon />
              <a href="tel:+97450445182">+974 50 445 182 </a>
            </p>
          </div>
        </div>

        <hr className="mb-4" />
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="text-white">
              © {year}{" "}
              {language === "en"
                ? "All rights reserved by:"
                : "كل الحقوق محفوظة :"}
              <a href="!#" style={{ textDecoration: "none" }}>
                <strong className="text-warning">
                  {" "}
                  {translations.siteName}{" "}
                </strong>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
