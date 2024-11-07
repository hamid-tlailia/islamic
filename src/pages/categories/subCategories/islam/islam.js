import React from "react";
import "./islam.css";
import { useTranslation } from "../../../../components/languages/provider";
import { Card, CardContent, Typography, Divider } from "@mui/joy";
import { Mosque, Public, People, Favorite } from "@mui/icons-material"; // Material UI Icons

const Islam = () => {
  const { language } = useTranslation();

  // Content for English and Arabic
  const content = {
    en: {
      whatIsIslam: {
        title: "What is Islam?",
        description: `Islam means submission to the will of God. It is one of the world's largest religions, emphasizing belief in one God (Allah) and the prophethood of Muhammad. Islam provides a comprehensive way of life, addressing spiritual, ethical, and social aspects. The core of the religion is based on the Five Pillars: faith, prayer, fasting, almsgiving, and pilgrimage.`,
      },
      whyIslam: {
        title: "Why Islam?",
        description: `Islam answers fundamental questions about life, offering purpose, meaning, and peace. It provides guidance for how to live a moral, balanced life and emphasizes justice, compassion, and social harmony. Many people choose Islam because of its clarity, simplicity, and the sense of peace it brings to their hearts.`,
      },
      prophet: {
        title: "The Messenger of Allah: Muhammad (PBUH)",
        description: `Muhammad is the final prophet sent by God to guide humanity. He confirmed the teachings of previous prophets and provided the final revelation through the Quran. His life serves as a model for living a righteous life in accordance with God’s commandments.`,
      },
      fivePillars: {
        title: "The Five Pillars of Islam",
        description: `The Five Pillars form the foundation of a Muslim’s faith and actions:
        1. Shahada (Declaration of Faith)
        2. Salah (Praying five times daily)
        3. Zakat (Charity)
        4. Sawm (Fasting during Ramadan)
        5. Hajj (Pilgrimage to Mecca, if able).`,
      },
      socialJustice: {
        title: "Islam and Social Justice",
        description: `Islam places a high emphasis on justice, equality, and the fair treatment of all people. It teaches that all humans are equal before God, regardless of race, nationality, or social status. Muslims are required to help the less fortunate and ensure fairness in society.`,
      },
      womenRights: {
        title: "Women’s Rights in Islam",
        description: `Islam guarantees rights to women that include education, property ownership, and participation in society. Women are seen as equal in spirituality, and the Quran grants them the same opportunities for rewards and forgiveness.`,
      },
    },
    ar: {
      whatIsIslam: {
        title: "ما هو الإسلام؟",
        description: `الإسلام يعني التسليم لإرادة الله. هو من أكبر الديانات في العالم، ويركز على الإيمان بالله الواحد ونبوة محمد. يقدم الإسلام منهجًا شاملًا للحياة، يتناول الجوانب الروحية والأخلاقية والاجتماعية. يستند جوهر الدين إلى الأركان الخمسة: الإيمان، الصلاة، الصوم، الزكاة، والحج.`,
      },
      whyIslam: {
        title: "لماذا الإسلام؟",
        description: `الإسلام يجيب عن الأسئلة الأساسية في الحياة، ويوفر الغرض والمعنى والسلام. يقدم الإسلام توجيهات حول كيفية العيش حياة أخلاقية ومتوازنة ويؤكد على العدالة والرحمة والانسجام الاجتماعي. يختار الكثيرون الإسلام بسبب وضوحه وبساطته والسلام الذي يجلبه لقلوبهم.`,
      },
      prophet: {
        title: "رسول الله: محمد صلى الله عليه وسلم",
        description: `محمد هو النبي الأخير الذي أرسله الله لهداية البشرية. أكد تعاليم الأنبياء السابقين وقدم الوحي الأخير من خلال القرآن. حياته نموذج لكيفية العيش حياة صالحة وفقًا لأوامر الله.`,
      },
      fivePillars: {
        title: "أركان الإسلام الخمسة",
        description: `تشكل أركان الإسلام الخمسة أساس إيمان المسلم وأفعاله:
        1. الشهادة (إعلان الإيمان)
        2. الصلاة (الصلوات الخمس)
        3. الزكاة (الصدقة)
        4. الصوم (صيام رمضان)
        5. الحج (الحج إلى مكة لمن استطاع).`,
      },
      socialJustice: {
        title: "الإسلام والعدالة الاجتماعية",
        description: `يضع الإسلام تركيزًا كبيرًا على العدالة والمساواة والمعاملة العادلة لجميع الناس. يعلم الإسلام أن جميع البشر متساوون أمام الله بغض النظر عن العرق أو الجنسية أو الحالة الاجتماعية. يُطلب من المسلمين مساعدة المحتاجين وضمان العدالة في المجتمع.`,
      },
      womenRights: {
        title: "حقوق المرأة في الإسلام",
        description: `يضمن الإسلام حقوق النساء في التعليم وملكية الممتلكات والمشاركة في المجتمع. تعتبر المرأة متساوية روحيًا، ويمنحها القرآن نفس الفرص للحصول على الأجر والمغفرة.`,
      },
    },
  };

  // Select content based on language
  const selectedContent = language === "ar" ? content.ar : content.en;

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        backgroundColor: "var(--card-color)",
        color: "var(--text-color)",
        padding: "20px",
        margin: "5px auto",
        borderRadius: "12px",
      }}
    >
      <CardContent>
        {/* What is Islam */}
        <Typography
          level="h2"
          component="div"
          sx={{ mb: 1.5, color: "var(--primary-color)", mt: 1 }}
        >
          <Mosque sx={{ mr: 1 }} /> {selectedContent.whatIsIslam.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.whatIsIslam.description}</p>

        {/* Why Islam */}
        <Typography
          level="h3"
          component="div"
          sx={{ mt: 4, color: "var(--secondary-color)" }}
        >
          <Favorite sx={{ mr: 1 }} /> {selectedContent.whyIslam.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.whyIslam.description}</p>

        {/* The Messenger of Allah */}
        <Typography
          level="h3"
          component="div"
          sx={{ mt: 4, color: "var(--tertiary-color)" }}
        >
          <People sx={{ mr: 1 }} /> {selectedContent.prophet.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.prophet.description}</p>

        {/* The Five Pillars of Islam */}
        <Typography
          level="h3"
          component="div"
          sx={{ mt: 4, color: "var(--quaternary-color)" }}
        >
          <Public sx={{ mr: 1 }} /> {selectedContent.fivePillars.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.fivePillars.description}</p>
        {/* Islam social justice */}
        <Typography level="h3" component="div" sx={{ mt: 4, color: "navy" }}>
          <Public sx={{ mr: 1 }} /> {selectedContent.socialJustice.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.socialJustice.description}</p>
        {/* Woman rights in islam */}
        <Typography level="h3" component="div" sx={{ mt: 4, color: "green" }}>
          <Public sx={{ mr: 1 }} /> {selectedContent.womenRights.title}
        </Typography>
        <Divider />
        <p style={{ mt: 2 }}>{selectedContent.womenRights.description}</p>
      </CardContent>
    </Card>
  );
};

export default Islam;
