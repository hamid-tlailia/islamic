import React, { useEffect, useState } from "react";
import { useTranslation } from "../../components/languages/provider";
import {
  FaBook,
  FaQuran,
  FaLanguage,
  FaPray,
  FaFeatherAlt,
  FaMicrophone,
} from "react-icons/fa";
import "./about.css";
import { NavLink } from "react-router-dom";

const About = ({ onAboutClick }) => {
  const { language } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem("last-category-position");
  }, []);

  useEffect(() => {
    const newTitle =
      language === "ar" ? "دين الله | من نحن" : "God's religion | About Us";
    document.title = newTitle;
    localStorage.setItem("pageTitle", newTitle);
  }, [isReady, language]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const content = {
    en: {
      title: "About Us",
      description:
        "Welcome to دين الله, your source for various Islamic topics. We aim to provide authentic and comprehensive information to enrich your knowledge and spirituality. This is what you can learn on our website:",
      topics: [
        {
          name: "Hadith",
          icon: <FaBook />,
          description:
            "Explore the sayings and traditions of the Prophet Muhammad (peace be upon him).",
          url: "/categories/ahadith",
          title: "hadiths",
        },
        {
          name: "Quran",
          icon: <FaQuran />,
          description: "Read and listen to the Holy Quran.",
          url: "/categories/quran",
          title: "quran",
        },
        {
          name: "Arabic Language",
          icon: <FaLanguage />,
          description:
            "Learn the nuances of the Arabic language and its grammar.",
          url: "/categories/arabic",
          title: "arabicLanguage",
        },
        {
          name: "Tasbih",
          icon: <FaPray />,
          description: "Engage in remembrance and glorification of Allah.",
          url: "/categories/tasbih",
          title: "tasbeeh",
        },
        {
          name: "Fiqh",
          icon: <FaFeatherAlt />,
          description: "Understand Islamic jurisprudence and legal rulings.",
          url: "/categories/fiqh",
          title: "fiqhIslam",
        },
        {
          name: "Tajweed",
          icon: <FaMicrophone />,
          description: "Learn the proper pronunciation of Quranic recitation.",
          url: "/categories/tajweed",
          title: "alTajweed",
        },
      ],
    },
    ar: {
      title: "من نحن",
      description:
        "مرحبًا بكم في دين الله، مصدركم لمواضيع إسلامية متنوعة. نسعى لتقديم معلومات موثوقة وشاملة لتعزيز معرفتكم . هذا ما يمكنكم تعلمه في موقعنا:",
      topics: [
        {
          name: "الحديث",
          icon: <FaBook />,
          description: "استكشف أحاديث وسنن النبي محمد ﷺ.",
          url: "/categories/ahadith",
          title: "hadiths",
        },
        {
          name: "القرآن",
          icon: <FaQuran />,
          description: "اقرأ واستمع إلى القرآن الكريم.",
          url: "/categories/quran",
          title: "quran",
        },
        {
          name: "اللغة العربية",
          icon: <FaLanguage />,
          description: "تعلّم قواعد اللغة العربية ونحوها.",
          url: "/categories/arabic",
          title: "arabicLanguage",
        },
        {
          name: "التسبيح",
          icon: <FaPray />,
          description: "قم بالذكر والتسبيح لله تعالى.",
          url: "/categories/tasbih",
          title: "tasbeeh",
        },
        {
          name: "الفقه",
          icon: <FaFeatherAlt />,
          description: "تعرّف على الفقه الإسلامي والأحكام الشرعية.",
          url: "/categories/fiqh",
          title: "fiqhIslam",
        },
        {
          name: "التجويد",
          icon: <FaMicrophone />,
          description: "تعلّم النطق الصحيح لتلاوة القرآن الكريم.",
          url: "/categories/tajweed",
          title: "alTajweed",
        },
      ],
    },
  };

  const currentContent = content[language] || content.en;

  const changeCategorieTitle = (title) => {
    localStorage.setItem("component-title", title);
    onAboutClick?.();
  };

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className={`about-page ${language === "ar" ? "rtl" : "ltr"} mt-2`}>
      {/* Hero */}
      <div className="about-hero">
        <h1 className="about-title">{currentContent.title}</h1>
        <p className="about-description">{currentContent.description}</p>
      </div>

      {/* Topics */}
      <div className="topics-wrap">
        <div className="topics-grid">
          {currentContent.topics.map((topic) => (
            <NavLink
              className="topic-card"
              key={topic?.name}
              to={topic?.url}
              onClick={() => changeCategorieTitle(topic?.title)}
            >
              <div className="topic-icon">{topic?.icon}</div>

              <div className="topic-body">
                <h2 className="topic-name">{topic?.name}</h2>
                <p className="topic-description">{topic?.description}</p>
              </div>

              <div className="topic-arrow" aria-hidden="true">
                ↗
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
