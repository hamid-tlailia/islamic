// BeMuslim.js
import React, { useEffect, useMemo, useState } from "react";
import "./beMuslim.css";
import {
  Box,
  Typography,
  Modal,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardOverflow,
  Chip,
  Divider,
  Stack,
  Grid,
  Sheet,
  IconButton,
  Tooltip,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  GlobalStyles,
} from "@mui/joy";

import { useTranslation } from "../../../../components/languages/provider";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReactPlayer from "react-player";

/* ================= CONTENT (INTENTIONALLY EMPTY) ================= */
const beMuslimContent = [
  // Introduction Section
  {
    title: {
      en: "What is Required to Become a Muslim?",
      ar: "ما المطلوب لكي تصبح مسلماً؟",
    },
    description: {
      en: "Entering Islam is one of the greatest blessings, and in reality, it is a return to the natural disposition (fitrah). Therefore, entering it is easy and does not require rituals or formal procedures. This person should pronounce the two testimonies (Shahadatayn), and it is not required for this declaration to be made in front of a scholar or in an Islamic court. Simply by pronouncing them, he becomes a Muslim—he has the rights of Muslims and bears the responsibilities of Muslims.After that, he is obligated to perform the outward practices of Islam—such as prayer, fasting, and others—as this is a consequence of pronouncing the two testimonies. Al-Bukhari and Muslim narrated from Ibn Umar (may Allah be pleased with them) that the Messenger of Allah (peace and blessings be upon him) said:(I have been commanded to fight the people until they testify that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establish prayer, and give zakat. If they do that, they have protected from me their blood and wealth, except by the right of Islam, and their reckoning is with Allah.) , He must also learn the necessary knowledge for these practices to be valid. For example, he should learn the conditions for the validity of prayer, its pillars, and similar matters.",
      ar: "إن الدخول في الإسلام نعمة من أعظم النعم، وهو في حقيقته رجوع إلى الفطرة، ولذا، فإن الدخول فيه أمره يسير ولا يحتاج إلى طقوس ولا أمور رسمية، فعلى هذا الرجل أن ينطق بالشهادتين، ولا يشترط أن يكون ذلك الإعلان أمام أحد العلماء أو في المحكمة الشرعية، فبمجرد نطقه بهما يصبح مسلماً ـ له ما للمسلمين وعليه ما على المسلمين ـ ويلزمه بعد ذلك الإتيان بشعائر الإسلام الظاهرة ـ كالصلاة والصوم وغيرهما ـ فإن هذا من مقتضى النطق بالشهادتين، روى البخاري ومسلم عن ابن عمر ـ رضي الله عنهما ـ أن رسول الله صلى الله عليه وسلم قال: ﴿أمرت أن أقاتل الناس حتى يشهدوا أن لا إله إلا الله وأن محمداً رسول الله، ويقيموا الصلاة، ويؤتوا الزكاة، فإذا فعلوا ذلك عصموا مني دماءهم وأموالهم إلا بحق الإسلام، وحسابهم على الله) , ويجب عليه أن يتعلم من العلم ما تصح به هذه الشعائر، فيتعلم ـ مثلاً ـ شروط صحة الصلاة وأركانها ونحو ذلك",
    },
    color: "info",
  },

  // Tawhid Section
  {
    title: {
      en: "Tawhid (Oneness of Allah)",
      ar: "التوحيد (وحدانية الله)",
    },
    description: {
      en: [
        {
          text: "Tawhid is the foundation of Islamic belief. It is the belief in the oneness of Allah, affirming that He has no partners, children, or equals. Everything in the universe is under His control and will. Tawhid means dedicating all acts of worship to Allah alone and refraining from associating partners with Him.",
          isTitle: false,
        },
        {
          text: "Types of Tawhid:",
          isTitle: true,
        },
        {
          text: "1. Tawhid al-Rububiyyah (Oneness of Lordship):",
          isType: true,
        },
        {
          text: "This is the belief that Allah alone is the Creator, Sustainer, and Maintainer of the universe. He is the only one who gives life and causes death, and nothing happens without His will.",
          isTitle: false,
        },
        {
          text: "2. Tawhid al-Uluhiyyah (Oneness of Worship):",
          isType: true,
        },
        {
          text: "This type emphasizes that only Allah is to be worshipped. All acts of worship—such as prayer, supplication, sacrifice, and reliance—must be directed solely to Allah.",
          isTitle: false,
        },
        {
          text: "3. Tawhid al-Asma wa al-Sifat (Oneness of Names and Attributes):",
          isType: true,
        },
        {
          text: "This is the belief that Allah's names and attributes are unique and unparalleled. We affirm all the names and attributes of Allah as described in the Quran and Sunnah without distorting, denying, or comparing them to creation.",
          isTitle: false,
        },
        {
          text: "Understanding and implementing Tawhid helps a Muslim build a strong relationship with Allah and avoid any form of shirk (associating partners with Allah).",
          isTitle: false,
        },
      ],
      ar: [
        {
          text: "التوحيد هو أساس العقيدة الإسلامية. إنه الإيمان بوحدانية الله، وأنه ليس له شركاء أو أبناء أو أنداد. كل شيء في الكون تحت سيطرته ومشيئته. التوحيد يعني تخصيص جميع أعمال العبادة لله وحده والابتعاد عن الشرك.",
          isTitle: false,
        },
        {
          text: "أنواع التوحيد:",
          isTitle: true,
        },
        {
          text: "1. توحيد الربوبية:",
          isType: true,
        },
        {
          text: "هو الاعتقاد بأن الله وحده هو الخالق والمدبر والمتحكم في الكون. هو الذي يحيي ويميت، ولا يحدث شيء إلا بمشيئته.",
          isTitle: false,
        },
        {
          text: "2. توحيد الألوهية:",
          isType: true,
        },
        {
          text: "يؤكد هذا النوع على أن الله وحده هو المستحق للعبادة. جميع أعمال العبادة—مثل الصلاة والدعاء والذبح والتوكل—يجب أن تُوجه إلى الله وحده.",
          isTitle: false,
        },
        {
          text: "3. توحيد الأسماء والصفات:",
          isType: true,
        },
        {
          text: "هو الإيمان بأن أسماء الله وصفاته فريدة ولا مثيل لها. نؤكد جميع أسماء الله وصفاته كما وردت في القرآن والسنة دون تحريف أو إنكار أو تشبيهها بالمخلوقين.",
          isTitle: false,
        },
        {
          text: "فهم التوحيد وتطبيقه يساعد المسلم في بناء علاقة قوية مع الله وتجنب أي شكل من أشكال الشرك.",
          isTitle: false,
        },
      ],
    },
    proof: {
      en: '"So know, [O Muhammad], that there is no deity except Allah and ask forgiveness for your sin and for the believing men and believing women..." (Surah Muhammad, 47:19)',
      ar: "﴿فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ وَاسْتَغْفِرْ لِذَنْبِكَ وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ...﴾ (سورة محمد 47:19)",
    },
    color: "primary",
  },
  // Benefits of Being Muslim Section
  {
    title: {
      en: "Benefits of Being a Muslim",
      ar: "فوائد كونك مسلمًا",
    },
    description: {
      en: "Being a Muslim brings numerous benefits. One of the greatest blessings is inner peace through submission to Allah’s will. Islam provides clear guidance for living a life filled with purpose, justice, and morality. It promotes compassion, kindness, and empathy for others, creating a harmonious society. The ultimate benefit is the promise of eternal success in the Hereafter, where a Muslim will be rewarded with Paradise for their faith and good deeds.",
      ar: "كونك مسلمًا يجلب العديد من الفوائد. من أعظم النعم السلام الداخلي من خلال الاستسلام لإرادة الله. يقدم الإسلام إرشادات واضحة لعيش حياة مليئة بالهدف والعدالة والأخلاق. يشجع على التعاطف واللطف والإحسان للآخرين، مما يخلق مجتمعًا متناغمًا. الفائدة النهائية هي الوعد بالنجاح الأبدي في الآخرة، حيث يكافأ المسلم بالجنة لإيمانه وأعماله الصالحة.",
    },
    proof: {
      en: "“Indeed, in the remembrance of Allah do hearts find rest.” (Surah Ar-Ra’d, 13:28)",
      ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ (سورة الرعد 13:28)",
    },
    color: "warning",
  },

  // Why Should I Become Muslim Section
  {
    title: {
      en: "Why Should I Become a Muslim?",
      ar: "لماذا يجب أن أصبح مسلمًا؟",
    },
    description: {
      en: "Islam is a complete way of life that provides purpose and guidance for every aspect of human existence. Becoming a Muslim allows a person to worship the one true God, live a righteous life, and follow the example of the Prophet Muhammad (peace be upon him). Islam offers clarity on ethical, moral, and social responsibilities, and by submitting to Allah, a person attains peace in this life and success in the Hereafter. Becoming a Muslim opens the door to eternal happiness and fulfillment.",
      ar: "الإسلام هو منهج حياة شامل يوفر هدفًا وإرشادات لكل جانب من جوانب الوجود البشري. كونك مسلمًا يسمح لك بعبادة الإله الحق، وعيش حياة صالحة، واتباع مثال النبي محمد صلى الله عليه وسلم. يقدم الإسلام وضوحًا حول المسؤوليات الأخلاقية والاجتماعية، ومن خلال الاستسلام لله، يحقق الإنسان السلام في هذه الحياة والنجاح في الآخرة. أن تصبح مسلمًا يفتح الباب للسعادة الأبدية والوفاء.",
    },
    proof: {
      en: "“And whoever seeks a religion other than Islam, it will never be accepted of him.” (Surah Al-Imran, 3:85)",
      ar: "وَمَن يَبْتَغِ غَيْرَ الْإِسْلَامِ دِينًا فَلَن يُقْبَلَ مِنْهُ (سورة آل عمران 85:3)",
    },
    color: "warning",
  },

  // Title for Islam Basics Section
  {
    title: {
      en: "Islam Basics (Five Pillars of Islam)",
      ar: "أساسيات الإسلام (أركان الإسلام الخمسة)",
    },
    description: {
      en: "Islam is built on five essential pillars that shape the foundation of a Muslim’s faith and practice. These pillars guide Muslims in their worship of Allah and their relationships with others. They are Shahada (declaration of faith), Salah (prayer), Zakah (charity), Sawm (fasting during Ramadan), and Hajj (pilgrimage to Makkah).",
      ar: "يبنى الإسلام على خمسة أركان أساسية تشكل أساس إيمان المسلم وممارساته. هذه الأركان توجه المسلمين في عبادتهم لله وفي علاقاتهم مع الآخرين. هذه الأركان هي الشهادة (إعلان الإيمان)، الصلاة، الزكاة، الصوم خلال رمضان، والحج إلى مكة.",
    },
    color: "primary",
  },

  // Islam Basics (Five Pillars of Islam)
  {
    minTitle: {
      en: "The First Pillar : The Shahada (Declaration of Faith)",
      ar: "الركن الأول : الشهادتان",
    },
    description: {
      en: [
        {
          text: "The Shahada is the first pillar of Islam, which declares that there is no god but Allah, and Muhammad is His messenger. By reciting the Shahada with conviction, one enters into the fold of Islam. This simple but profound statement reflects the core belief in Allah’s oneness and Muhammad’s prophethood.",
          isTitle: false,
        },
        {
          text: "The Shahada consists of two parts:",
          isTitle: true,
        },
        {
          text: '1. "Ash-hadu an la ilaha illa Allah" (I bear witness that there is no god worthy of worship except Allah): This affirms the oneness of Allah and rejects all forms of idolatry and polytheism.',
          isTitle: false,
        },
        {
          text: '2. "Wa ash-hadu anna Muhammadan rasul Allah" (And I bear witness that Muhammad is the messenger of Allah): This acknowledges that Muhammad is the final prophet sent by Allah, and his teachings are to be followed.',
          isTitle: false,
        },
        {
          text: "The Shahada signifies the acceptance of Islam and commitment to live according to its teachings. It must be declared with sincerity and understanding.",
          isTitle: false,
        },
      ],
      ar: [
        {
          text: "الشهادتان هما الركن الأول من أركان الإسلام. هما إعلان أن لا إله إلا الله وأن محمداً رسول الله. من خلال النطق بهذه الشهادة بإيمان، يدخل الشخص في الإسلام. تؤكد الشهادتان على وحدانية الله وتعترف بأن محمدًا هو خاتم الأنبياء.",
          isTitle: false,
        },
        {
          text: "تتكون الشهادة من جزئين:",
          isTitle: true,
        },
        {
          text: '1. "أشهد أن لا إله إلا الله": تؤكد وحدانية الله وترفض كل أشكال الشرك والوثنية.',
          isTitle: false,
        },
        {
          text: '2. "وأشهد أن محمدًا رسول الله": تعترف بأن محمدًا هو الرسول الأخير الذي أرسله الله، وأن تعاليمه يجب أن تُتبع.',
          isTitle: false,
        },
        {
          text: "تعني الشهادتان قبول الإسلام والالتزام بالعيش وفقًا لتعاليمه. يجب أن تُقال بصدق وفهم.",
          isTitle: false,
        },
      ],
    },
    proof: {
      en: '"Say, He is Allah, [Who is] One..." (Surah Al-Ikhlas, 112:1)',
      ar: "قُلْ هُوَ اللَّهُ أَحَدٌ (سورة الإخلاص 112:1)",
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Second Pillar : Salah (Prayer)",
      ar: "الركن الثاني : الصلاة",
    },
    description: {
      en: "Salah is the five daily prayers that Muslims perform to connect with Allah. These prayers are a constant reminder of a Muslim's dependence on Allah and reinforce discipline, spirituality, and moral accountability. The prayers are performed at specific times of the day: Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), and Isha (night). Each prayer includes specific physical movements and recitations from the Quran.",
      ar: "الصلاة هي الركن الثاني من أركان الإسلام. يؤدي المسلمون خمس صلوات يومية للتواصل مع الله. هذه الصلوات تذكر المسلم باعتماده على الله وتعزز الانضباط الروحي والأخلاقي. الصلوات الخمس هي الفجر (الصبح)، الظهر، العصر، المغرب، والعشاء. تشمل كل صلاة حركات جسدية محددة وتلاوة من القرآن.",
    },
    proof: {
      en: "“Establish prayer and give zakah, and bow with those who bow [in worship and obedience].” (Surah Al-Baqarah, 2:43)",
      ar: "وَأَقِيمُواْ ٱلصَّلَوٰةَ وَءَاتُواْ ٱلزَّكَوٰةَ (سورة البقرة 2:43)",
    },
    color: "success",
    isSalah: true,
    wuduSteps: [
      {
        stepNumber: 1,
        stepName: {
          en: "Intention (Niyyah)",
          ar: "النية",
        },
        description: {
          en: "Have the intention in your heart to perform Wudu.",
          ar: "اعقد النية في قلبك لأداء الوضوء.",
        },
      },
      {
        stepNumber: 2,
        stepName: {
          en: "Saying 'Bismillah'",
          ar: "البسملة",
        },
        description: {
          en: "Begin with the name of Allah.",
          ar: "ابدأ باسم الله.",
        },
      },
      {
        stepNumber: 3,
        stepName: {
          en: "Washing the hands",
          ar: "غسل اليدين",
        },
        description: {
          en: "Wash both hands up to the wrists three times.",
          ar: "اغسل يديك إلى الرسغين ثلاث مرات.",
        },
        repeats: 3,
      },
      {
        stepNumber: 4,
        stepName: {
          en: "Rinsing the mouth (Madmadah)",
          ar: "المضمضة",
        },
        description: {
          en: "Rinse the mouth three times.",
          ar: "مضمض فمك ثلاث مرات.",
        },
        repeats: 3,
      },
      {
        stepNumber: 5,
        stepName: {
          en: "Cleaning the nose (Istinshaq and Istinthar)",
          ar: "الاستنشاق والاستنثار",
        },
        description: {
          en: "Sniff water into the nostrils and blow it out, three times.",
          ar: "استنشق الماء في الأنف وأخرجه ثلاث مرات.",
        },
        repeats: 3,
      },
      {
        stepNumber: 6,
        stepName: {
          en: "Washing the face",
          ar: "غسل الوجه",
        },
        description: {
          en: "Wash the entire face three times.",
          ar: "اغسل وجهك بالكامل ثلاث مرات.",
        },
        repeats: 3,
      },
      {
        stepNumber: 7,
        stepName: {
          en: "Washing the arms",
          ar: "غسل الذراعين",
        },
        description: {
          en: "Wash the right arm up to the elbow three times, then the left arm.",
          ar: "اغسل الذراع اليمنى إلى المرفق ثلاث مرات، ثم اليسرى.",
        },
        repeats: 3,
      },
      {
        stepNumber: 8,
        stepName: {
          en: "Wiping over the head (Masah)",
          ar: "مسح الرأس",
        },
        description: {
          en: "Wipe over the entire head once.",
          ar: "امسح على رأسك مرة واحدة.",
        },
        repeats: 1,
      },
      {
        stepNumber: 9,
        stepName: {
          en: "Wiping the ears",
          ar: "مسح الأذنين",
        },
        description: {
          en: "Wipe inside and behind the ears once.",
          ar: "امسح داخل وخلف الأذنين مرة واحدة.",
        },
        repeats: 1,
      },
      {
        stepNumber: 10,
        stepName: {
          en: "Washing the feet",
          ar: "غسل القدمين",
        },
        description: {
          en: "Wash the right foot up to the ankles three times, then the left foot.",
          ar: "اغسل القدم اليمنى إلى الكعبين ثلاث مرات، ثم اليسرى.",
        },
        repeats: 3,
      },
    ],
    salahConditions: [
      {
        conditionNumber: 1,
        conditionName: {
          en: "Purity (Taharah)",
          ar: "الطهارة",
        },
        description: {
          en: "Being in a state of ritual purity (having performed Wudu or Ghusl if necessary).",
          ar: "أن تكون في حالة طهارة (بعد أداء الوضوء أو الغسل إذا لزم الأمر).",
        },
      },
      {
        conditionNumber: 2,
        conditionName: {
          en: "Cleanliness of body, clothes, and place",
          ar: "طهارة البدن والثياب والمكان",
        },
        description: {
          en: "Ensuring the body, clothes, and place of prayer are free from impurities.",
          ar: "التأكد من أن البدن والثياب ومكان الصلاة خالية من النجاسات.",
        },
      },
      {
        conditionNumber: 3,
        conditionName: {
          en: "Covering the 'Awrah",
          ar: "ستر العورة",
        },
        description: {
          en: "Wearing proper clothing that covers the required parts of the body.",
          ar: "ارتداء الملابس التي تغطي الأجزاء المطلوبة من الجسم.",
        },
      },
      {
        conditionNumber: 4,
        conditionName: {
          en: "Facing the Qibla",
          ar: "استقبال القبلة",
        },
        description: {
          en: "Facing the direction of the Kaaba in Makkah.",
          ar: "التوجه نحو الكعبة في مكة.",
        },
      },
      {
        conditionNumber: 5,
        conditionName: {
          en: "Intention (Niyyah)",
          ar: "النية",
        },
        description: {
          en: "Having the intention to perform the specific prayer.",
          ar: "عقد النية لأداء الصلاة المحددة.",
        },
      },
      {
        conditionNumber: 6,
        conditionName: {
          en: "Entrance of Prayer Time",
          ar: "دخول وقت الصلاة",
        },
        description: {
          en: "Ensuring the time of the prayer has begun.",
          ar: "التأكد من أن وقت الصلاة قد دخل.",
        },
      },
    ],
    // Added Places Not Allowed for Salah
    salahDisallowedPlaces: [
      {
        en: [
          "Graveyards",
          "Bathrooms",
          "Places where camels rest",
          "Slaughterhouses",
          "Garbage dumps",
          "Middle of the roads",
          "Rooftops of the Kaaba",
          "Stolen or usurped land",
        ],
        ar: [
          "المقابر",
          "الحمامات",
          "أعطان الإبل",
          "المجازر",
          "المزابل",
          "وسط الطرق",
          "سطح الكعبة",
          "الأرض المغصوبة",
        ],
      },
    ],
    // Added "Invalidators of Salah" section
    thingsThatInvalidateSalah: {
      en: [
        "Nullifying ablution (breaking wudu)",
        "Intentionally speaking during Salah",
        "Laughing out loud during Salah",
        "Eating or drinking during Salah",
        "Excessive movement without necessity",
        "Turning away from the Qibla",
        "Uncovering the 'Awrah intentionally",
        "Adding extra pillars intentionally",
        "Missing obligatory parts intentionally",
      ],
      ar: [
        "بطلان الوضوء (نقض الوضوء)",
        "الكلام العمد أثناء الصلاة",
        "الضحك بصوت عالٍ أثناء الصلاة",
        "الأكل أو الشرب أثناء الصلاة",
        "الحركة الكثيرة بلا ضرورة",
        "الانحراف عن القبلة",
        "كشف العورة عمدًا",
        "زيادة ركن عمدًا",
        "ترك واجب عمدًا",
      ],
    },
    videos: [
      {
        title: {
          en: "--| How to Perform Wudu (Ablution) --|",
          ar: "--| كيفية الوضوء |--",
        },
        description: {
          en: "This video shows you step by step how to perform Wudu, the ablution required before prayer.",
          ar: "يُظهر هذا الفيديو خطوة بخطوة كيفية أداء الوضوء، وهو الطهارة المطلوبة قبل الصلاة.",
        },
        url: "https://www.youtube.com/embed/6F1A4cpVmi8?si=iSWAhXgtqc7Kz1mP",
      },
      {
        title: {
          en: "--| How to Perform Salah (Prayer) |--",
          ar: "--| كيفية الصلاة |--",
        },
        description: {
          en: "This video demonstrates how to perform the Salah, the five daily prayers in Islam.",
          ar: "يُوضح هذا الفيديو كيفية أداء الصلاة، وهي الصلوات الخمس اليومية في الإسلام.",
        },
        url: "https://www.youtube.com/embed/Yn3tFP4MvRs?si=rXSMbbfalWx8YgoY",
      },
    ],
  },
  {
    minTitle: {
      en: "The Third Pillar : Zakah (Charity)",
      ar: "الركن الثالث : الزكاة",
    },
    description: {
      en: [
        {
          text: "Zakat Al-Mal is the specified amount of wealth that Islam obligates Muslims to pay annually from their wealth that reaches the nisab (minimum amount) according to certain conditions. Allah Almighty has imposed it on Muslims, and it is considered the third pillar of the five pillars of Islam upon which the religion is built. This amount of money is given to the poor and needy, and it is a means of purifying and cleansing wealth. Zakat is taken from funds and assets that reach the nisab and continue to grow, and it enhances the spirit of social solidarity and cooperation among members of the community.",
          isTitle: false,
        },
        {
          text: "To whom is Zakat given?",
          isTitle: true,
        },
        {
          text: "Muslims give Zakat to eight categories specified by Allah Almighty in the Quran:",
          isTitle: false,
        },
        {
          text: "(\"As-Sadaqat (here it means Zakat) are only for the Fuqara' (poor), and Al-Masakin (the needy), and those employed to collect (the funds); and to attract the hearts of those who have been inclined (towards Islam); and to free the captives; and for those in debt; and for Allah's Cause (i.e., for Mujahidun - those fighting in a holy battle), and for the wayfarer (a traveler who is cut off from everything); a duty imposed by Allah. And Allah is All-Knower, All-Wise.\") [Surah At-Tawbah: 60]",
          isTitle: false,
        },
        {
          text: "1. The Poor (Al-Fuqara’): Those who do not find enough to meet half of their needs for a year. The one obliged to pay Zakat should give Zakat to the poor to alleviate their hardship and need.",
          isTitle: false,
        },
        {
          text: "2. The Needy (Al-Masakin): Those who find enough to meet half of their needs but not complete sufficiency. They are also given to alleviate their hardship and need.",
          isTitle: false,
        },
        {
          text: "3. Those Employed to Collect Zakat: Those appointed by the Imam or his deputy to collect Zakat funds; they are the collectors, keepers, and recorders of its registry.",
          isTitle: false,
        },
        {
          text: "4. Those Whose Hearts Are To Be Reconciled: Those who are given Zakat to incline their hearts towards Islam or to strengthen their faith due to the weakness of their Islam, or to prevent their harm from Muslims, or to bring about some benefit from them.",
          isTitle: false,
        },
        {
          text: "5. To Free the Captives: This includes slaves and captives; it also includes the one who has made a contract of manumission with his master to free himself for a certain amount of money.",
          isTitle: false,
        },
        {
          text: "6. Those in Debt (Al-Gharimun): Those who are burdened with debts and cannot repay them. There are two types: debt incurred to reconcile between people, and debt incurred due to personal need.",
          isTitle: false,
        },
        {
          text: "7. In the Cause of Allah: Those who strive in the path of Allah, especially the Mujahideen who fight the enemy to make the word of Allah supreme. It is also said to include those who devote themselves to seeking Islamic knowledge.",
          isTitle: false,
        },
        {
          text: "8. The Wayfarer (Ibn Al-Sabil): A traveler who is cut off from his wealth; he is given what helps him achieve his goal or return to his country, even if he is rich there.",
          isTitle: false,
        },
        {
          text: "Where does your Zakat go when you pay it through a Zakat institution?",
          isTitle: true,
        },
        {
          text: "The poor and needy are the highest priority, and Zakat institutions focus on those who are in dire need through your Zakat. When you pay your Zakat through a Zakat institution, you send it directly to widows and orphans; refugees and war-displaced people; victims of sectarian violence; and families affected by natural disasters like earthquakes, storms, droughts, climate change, and other natural disasters.",
          isTitle: false,
        },
        {
          text: "Zakat institutions use 100% of your Zakat to reach the most needy people in the world, both domestically and abroad.",
          isTitle: false,
        },
        {
          text: "Virtues of Paying Zakat:",
          isTitle: true,
        },
        {
          text: "A means of salvation from the burden of wealth in the Hereafter. A reason for safety from fear on the Day of Great Panic. Attaining the degree of righteousness. A characteristic of the pious. A cause for winning Paradise and salvation from the torment of the grave and Hellfire. Evidence of gratitude for the blessing of wealth. It is a pillar of Islam, and a Muslim's Islam is not complete without implementing it.",
          isTitle: false,
        },
        {
          text: "A reason for forgiveness of sins and erasure of misdeeds. Earning great reward and abundant recompense from Allah. A cause for increasing faith and closeness to Allah.",
          isTitle: false,
        },
        {
          text: "What wealth is subject to Zakat?",
          isTitle: true,
        },
        {
          text: "Muslims pay Zakat on various types of their wealth that grow or have the potential to grow. Most of our wealth is in the form of personal and commercial wealth, such as money, goods, and assets, including gold, silver, valuable items used as a store of value, stocks, bonds, retirement accounts, deferred income, 401(k), cash value of insurances, bitcoins, etc.; expected repaid loans or tax refunds or refundable deposits or due salaries or payments; as well as inventory, goods, accounts receivable, investment real estate, etc.",
          isTitle: false,
        },
        {
          text: "How much Zakat should be paid?",
          isTitle: true,
        },
        {
          text: "The Zakat rates for personal wealth and business wealth are 2.5% each after a year has passed on it. The nisab (minimum amount) for personal wealth and business wealth is equivalent to our current measure of 85 grams of pure gold (approximately 3 US ounces).",
          isTitle: false,
        },
        {
          text: "2.5% of the value of gold, which is not less than 85 grams of 24-karat gold, or its equivalent in 21-karat and 18-karat. For silver, 2.5% of the value, which is not less than 595 grams. Zakat on money, stocks, and bonds is estimated based on the nisab of silver, so 2.5% is taken from the value of wealth that is not less than 595 grams of silver.",
          isTitle: false,
        },
        {
          text: "The nisab for agricultural produce has been set at 653 kg (about 1,439 pounds). The nisab for sheep (goats/sheep) is 40 heads. The nisab for cattle (cows/buffaloes/bison/antelopes/yaks/etc.) is 30 heads. The nisab for camels is five.",
          isTitle: false,
        },
        {
          text: "Zakat Al-Mal vs. Zakat Al-Fitr",
          isTitle: true,
        },
        {
          text: "Zakat Al-Mal:",
          isTitle: true,
        },
        {
          text: 'Zakat Al-Mal, also known as Zakat on wealth, is a financial act of worship paid annually from wealth that reaches the nisab and continues to increase and grow. It is a condition for paying Zakat Al-Mal that the wealth has completed a full lunar year and is above the specified nisab, and 2.5% of the wealth that meets the nisab must be given out. Zakat Al-Mal is considered a means of purifying and cleansing wealth, as Allah Almighty says in His Holy Book: "Take alms from their wealth in order to purify them and sanctify them with it." [Surah At-Tawbah: 103]',
          isTitle: false,
        },
        {
          text: "Zakat Al-Fitr:",
          isTitle: true,
        },
        {
          text: "Zakat Al-Fitr is another type of Zakat and must be paid during the blessed month of Ramadan. It differs from Zakat Al-Mal in that it is paid on behalf of every member of the family and is not related to a minimum amount of wealth. Zakat Al-Fitr aims to help the poor and needy and increase joy on the day of Eid Al-Fitr. It must be paid before the Eid prayer and traditionally equals an amount of food sufficient for the family, such as dates, barley, raisins, or dried yogurt. The value of Zakat Al-Fitr is determined according to prevailing prices in Ramadan and is an amount sufficient to meet the basic needs of the family.",
          isTitle: false,
        },
      ],
      ar: [
        {
          text: "زكاة المال هي القدر المحدد من المال الذي يوجبه الإسلام على المسلم إخراجه سنويًا من ثروته التي تبلغ النصاب، وفقًا لشروط معينة. فرضها الله سبحانه وتعالى على المسلمين، وهي تُعتبر الركن الثالث من أركان الإسلام الخمسة التي بني عليها دين الإسلام. يُدفع هذا القدر من المال للفقراء والمحتاجين، وهي وسيلة لتنقية المال وتطهيره. الزكاة تُخرج من الأموال والممتلكات التي تحقق النصاب وتستمر في النمو، وتعزز روح التكافل الاجتماعي والتعاون بين أفراد المجتمع.",
          isTitle: false,
        },
        {
          text: "لمن تُعطى الزكاة؟",
          isTitle: true,
        },
        {
          text: "يدفع المسلمون الزكاة إلى ثمانية فئات حددها الله سبحانه وتعالى وقال:",
          isTitle: false,
        },
        {
          text: "(إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ فَرِيضَةً مِنَ اللَّهِ وَاللَّهُ عَلِيمٌ حَكِيمٌ )، سورة التوبة:60",
          isTitle: false,
        },
        {
          text: "الفقراء: هو المحتاج الذي لا يجد كفايته لمدة نصف سنة، وعلى من تجب الزكاة عليه أن يُعطي الزكاة للفقير؛ لدفع ضرره وحاجته.",
          isTitle: false,
        },
        {
          text: "المساكين: هو المحتاج الذي يجد كفايته وعائلته لمدة نصف سنة لكنه لا يجد كمال الكفاية، وكذلك يُعطى لدفع ضرره وحاجته.",
          isTitle: false,
        },
        {
          text: "العاملون عليها: هم الذين يوليهم الإمام أو نائبه العمل جمع مال الزكاة وهم الجباة والحفظة لها والكتبة لِديوانها.",
          isTitle: false,
        },
        {
          text: "المؤلفة قلوبهم: وهم الجماعة المراد تأليف قلوبهم على الإسلام أو تثبيتها عليه لضعف إسلامهم أو كفِّ شرهم عن المسلمين أو جلب منفعة منهم وعلى من تجب الزكاة عليهم تخصيص حصة لهم من زكاة أموالهم.",
          isTitle: false,
        },
        {
          text: "في الرقاب: هم الأرقاء والعبيد وقيل أنها تشمل المكاتب الذي اشترى نفسه من سيده مقابل دراهم بقيت في ذمته كما أنها تشمل المسلم الذي وقع في أسر الكفار.",
          isTitle: false,
        },
        {
          text: "الغارمون: هم الذين تحملوا الديون وتعذّر عليهم أداؤها، والغارمين قسمين: غرم لإصلاح ذات البين. غرم لسداد الحاجة.",
          isTitle: false,
        },
        {
          text: "في سبيل الله: والمراد بهم المجاهدون الذين خرجوا لقتال العدو لإعلاء كلمة الله، أما من خرج حميةً لوطنه أو غيرها من الأمور الدنيوية فلا يستحق أن يُعطى من مال الزكاة، وقيل بأنّها تشمل من تفرغ لطلب العلم الشرعي.",
          isTitle: false,
        },
        {
          text: "ابن السبيل: هو المسافر الذي انقطع عن بلده ونفذت نفقته، فيُعطى ما يستعين به على تحقيق مقصده، أو عودته إلى بلده، وإن كان غنياً في بلده.",
          isTitle: false,
        },
        {
          text: "أين تذهب زكاتك عندما تدفعها مع مؤسسة الزكاة؟",
          isTitle: true,
        },
        {
          text: "يشكل الفقراء والمعوزين أعلى أولويات ومؤسسة الزكاة وتركز على هؤلاء الأشخاص الذين هم في حاجة شديدة من خلال زكاتك. عندما تدفع زكاتك من خلال مؤسسة الزكاة، فأنت ترسلها مباشرة إلى الأرامل والأيتام؛ اللاجئين ومشردي الحروب وضحايا العنف الطائفي؛ والأسر التي تضررت من الكوارث الطبيعية من الزلازل والعواصف والجفاف وتغير المناخ والكوارث الطبيعية الأخرى.",
          isTitle: false,
        },
        {
          text: "تستخدم مؤسسة الزكاة 100% من زكاتك للوصول إلى أكثر الناس احتياجًا في العالم، في الداخل والخارج.",
          isTitle: false,
        },
        {
          text: "فضائل دفع الزكاة:",
          isTitle: true,
        },
        {
          text: "سبب للنجاة من وَبال المال في الآخرة. سبب للأمان من الخوف يوم الفزع الأكبر. الوصول إلى درجة البر. صفة من صفات المتقين. سبب للفوز بالجنة والنجاة من عذاب القبر والنار. دليل على شكر نعمة المال. ركن من أركان الإسلام ولا يكتمل إسلام المسلم إلا بتطبيقها.",
          isTitle: false,
        },
        {
          text: "سبب لغفران الذنوب ومحو الخطايا. تحصيل الأجر العظيم والثواب الجزيل من الله تعالى. سبب لزيادة الإيمان والقرب من الله تعالى.",
          isTitle: false,
        },
        {
          text: "ما هي الثروة الواجب عليها الزكاة؟",
          isTitle: true,
        },
        {
          text: "يدفع المسلمون الزكاة على مختلف أنواع ثرواتهم التي تنمو، أو من الممكن أن تنمو. معظم ثروتنا على شكل ثروة شخصية وتجارية، مثل المال والسلع والأصول، وتشمل الذهب والفضة والأشياء الثمينة المستخدمة كمخزن للقيمة، الأسهم والسندات وحسابات التقاعد وأدوات المعاشات التقاعدية، الحساب الجاري، الدخل المؤجل، 401(k)، القيمة النقدية للتأمينات، البيتكوين، إلخ؛ القروض المسددة المتوقعة أو استرداد الضرائب أو الودائع القابلة للاسترداد أو المرتبات المستحقة أو المدفوعات؛ وكذلك المخزون، والبضائع، وإيرادات الذمم المدينة، والعقارات الاستثمارية، وما إلى ذلك.",
          isTitle: false,
        },
        {
          text: "ما مقدار دفع الزكاة؟",
          isTitle: true,
        },
        {
          text: "معدلات الزكاة للثروة الشخصية وثروة الأعمال بنسبة 2.5% لكل منهما بعد مرور عام عليها. قد حدد قيمة النصاب للثروة الشخصية وثروة الأعمال الثروة المستخرجة بما يعادل مقياسنا الحالي البالغ 85 جرامًا من الذهب الخالص (حوالي 3 أونصات أمريكية).",
          isTitle: false,
        },
        {
          text: "2.5% من قيمة الذهب، والذي لا يقل عن 85 غرام ذهب عيار 24، أو ما يكافئه من عيار 21، وعيار 18. الفضة يخرج ما مقداره 2.5% من قيمة الفضة والتي لا تقل عن 595 غرام. زكاة المال من النقد، والأسهم، والمستندات، يقدر بنصاب الفضة، فيخرج 2.5% من قيمة المال الذي لا يقل عن 595 غرام من الفضة.",
          isTitle: false,
        },
        {
          text: "وقد حدد نصاب المنتج الزراعي عند 653 كجم (حوالي 1,439 رطلاً). وحدد نصاب الضأن (الأغنام/الماعز) على 40 رأس. وحدد نصاب البقري (الأبقار/الجاموس/البيسون/الظباء/الياك/الخ) على 30 رأس. نصاب الإبل خمسة رؤوس.",
          isTitle: false,
        },
        {
          text: "زكاة المال وزكاة الفطر",
          isTitle: true,
        },
        {
          text: "زكاة المال",
          isTitle: true,
        },
        {
          text: "زكاة المال، المعروفة أيضًا بزكاة الثروة، هي عبادة مالية يتم دفعها سنويًا من الأموال التي تحقق النصاب وتستمر في الزيادة والنماء. يُشترط لدفع زكاة المال أن يكون المال قد مر عليه حول كامل (سنة قمرية) ويكون فوق النصاب المحدد، ويجب إخراج 2.5% من قيمة الثروة التي تحقق النصاب. تعتبر زكاة المال وسيلة لتنقية المال وتطهيره، كما قال الله سبحانه وتعالى في كتابه الكريم: {خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا} [التوبة: 103].",
          isTitle: false,
        },
        {
          text: "زكاة الفطر",
          isTitle: true,
        },
        {
          text: "زكاة الفطر هي نوع آخر من الزكاة، ويجب دفعها في شهر رمضان المبارك. تختلف زكاة الفطر عن زكاة المال في كونها تُدفع عن كل فرد من أفراد الأسرة ولا تتعلق بحد أدنى للثروة. تُهدف زكاة الفطر إلى مساعدة الفقراء والمحتاجين ورفع مستوى الفرح في يوم عيد الفطر. يجب دفع زكاة الفطر قبل صلاة العيد، وهي تقليديًا تعادل كمية من الطعام تكفي الأسرة، مثل التمر أو الشعير أو الزبيب أو الزبادي المجفف. يتم تحديد قيمة زكاة الفطر وفقًا للأسعار السائدة في رمضان، وتكون بمقدار يكفي لإشباع حاجات الأسرة الأساسية.",
          isTitle: false,
        },
      ],
    },
    proof: {
      en: '"Take alms from their wealth in order to purify them and sanctify them with it." (Surah At-Tawbah, 9:103)',
      ar: "﴿ خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا ﴾ [التوبة: 103]",
    },
    color: "success",
  },

  {
    minTitle: {
      en: "The Fourth Pillar : Sawm (Fasting in Ramadan)",
      ar: "الركن الرابع : الصيام",
    },
    description: {
      en: "Sawm is the fasting during the month of Ramadan, where Muslims abstain from food, drink, and other physical needs from dawn until sunset. Fasting teaches self-discipline, empathy for the less fortunate, and spiritual growth. It is a time for reflection, prayer, and increased devotion. Muslims are encouraged to read the Quran, perform extra prayers, and engage in charitable deeds during this month.",
      ar: "الصيام هو الامتناع عن الأكل والشرب والحاجات البدنية الأخرى خلال شهر رمضان من الفجر حتى غروب الشمس. الصيام يعلم ضبط النفس، والتعاطف مع الفقراء، ويعزز النمو الروحي. إنه وقت للتأمل والصلاة وزيادة التفاني. يُشجع المسلمون على قراءة القرآن وأداء الصلوات الإضافية والانخراط في الأعمال الخيرية خلال هذا الشهر.",
    },
    proof: {
      en: '"O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous." (Surah Al-Baqarah, 2:183)',
      ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ (سورة البقرة 2:183)",
    },
    color: "success",
    thingsNotAllowedWhileFasting: {
      en: [
        "Eating or drinking intentionally",
        "Intentional vomiting",
        "Sexual intercourse",
        "Menstruation or postnatal bleeding",
        "Injecting nutrients directly into the bloodstream",
        "Deliberate ejaculation",
        "Smoking",
        "Breaking the fast before sunset without a valid reason",
      ],
      ar: [
        "الأكل أو الشرب عمداً",
        "القيء المتعمد",
        "الجماع",
        "الحيض أو النفاس",
        "حقن المغذيات مباشرة في مجرى الدم",
        "الاستمناء المتعمد",
        "التدخين",
        "إفطار الصائم قبل غروب الشمس بدون عذر شرعي",
      ],
    },
  },
  {
    minTitle: {
      en: "The Fifth Pillar : Hajj (Pilgrimage to Makkah)",
      ar: "الركن الخامس : الحج",
    },
    description: {
      en: "Hajj is the pilgrimage to the holy city of Makkah, which every Muslim must undertake once in their lifetime if they are physically and financially able. Hajj is a profound act of worship where Muslims gather to perform specific rituals that commemorate the faith of Ibrahim (Abraham). The pilgrimage occurs during the Islamic month of Dhu al-Hijjah and involves a series of rites over several days.",
      ar: "الحج هو رحلة إلى مكة المكرمة ويجب على كل مسلم القادر أن يؤديه مرة واحدة في حياته. الحج هو عمل عبادة عظيم يجتمع فيه المسلمون لأداء شعائر معينة تخليداً لإيمان إبراهيم عليه السلام. يحدث الحج خلال شهر ذو الحجة ويتضمن سلسلة من الشعائر على مدى عدة أيام.",
    },
    proof: {
      en: '"And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way." (Surah Al-Imran, 3:97)',
      ar: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا (سورة آل عمران 3:97)",
    },
    color: "success",
    hajjSteps: {
      en: [
        {
          stepNumber: 1,
          stepName: "Ihram",
          description:
            "Entering the state of Ihram and making the intention to perform Hajj.",
        },
        {
          stepNumber: 2,
          stepName: "Tawaf",
          description: "Circumambulating the Kaaba seven times.",
        },
        {
          stepNumber: 3,
          stepName: "Sa'i",
          description:
            "Walking between the hills of Safa and Marwah seven times.",
        },
        {
          stepNumber: 4,
          stepName: "Standing at Arafat",
          description:
            "Spending the day at the plain of Arafat in prayer and supplication.",
        },
        {
          stepNumber: 5,
          stepName: "Muzdalifah",
          description:
            "Spending the night at Muzdalifah after sunset on the day of Arafat.",
        },
        {
          stepNumber: 6,
          stepName: "Stoning the Jamaraat",
          description:
            "Throwing pebbles at the pillars representing Satan in Mina.",
        },
        {
          stepNumber: 7,
          stepName: "Animal Sacrifice",
          description: "Offering an animal sacrifice to Allah.",
        },
        {
          stepNumber: 8,
          stepName: "Hair Cutting",
          description: "Shaving or cutting the hair.",
        },
        {
          stepNumber: 9,
          stepName: "Final Tawaf",
          description: "Performing the farewell Tawaf around the Kaaba.",
        },
      ],
      ar: [
        {
          stepNumber: 1,
          stepName: "الإحرام",
          description: "دخول في حالة الإحرام ونية أداء الحج.",
        },
        {
          stepNumber: 2,
          stepName: "الطواف",
          description: "الطواف حول الكعبة سبعة أشواط.",
        },
        {
          stepNumber: 3,
          stepName: "السعي",
          description: "السعي بين الصفا والمروة سبعة أشواط.",
        },
        {
          stepNumber: 4,
          stepName: "الوقوف بعرفة",
          description: "قضاء يوم عرفة في الصلاة والدعاء.",
        },
        {
          stepNumber: 5,
          stepName: "المزدلفة",
          description: "المبيت في مزدلفة بعد غروب شمس يوم عرفة.",
        },
        {
          stepNumber: 6,
          stepName: "رمي الجمرات",
          description: "رمي الجمرات في منى.",
        },
        {
          stepNumber: 7,
          stepName: "ذبح الهدي",
          description: "تقديم الأضحية لله.",
        },
        {
          stepNumber: 8,
          stepName: "الحلق أو التقصير",
          description: "حلق الشعر أو تقصيره.",
        },
        {
          stepNumber: 9,
          stepName: "طواف الوداع",
          description: "أداء طواف الوداع حول الكعبة.",
        },
      ],
    },
    videos: [
      {
        title: {
          en: "--| How to Perform Hajj --|",
          ar: "--| كيفية أداء مناسك الحج |--",
        },
        description: {
          en: "This video guides you through the steps of performing Hajj.",
          ar: "يُظهر هذا الفيديو خطوات أداء مناسك الحج.",
        },
        url: "https://www.youtube.com/embed/SNyLksy8DNE?si=b7BEU7Q3CN6vVdQv",
      },
    ],
  },

  // Title for Iman Basics Section
  {
    title: {
      en: "Iman Basics (Six Articles of Faith)",
      ar: "أساسيات الإيمان (أركان الإيمان الستة)",
    },
    description: {
      en: "The six articles of faith (Iman) are the core beliefs that every Muslim must hold. These include belief in Allah, His angels, His books, His prophets, the Day of Judgment, and divine decree (Qadr). These articles form the foundation of a Muslim’s worldview and guide their understanding of life, the universe, and their role within it.",
      ar: "أركان الإيمان الستة هي العقائد الأساسية التي يجب أن يعتقدها كل مسلم. وتشمل الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر. تشكل هذه الأركان أساس نظرة المسلم للعالم وتوجه فهمه للحياة والكون ودوره فيه.",
    },
    color: "primary",
  },

  // Iman Basics (Six Articles of Faith)
  {
    minTitle: {
      en: "The First Pillar : Belief in Allah",
      ar: "الركن الأول : الإيمان بالله",
    },
    description: {
      en: "It is the firm belief in His (Glorified and Exalted be He) existence, His Lordship, His Divinity, and His names and attributes. That a person believes that Allah the Exalted is Living, All-Knowing, All-Powerful, unique in His Lordship, Divinity, and His names and attributes; there is nothing like unto Him, and He is the All-Hearing, the All-Seeing. And he believes that Allah is capable of all things, and that His command, when He wills something, is only to say to it 'Be,' and it is.",
      ar: "هو الاعتقاد الجازم بوجوده سبحانه وتعالى، وربوبيته، وألوهيته، وأسمائه وصفاته.بأن يؤمن الإنسان بأن الله تعالى حي عليم قادر، منفرد بالربوبية وبالألوهية وبأسمائه وصفاته، ليس كمثله شيء وهو السميع البصير، ويؤمن بأن الله على كل شيء قدير، وأن أمره إذا أراد شيئاً أن يقول له: كن فيكون.",
    },
    proof: {
      en: '"He is Allah, besides Whom none has the right to be worshipped but He, the All-Knower of the unseen and the seen." (Surah Al-Hashr, 59:22)',
      ar: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ (سورة الحشر 59:22)",
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Second Pillar : Belief in the Angels",
      ar: "الركن الثاني : الإيمان بالملائكة",
    },
    description: {
      en: "Belief in the angels: It is the firm conviction that Allah has existing angels, created from light. As Allah has described them, they are honored servants who glorify Him night and day without tiring. They do not disobey Allah in what He commands them and they do what they are commanded. They are carrying out their duties which Allah has ordered them to perform.",
      ar: "الإيمان بالملائكة الإيمان بالملائكة: هو التصديقُ الجازمُ بأَنَّ لله ملائكةً مَوْجُودِينَ مَخلوقِينَ مِن نُور، وأنهم كَما وصَفَهم الله عبادٌ مُكْرمُونَ يُسبحونَ الليلَ والنهارَ لا يَفْتُرون وأنهم لا يَعْصُون الله ما أَمرهم وَيَفعلون مَا يُؤَمَرون، وأنَّهم قَائِمِونُ بِوَظائِفهم التِي أَمَرَهَمُ الله بالقيام بها.",
    },
    proof: {
      en: '"Whoever is an enemy to Allah and His angels and His messengers and Gabriel and Michael, then indeed, Allah is an enemy to the disbelievers." (Surah Al-Baqarah, 2:98)',
      ar: "مَن كَانَ عَدُوًّا لِلَّهِ وَمَلَائِكَتِهِ وَرُسُلِهِ وَجِبْرِيلَ وَمِيكَالَ فَإِنَّ اللَّهَ عَدُوٌّ لِّلْكَافِرِينَ (سورة البقرة 2:98)",
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Third Pillar : Belief in the Divine Books",
      ar: "الركن الثالث : الإيمان بالكتب السماوية",
    },
    description: {
      en: "And it is the belief that Allah the Exalted sent down His books to His messengers to establish proof against His creation after He created them upright upon the natural disposition (fitrah), but the devils led them astray. So within these books, there is a reminder for people, teaching for them, and rectification of their affairs. Among these books are: the Scrolls to Abraham, the Torah to Moses, the Psalms to David, the Gospel to Jesus, and concluded with this great Qur'an for the noble Prophet Muhammad (peace and blessings be upon him).",
      ar: "وهو الإيمان بأن الله تعالى أنزل كتبه على رسله؛ لإقامة الحجة على خلقه، بعد أن خلقهم حنفاء على الفطرة فأغوتهم الشياطين، ففيها تذكير للناس، وتعليم لهم، وإصلاح لأحوالهم. ومنها: الصحف لإبراهيم، واتوراة لموسى، والزبور لداود، والإنجيل لعيسى، وختمت بهذا القرآن العظيم للنبي الكريم صلى الله عليه وسلم.",
    },
    proof: {
      en: '"[It is] He who sent down the Book to you in truth, confirming what was before it. And He revealed the Torah and the Gospel." (Surah Al-Imran, 3:3)',
      ar: "نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ (سورة آل عمران 3:3)",
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Fourth Pillar : Belief in the Prophets",
      ar: "الركن الرابع : الإيمان بالرسل",
    },
    description: {
      ar: "الإيمان بالرسل هو أحد أصول الإيمان وأركانه الثابتة، ويقصد به التصديق الجازم برسالة الأنبياء والمرسلين والإقرار بنبوتهم، وتصديقهم فيما جاءوا به عن ربهم -عز وجل-، وتبليغهم رسالاتهم للناس جميعًا دون زيادة أو نقصان، والأدلة في كتاب الله -تعالى- كثيرة على وجوب الإيمان بالرسل والإقرار بنبوتهم.",
      en: "Belief in the Messengers is one of the fundamental principles and established pillars of faith. It means having firm conviction in the message of the prophets and messengers, acknowledging their prophethood, believing in what they brought from their Lord—Almighty and Majestic—and their conveying of His messages to all people without addition or omission. There are numerous evidences in the Book of Allah—Exalted is He—on the obligation of believing in the messengers and acknowledging their prophethood.",
    },
    proof: {
      ar: "«وَلَكِنَّ الْبِرَّ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الآخِرِ وَالْمَلَائِكَةِ وَالْكِتَابِ وَالنَّبِيِّينَ» (سورة البقرة، آية 177)",
      en: '"But righteousness is [in] one who believes in Allah, the Last Day, the angels, the Book, and the prophets..." (Surah Al-Baqarah, 2:177)',
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Fifth Pillar : Belief in the Day of Judgment",
      ar: "الركن الخامس : الإيمان باليوم الاخر",
    },
    description: {
      en: "Belief in the Last Day means the firm conviction that our world will come to its end at an hour known only to Allah the Exalted. It includes the coming of a day when Allah will resurrect people from their graves to hold them accountable for what they did in their worldly lives and they will receive their recompense. Whoever among them was a righteous believer will be rewarded with the bliss of Paradise, and whoever was a disbeliever and corrupt will be punished with the torment of the Fire.",
      ar: "يعني الإيمان باليوم الآخر الاعتقاد الجازم بأن عالمنا سيؤول إلى نهايته في ساعة لا يعلم أوانها إلاّ اللهُ تعالى، ومجيء يوم يبعث الله فيه الناس من قبورهم ليحاسبهم على ما عملوه في دنياهم وينالوا جزاءهم؛ فمن كان منهم مؤمناً صالحا كوفئ بنعيم الجنة ومن كان كافرا فاسقاً عوقب بعذاب النار.",
    },
    proof: {
      en: '"The Day they come forth nothing concerning them will be concealed from Allah. To whom belongs [all] sovereignty this Day? To Allah, the One, the Prevailing." (Surah Ghafir, 40:16)',
      ar: "يَوْمَ هُم بَارِزُونَ لَا يَخْفَىٰ عَلَى اللَّهِ مِنْهُمْ شَيْءٌ لِّمَنِ الْمُلْكُ الْيَوْمَ لِلَّهِ الْوَاحِدِ الْقَهَّارِ (سورة غافر 40:16)",
    },
    color: "success",
  },
  {
    minTitle: {
      en: "The Sixth Pillar : Belief in Divine Decree (Qadr)",
      ar: "الركن السادس : الإيمان بالقدر خيره و شره",
    },
    description: {
      en: "Belief in Divine Decree (Qadar), its good and its evil, is the sixth pillar of faith. Its meaning, as Imam Al-Nawawi explained regarding this pillar in his book Al-Arba'in Al-Nawawiyyah (The Forty Hadiths of Al-Nawawi):'Indeed, Allah, glorified and exalted be He, has decreed all things in eternity. Allah, the Exalted, knew that they would occur at times known to Him, the Exalted, and in places known, and they occur according to what Allah, glorified and exalted be He, has decreed.'",
      ar: "الإيمان بالقدَر خيره وشره هذا هو الركن السادس من أركان الإيمان، ومعناه كما قال الإمام النووي في شرحه لهذا الركن في كتاب (الأربعين النووية): إن الله سبحانه وتعالى قدَّر الأشياء في القِدَم، وعلم سبحانه وتعالى أنها ستقع في أوقات معلومة عنده سبحانه وتعالى، وفي أمكنة معلومة، وهي تقع على حسب ما قدَّره الله سبحانه وتعالى.",
    },
    proof: {
      en: '"Indeed, all things We created with predestination." (Surah Al-Qamar, 54:49)',
      ar: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ (سورة القمر 54:49)",
    },
    color: "success",
    qadarSteps: {
      en: [
        {
          stepNumber: 1,
          stepName: "Allah's Knowledge",
          description:
            "Belief that Allah knows everything that has happened, is happening, and will happen.",
        },
        {
          stepNumber: 2,
          stepName: "Writing in the Preserved Tablet",
          description:
            "Belief that Allah has written everything that will happen until the Day of Judgment in Al-Lawh Al-Mahfuz.",
        },
        {
          stepNumber: 3,
          stepName: "Divine Will",
          description: "Belief that nothing happens except by Allah's will.",
        },
        {
          stepNumber: 4,
          stepName: "Creation",
          description:
            "Belief that Allah is the Creator of all things, including people's actions.",
        },
      ],
      ar: [
        {
          stepNumber: 1,
          stepName: "علم الله",
          description: "الإيمان بأن الله يعلم كل ما كان وما يكون وما سيكون.",
        },
        {
          stepNumber: 2,
          stepName: "الكتابة في اللوح المحفوظ",
          description:
            "الإيمان بأن الله كتب كل ما سيحدث إلى يوم القيامة في اللوح المحفوظ.",
        },
        {
          stepNumber: 3,
          stepName: "المشيئة الإلهية",
          description: "الإيمان بأنه لا يحدث شيء إلا بمشيئة الله.",
        },
        {
          stepNumber: 4,
          stepName: "الخلق",
          description: "الإيمان بأن الله خالق كل شيء، بما في ذلك أفعال الناس.",
        },
      ],
    },
  },
];

