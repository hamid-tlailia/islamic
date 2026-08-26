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
      <div className="container text-md-left">
        <div className="row text-md-left ">
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              {language === "ar" ? "تذكير" : "Reminder"}
            </h5>
            <p>
              {language === "en" ? (
                <>
                  <span>
                    {" "}
                    If you disbelieve, then know that Allah is truly not in need
                    of you, nor does He approve of disbelief from His servants.
                    But if you become grateful through faith, He will appreciate
                    that from you...
                  </span>
                  <br />
                  <small style={{ color: "greenYellow" }}>[Quran - 39:7]</small>
                </>
              ) : (
                <>
                  <span>
                    {" "}
                    إِن تَكْفُرُوا فَإِنَّ اللَّهَ غَنِيٌّ عَنكُمْ وَلَا
                    يَرْضَىٰ لِعِبَادِهِ الْكُفْرَ ۖ وَإِن تَشْكُرُوا يَرْضَهُ
                    لَكُمْ ۗ وَلَا تَزِرُ وَازِرَةٌ وِزْرَ أُخْرَىٰ ۗ ثُمَّ
                    إِلَىٰ رَبِّكُمْ مَرْجِعُكُمْ فَيُنَبِّئُكُمْ بِمَا كُنتُمْ
                    تَعْمَلُونَ ۚ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ
                  </span>
                  <br />
                  <small style={{ color: "greenYellow" }}>
                    [القرآن الكريم - سورة الزمر 39:7]
                  </small>
                </>
              )}
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
              {language === "en" ? "Contact Information " : "معلومات الاتصال"}
            </h5>
            <p>
              <AddLocationOutlinedIcon />{" "}
              {language === "en" ? "Doha ,Qatar" : "قطر , الدوحة"}
            </p>
            <p>
              <PublicOutlinedIcon />{" "}
              <a
                href="https://hamid-tlailia-portfolio-exyv.vercel.app/"
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
              <a href="tel:+97471009494" className="d-ltr">
                {" "}
                <span className="d-ltr">+974 7100 9494</span>{" "}
              </a>
            </p>
          </div>
        </div>

        <hr className="mb-4" />
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="text-white">
              © {year}{" "}
              {language === "en"
                ? "All rights reserved by : "
                : "كل الحقوق محفوظة : "}
              <span style={{ textDecoration: "none" }}>
                <strong className="text-warning">
                  {" "}
                  {translations.siteName}{" "}
                </strong>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