/* ================= HELPERS ================= */
const safeText = (v) => (typeof v === "string" ? v : "");
const getPreviewText = (descByLang, lang) => {
  const v = descByLang?.[lang];
  if (Array.isArray(v)) return safeText(v?.[0]?.text || "");
  return safeText(v || "");
};
const isHeadingBlock = (item) => !!item?.isTitle;
const isTypeBlock = (item) => !!item?.isType;

const sectionTitle = (section, language, index) =>
  section?.minTitle?.[language] || section?.title?.[language] || `${index + 1}`;

const sectionSubtitle = (section, language) =>
  getPreviewText(section?.description, language);

/* ================= COMPONENT ================= */
const BeMuslim = () => {
  const { language } = useTranslation();
  const isRTL = language === "ar";

  const [open, setOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [videoLoadingStates, setVideoLoadingStates] = useState([]);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const handleOpen = (content) => {
    setSelectedContent(content);
    setOpen(true);
    setActiveTab(0);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedContent(null);
    setVideoLoadingStates([]);
  };

  useEffect(() => {
    if (selectedContent?.videos?.length) {
      setVideoLoadingStates(selectedContent.videos.map(() => true));
    } else {
      setVideoLoadingStates([]);
    }
  }, [selectedContent]);

  const handleVideoReady = (index) => {
    setVideoLoadingStates((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return beMuslimContent;

    return beMuslimContent.filter((section) => {
      const title = safeText(section?.title?.[language]);
      const minTitle = safeText(section?.minTitle?.[language]);
      const preview = getPreviewText(section?.description, language);
      const proof = safeText(section?.proof?.[language]);

      return (
        title.toLowerCase().includes(q) ||
        minTitle.toLowerCase().includes(q) ||
        preview.toLowerCase().includes(q) ||
        proof.toLowerCase().includes(q)
      );
    });
  }, [query, language]);

  const badgeLabel = (section) => {
    if (!section) return isRTL ? "محتوى" : "Content";
    if (section?.videos?.length) return isRTL ? "فيديو" : "Video";
    if (section?.wuduSteps) return isRTL ? "وضوء" : "Wudu";
    if (section?.salahConditions) return isRTL ? "صلاة" : "Salah";
    if (section?.thingsNotAllowedWhileFasting)
      return isRTL ? "صيام" : "Fasting";
    if (section?.hajjSteps) return isRTL ? "حج" : "Hajj";
    if (section?.qadarSteps) return isRTL ? "قدر" : "Qadar";
    if (section?.proof) return isRTL ? "دليل" : "Proof";
    return isRTL ? "محتوى" : "Content";
  };

  const modalTitle =
    selectedContent?.minTitle?.[language] ||
    selectedContent?.title?.[language] ||
    "";

  const modalHasSteps = !!(
    selectedContent?.wuduSteps ||
    selectedContent?.salahConditions ||
    selectedContent?.salahDisallowedPlaces ||
    selectedContent?.thingsThatInvalidateSalah ||
    selectedContent?.thingsNotAllowedWhileFasting ||
    selectedContent?.hajjSteps ||
    selectedContent?.qadarSteps
  );

  return (
    <>
      {/* ================= GLOBAL MODE STYLES (ONE PLACE) ================= */}
      <GlobalStyles
        styles={{
          ":root": {
            "--card-color": "var(--card-color)",
            "--text-color": "var(--text-color)",
            "--muted-text": "var(--joy-palette-text-secondary)",
            "--border-color": "var(--border-color)",
          },
        }}
      />

      <Box
        sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
          py: 2,
          maxWidth: 1100,
          mx: "auto",
          color: "var(--text-color)",

          /* ✅ Everything inherits mode automatically */
          "& .MuiTypography-root": { color: "var(--text-color)" },
          "& .MuiCard-root": {
            bgcolor: "var(--card-color)",
            color: "var(--text-color)",
          },
          "& .MuiSheet-root": {
            bgcolor: "var(--card-color)",
            color: "var(--text-color)",
          },
          "& .MuiInput-root": {
            bgcolor: "var(--card-color)",
            color: "var(--text-color)",
          },
          "& .MuiInput-input": {
            color: "var(--text-color)",
            WebkitTextFillColor: "var(--text-color)",
          },
          "& .MuiDivider-root": { borderColor: "var(--border-color)" },
          "& .MuiTab-root": { color: "var(--text-color)" },
        }}
      >
        {/* ================= HERO HEADER ================= */}
        <Card
          variant="soft"
          className="beMuslim-hero-card"
          sx={{ mb: 2, borderRadius: "lg", overflow: "hidden" }}
        >
          <CardOverflow sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  level="h2"
                  sx={{ fontWeight: 900, letterSpacing: -0.5 }}
                >
                  {isRTL ? "كن مسلمًا" : "Be a Muslim"}
                </Typography>
                <Typography
                  level="body-md"
                  sx={{ mt: 0.5, opacity: 0.8, mx: 2 }}
                >
                  {isRTL
                    ? "اقرأ الأقسام بسرعة وافتح التفاصيل داخل نافذة أنيقة."
                    : "Browse sections quickly and open details in a clean modal."}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.5, flexWrap: "wrap" }}
                >
                  <Chip variant="soft" color="success">
                    {isRTL ? "أساسيات" : "Basics"}
                  </Chip>
                  <Chip variant="soft" color="primary">
                    {isRTL ? "إيمان" : "Faith"}
                  </Chip>
                  <Chip variant="soft" color="warning">
                    {isRTL ? "أركان" : "Pillars"}
                  </Chip>
                </Stack>
              </Box>

              <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isRTL
                      ? "ابحث داخل العناوين والمحتوى..."
                      : "Search titles & content..."
                  }
                  startDecorator={<SearchRoundedIcon />}
                  sx={{
                    "--Input-radius": "16px",
                    "--Input-minHeight": "44px",
                    boxShadow: "sm",
                  }}
                />
                <Typography level="body-xs" sx={{ mt: 0.75, opacity: 0.7 }}>
                  {isRTL
                    ? `النتائج: ${filteredSections.length} / ${beMuslimContent.length}`
                    : `Results: ${filteredSections.length} / ${beMuslimContent.length}`}
                </Typography>
              </Box>
            </Stack>
          </CardOverflow>
        </Card>

        {/* ================= EMPTY STATE ================= */}
        {filteredSections.length === 0 ? (
          <Card variant="soft" sx={{ borderRadius: "lg" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InfoOutlinedIcon />
                  <Typography level="title-lg" sx={{ fontWeight: 900 }}>
                    {isRTL ? "لا يوجد محتوى للعرض" : "No content to display"}
                  </Typography>
                </Stack>
                <Typography level="body-md" sx={{ opacity: 0.8 }}>
                  {isRTL
                    ? "أضف العناصر داخل beMuslimContent، أو امسح البحث."
                    : "Add items to beMuslimContent, or clear the search."}
                </Typography>

                {!!query && (
                  <Button
                    variant="soft"
                    sx={{
                      borderRadius: "16px",
                      fontWeight: 800,
                      width: "fit-content",
                    }}
                    onClick={() => setQuery("")}
                  >
                    {isRTL ? "مسح البحث" : "Clear search"}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ) : (
          /* ================= GRID ================= */
          <Grid container spacing={2}>
            {filteredSections.map((section, index) => {
              const clickable = !!(section?.title || section?.minTitle);
              const title = sectionTitle(section, language, index);
              const subtitle = sectionSubtitle(section, language);
              const proof = safeText(section?.proof?.[language] || "");

              return (
                <Grid key={index} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: "xl",
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.2}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Chip
                            size="sm"
                            variant="soft"
                            color={section?.color || "neutral"}
                          >
                            {badgeLabel(section)}
                          </Chip>

                          {clickable ? (
                            <Tooltip
                              title={isRTL ? "فتح التفاصيل" : "Open details"}
                            >
                              <IconButton
                                size="sm"
                                variant="soft"
                                color="primary"
                                onClick={() => handleOpen(section)}
                              >
                                <InsertLinkOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Chip
                              size="sm"
                              variant="plain"
                              startDecorator={<InfoOutlinedIcon />}
                            >
                              {isRTL ? "مقدمة" : "Intro"}
                            </Chip>
                          )}
                        </Stack>

                        <Typography
                          level="title-lg"
                          sx={{ fontWeight: 900, lineHeight: 1.15 }}
                        >
                          {title}
                        </Typography>

                        <Typography
                          level="body-sm"
                          sx={{
                            opacity: 0.85,
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {subtitle}
                        </Typography>

                        {!!proof && (
                          <>
                            <Divider sx={{ my: 1.2 }} />
                            <Typography
                              level="body-xs"
                              sx={{
                                fontStyle: "italic",
                                opacity: 0.8,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {proof}
                            </Typography>
                          </>
                        )}

                        {clickable && (
                          <Button
                            variant="soft"
                            color="primary"
                            size="sm"
                            onClick={() => handleOpen(section)}
                            sx={{ borderRadius: "16px", fontWeight: 800 }}
                          >
                            {isRTL ? "عرض التفاصيل" : "View details"}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ================= MODAL ================= */}
        <Modal open={open} onClose={handleClose}>
          <Sheet
            variant="outlined"
            sx={{
              position: "fixed",
              inset: 0,
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
            }}
            className="beMuslim-modal-sheet"
          >
            {/* Top bar */}
            <Box
              sx={{
                px: { xs: 1.5, sm: 2.5, md: 3 },
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                className="salah-condition-header"
              >
                <Chip
                  variant="soft"
                  color={selectedContent?.color || "neutral"}
                >
                  {badgeLabel(selectedContent)}
                </Chip>

                <Typography
                  level="h4"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: "var(--text-color)",
                  }}
                >
                  {modalTitle}
                </Typography>
              </Stack>

              <Tooltip title={isRTL ? "إغلاق" : "Close"}>
                <IconButton variant="soft" color="danger" onClick={handleClose}>
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ flex: 1, minHeight: 0, bgcolor: "var(--card-color)" }}
            >
              <TabList
                variant="soft"
                sx={{
                  px: { xs: 1, sm: 2, md: 3 },
                  py: 0.75,
                  gap: 0.75,
                  flexWrap: "wrap",
                  bgcolor: "var(--tabs-bg-color)",
                  boxShadow: "var(--elev-1)",
                  color: "var(--text-color)",

                  // Make tabs flexible on small screens
                  "& .MuiTab-root": {
                    flex: { xs: "1 1 auto", sm: "0 0 auto" },
                    minWidth: { xs: 110, sm: 120, md: 140 },
                    px: { xs: 1, sm: 1.25 },
                    py: 0.9,
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-color)",
                    fontWeight: 700,
                    opacity: 0.9,
                    transition: "0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(127,127,127,0.12)",
                      opacity: 1,
                    },
                    "&.Mui-disabled": {
                      opacity: 0.45,
                      cursor: "not-allowed",
                      color: "var(--muted-text)",
                    },
                  },

                  // Selected tab (mode-safe)
                  "& .MuiTab-root.Mui-selected": {
                    bgcolor: "var(--primary-color)",
                    color: "var(--header-text-color)",
                    opacity: 1,
                    boxShadow: "var(--elev-1)",
                  },
                  "& .MuiTab-root.Mui-selected::after": {
                    bgcolor: "transparent",
                    boxShadow: "var(--elev-2)",
                  },
                  // Indicator (if Joy renders it for your setup)
                  "& .MuiTabs-indicator, & .Mui-indicator": {
                    bgcolor: "var(--text-color)",
                    height: 3,
                    borderRadius: 999,
                  },
                }}
              >
                <Tab value={0}>{isRTL ? "المحتوى" : "Content"}</Tab>
                <Tab value={1}>{isRTL ? "الدليل" : "Proof"}</Tab>
                <Tab value={2} disabled={!modalHasSteps}>
                  {isRTL ? "الخطوات" : "Steps"}
                </Tab>
                <Tab value={3} disabled={!selectedContent?.videos?.length}>
                  {isRTL ? "الفيديو" : "Videos"}
                </Tab>
              </TabList>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  px: { xs: 1.5, sm: 2.5, md: 3 },
                  py: 2,
                  bgcolor: "var(--card-color)",
                }}
              >
                {/* ========== TAB 0: CONTENT ========== */}
                <TabPanel value={0} sx={{ p: 0 }}>
                  {selectedContent ? (
                    <Card
                      variant="soft"
                      sx={{
                        borderRadius: "xl",
                        bgcolor: "var(--card-color)",
                        color: "var(--text-color)",
                      }}
                      className="beMuslim-content-card"
                    >
                      <CardContent>
                        {Array.isArray(
                          selectedContent?.description?.[language],
                        ) ? (
                          <Stack
                            spacing={1.25}
                            sx={{ color: "var(--text-color)" }}
                          >
                            {selectedContent.description[language].map(
                              (item, idx) => (
                                <Typography
                                  key={idx}
                                  level={
                                    isHeadingBlock(item)
                                      ? "title-lg"
                                      : isTypeBlock(item)
                                        ? "title-md"
                                        : "body-md"
                                  }
                                  sx={{
                                    fontWeight:
                                      isHeadingBlock(item) || isTypeBlock(item)
                                        ? 900
                                        : 400,
                                    opacity: isHeadingBlock(item) ? 0.95 : 0.9,
                                    borderInlineStart:
                                      isHeadingBlock(item) || isTypeBlock(item)
                                        ? "4px solid"
                                        : "none",
                                    borderColor: isHeadingBlock(item)
                                      ? "primary.500"
                                      : "success.500",
                                    ps:
                                      isHeadingBlock(item) || isTypeBlock(item)
                                        ? 1
                                        : 0,
                                    color: "var(--text-color)",
                                  }}
                                >
                                  {item.text}
                                </Typography>
                              ),
                            )}
                          </Stack>
                        ) : (
                          <Typography
                            level="body-md"
                            sx={{
                              opacity: 0.9,
                              color: "var(--text-color)",
                              borderColor: "var(--text-color)",
                            }}
                          >
                            {selectedContent?.description?.[language] || ""}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Typography level="body-md" sx={{ opacity: 0.7 }}>
                      {isRTL ? "لا يوجد محتوى." : "No content."}
                    </Typography>
                  )}
                </TabPanel>

                {/* ========== TAB 1: PROOF ========== */}
                <TabPanel value={1} sx={{ p: 0 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "xl",
                      bgcolor: "var(--card-color)",
                      color: "var(--text-color)",
                    }}
                    className="beMuslim-content-card"
                  >
                    <CardContent>
                      <Typography
                        level="title-lg"
                        sx={{
                          fontWeight: 900,
                          mb: 1,
                          color: "var(--text-color)",
                        }}
                      >
                        {isRTL ? "الدليل" : "Proof"}
                      </Typography>
                      <Typography
                        level="body-md"
                        sx={{
                          fontStyle: "italic",
                          opacity: 0.9,
                          color: "var(--text-color)",
                        }}
                      >
                        {selectedContent?.proof?.[language] ||
                          (isRTL ? "لا يوجد دليل هنا." : "No proof provided.")}
                      </Typography>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* ========== TAB 2: STEPS (ALL TYPES) ========== */}
                <TabPanel value={2} sx={{ p: 0 }}>
                  <Stack spacing={1.5}>
                    {/* Wudu */}
                    {selectedContent?.wuduSteps && (
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "xl",
                          bgcolor: "var(--card-color)",
                          color: "var(--text-color)",
                        }}
                      >
                        <CardContent className="wudu-steps">
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL ? "خطوات الوضوء" : "Wudu Steps"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.wuduSteps.map((step, idx) => (
                              <Card
                                key={idx}
                                variant="soft"
                                className="wudu-step-card"
                                sx={{
                                  borderRadius: "md",
                                  color: "var(--text-color)",
                                  borderColor: "var(--text-color)",
                                }}
                              >
                                <CardContent>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{
                                      mb: 0.5,
                                      borderColor: "var(--text-color)",
                                      color: "var(--text-color)",
                                    }}
                                    className="salah-condition-header"
                                  >
                                    <Chip variant="soft" color="primary">
                                      {step.stepNumber}
                                    </Chip>
                                    <Typography
                                      level="title-md"
                                      sx={{
                                        fontWeight: 900,
                                        color: "var(--text-color)",
                                      }}
                                    >
                                      {step.stepName?.[language]}
                                    </Typography>
                                    {step.repeats ? (
                                      <Chip
                                        variant="soft"
                                        color="success"
                                        size="sm"
                                      >
                                        {isRTL
                                          ? `تكرر ${step.repeats}`
                                          : `Repeat ${step.repeats}`}
                                      </Chip>
                                    ) : null}
                                  </Stack>
                                  <Typography
                                    level="body-md"
                                    sx={{
                                      opacity: 0.9,
                                      color: "var(--text-color)",
                                    }}
                                  >
                                    {step.description?.[language]}
                                  </Typography>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Salah Conditions */}
                    {selectedContent?.salahConditions && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL ? "شروط الصلاة" : "Salah Conditions"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.salahConditions.map((c, idx) => (
                              <Card
                                key={idx}
                                variant="soft"
                                sx={{ borderRadius: "lg" }}
                                className="wudu-step-card"
                              >
                                <CardContent>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ mb: 0.5 }}
                                    className="salah-condition-header"
                                  >
                                    <Chip
                                      variant="soft"
                                      color="warning"
                                      sx={{ margin: 5 }}
                                    >
                                      {c.conditionNumber}
                                    </Chip>
                                    <Typography
                                      level="title-md"
                                      sx={{
                                        fontWeight: 900,
                                        color: "var(--text-color)",
                                        m: 2,
                                      }}
                                    >
                                      {c.conditionName?.[language]}
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    level="body-md"
                                    sx={{
                                      opacity: 0.9,
                                      color: "var(--text-color)",
                                    }}
                                  >
                                    {c.description?.[language]}
                                  </Typography>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Places Not Allowed */}
                    {selectedContent?.salahDisallowedPlaces && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL
                              ? "أماكن لا تجوز فيها الصلاة"
                              : "Places Where Salah Is Not Allowed"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.salahDisallowedPlaces?.[0]?.[
                              language
                            ]?.map((p, idx) => (
                              <Chip
                                key={idx}
                                variant="soft"
                                sx={{ width: "fit-content" }}
                              >
                                {idx + 1}. {p}
                              </Chip>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Invalidators of Salah */}
                    {selectedContent?.thingsThatInvalidateSalah && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL
                              ? "مبطلات الصلاة"
                              : "Things That Invalidate Salah"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.thingsThatInvalidateSalah?.[
                              language
                            ]?.map((p, idx) => (
                              <Chip
                                key={idx}
                                variant="soft"
                                color="danger"
                                sx={{ width: "fit-content" }}
                              >
                                {idx + 1}. {p}
                              </Chip>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Fasting invalidators */}
                    {selectedContent?.thingsNotAllowedWhileFasting && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL
                              ? "مبطلات الصيام"
                              : "Things Not Allowed While Fasting"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.thingsNotAllowedWhileFasting?.[
                              language
                            ]?.map((p, idx) => (
                              <Chip
                                key={idx}
                                variant="soft"
                                color="danger"
                                sx={{ width: "fit-content" }}
                              >
                                {idx + 1}. {p}
                              </Chip>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Hajj steps */}
                    {selectedContent?.hajjSteps && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL ? "خطوات الحج" : "Hajj Steps"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.hajjSteps?.[language]?.map(
                              (s, idx) => (
                                <Card
                                  key={idx}
                                  variant="soft"
                                  sx={{ borderRadius: "lg" }}
                                  className="wudu-step-card"
                                >
                                  <CardContent>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 0.5 }}
                                      className="salah-condition-header"
                                    >
                                      <Chip variant="soft" color="primary">
                                        {s.stepNumber}
                                      </Chip>
                                      <Typography
                                        level="title-md"
                                        sx={{
                                          fontWeight: 900,
                                          color: "var(--text-color)",
                                        }}
                                      >
                                        {s.stepName}
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      level="body-md"
                                      sx={{
                                        opacity: 0.9,
                                        color: "var(--text-color)",
                                      }}
                                    >
                                      {s.description}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ),
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Qadar steps */}
                    {selectedContent?.qadarSteps && (
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "xl" }}
                        className="salah-condition-card"
                      >
                        <CardContent>
                          <Typography
                            level="title-lg"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              color: "var(--text-color)",
                            }}
                          >
                            {isRTL
                              ? "مراتب الإيمان بالقدر"
                              : "Aspects of Belief in Qadar"}
                          </Typography>
                          <Stack spacing={1}>
                            {selectedContent.qadarSteps?.[language]?.map(
                              (s, idx) => (
                                <Card
                                  key={idx}
                                  variant="soft"
                                  sx={{ borderRadius: "lg" }}
                                  className="wudu-step-card"
                                >
                                  <CardContent>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 0.5 }}
                                      className="salah-condition-header"
                                    >
                                      <Chip variant="soft" color="primary">
                                        {s.stepNumber}
                                      </Chip>
                                      <Typography
                                        level="title-md"
                                        sx={{
                                          fontWeight: 900,
                                          color: "var(--text-color)",
                                        }}
                                      >
                                        {s.stepName}
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      level="body-md"
                                      sx={{
                                        opacity: 0.9,
                                        color: "var(--text-color)",
                                      }}
                                    >
                                      {s.description}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ),
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* If steps tab opened but nothing exists */}
                    {!modalHasSteps && (
                      <Typography
                        level="body-md"
                        sx={{ opacity: 0.7, color: "var(--text-color)" }}
                      >
                        {isRTL
                          ? "لا توجد خطوات لهذا القسم."
                          : "No steps for this section."}
                      </Typography>
                    )}
                  </Stack>
                </TabPanel>

                {/* ========== TAB 3: VIDEOS ========== */}
                <TabPanel value={3} sx={{ p: 0 }} className="wudu-step-card">
                  <Stack spacing={2} className="wudu-step-card">
                    {selectedContent?.videos?.map((video, idx) => (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{ borderRadius: "xl", overflow: "hidden" }}
                        className="wudu-step-card"
                      >
                        <CardOverflow
                          variant="soft"
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            bgcolor: "var(--card-color)",
                            color: "var(--text-color)",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PlayCircleOutlineRoundedIcon />
                            <Typography
                              level="title-lg"
                              sx={{
                                fontWeight: 900,
                                color: "var(--text-color)",
                              }}
                            >
                              {video.title?.[language]}
                            </Typography>
                          </Stack>
                          <Chip variant="soft" color="primary" size="sm">
                            {isRTL ? "تشغيل" : "Play"}
                          </Chip>
                        </CardOverflow>

                        <CardContent>
                          <Typography
                            level="body-md"
                            sx={{
                              opacity: 0.9,
                              mb: 1.5,
                              color: "var(--text-color)",
                            }}
                          >
                            {video.description?.[language]}
                          </Typography>

                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              height: { xs: 220, sm: 340 },
                            }}
                          >
                            <ReactPlayer
                              url={video.url}
                              width="100%"
                              height="100%"
                              controls
                              onReady={() => handleVideoReady(idx)}
                            />
                            {videoLoadingStates[idx] && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "grid",
                                  placeItems: "center",
                                  bgcolor: "rgba(0,0,0,0.15)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                <CircularProgress />
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {!selectedContent?.videos?.length && (
                      <Typography
                        level="body-md"
                        sx={{ opacity: 0.7, color: "var(--text-color)" }}
                      >
                        {isRTL
                          ? "لا يوجد فيديو لهذا القسم."
                          : "No videos for this section."}
                      </Typography>
                    )}
                  </Stack>
                </TabPanel>
              </Box>
            </Tabs>
          </Sheet>
        </Modal>
      </Box>
    </>
  );
};

export default BeMuslim;
