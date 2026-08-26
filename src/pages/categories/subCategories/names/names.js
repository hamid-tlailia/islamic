import React, { useEffect, useMemo, useState } from "react";
import "./names.css";
import { useTranslation } from "../../../../components/languages/provider";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Divider from "@mui/joy/Divider";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { toast } from "react-toastify";

// ✅ 1) KEEP your current object بالكامل كما هو
const namesOfAllah = {
  Allah: {
    ar: "الله",
    en: "Allah",
    description_ar:
      "الله هو الاسم الأعظم لله، وهو خالق كل شيء ومدبره، يستحق العبادة وحده دون شريك أو ند، وله الكمال المطلق في الأسماء والصفات.",
    description_en:
      "Allah is the greatest name of God, the Creator and Sustainer of all things. He is the one worthy of worship, having absolute perfection in His names and attributes, without partner or equal.",
  },
  "Al-Ahad": {
    ar: "الأحد",
    en: "The One",
    description_ar:
      "الأحد يشير إلى توحيد الله وعدم شراكته في الألوهية، فهو واحد في ذاته وأسمائه وصفاته، ولا يشبهه أحد.",
    description_en:
      "Al-Ahad signifies the oneness of Allah, indicating His uniqueness and exclusivity in divinity. He is one in His essence, names, and attributes, and nothing resembles Him.",
  },
  "Al-A'la": {
    ar: "الأعلى",
    en: "The Most High",
    description_ar:
      "الأعلى يدل على علو مكانة الله وسموه فوق كل شيء، فهو المتعالي عن صفات النقص، مستحق لكل صفات الكمال والجلال.",
    description_en:
      "Al-A'la denotes the supreme status and exaltedness of Allah above all creation. He is above all in His majesty, far removed from any imperfection, and deserving of all attributes of perfection.",
  },
  "Al-Akram": {
    ar: "الأكرم",
    en: "The Most Generous",
    description_ar:
      "الأكرم يصف سخاء الله وكرمه الذي لا ينضب، فهو الكريم الذي يعطي بلا حساب، ويمنح نعمه برحمة وفضل.",
    description_en:
      "Al-Akram describes Allah's boundless generosity and unending kindness. He is the most generous, giving without measure and bestowing His blessings with grace and mercy.",
  },
  "Al-Ilah": {
    ar: "الإله",
    en: "The God",
    description_ar:
      "الإله يؤكد على أن الله هو الإله الوحيد المستحق للعبادة، فلا إله غيره، ولا يستحق العبادة سواه، له الألوهية الكاملة.",
    description_en:
      "Al-Ilah affirms that Allah is the only deity worthy of worship. There is no god besides Him, and He alone possesses complete divinity.",
  },
  "Al-Awwal": {
    ar: "الأول",
    en: "The First",
    description_ar:
      "الأول يدل على أن الله هو الأول من الزمان والأزل، لم يكن قبله شيء، وهو الذي أوجد كل شيء.",
    description_en:
      "Al-Awwal signifies that Allah is the first before all times and eternally existent. Nothing precedes Him, and He is the originator of all things.",
  },
  "Al-Akhir": {
    ar: "الآخر",
    en: "The Last",
    description_ar:
      "الآخر يدل على أن الله هو الأخير بعد كل شيء ولن يكون له نهاية، فهو الباقي بعد فناء كل شيء.",
    description_en:
      "Al-Akhir signifies that Allah is the last after all and has no end. He remains when everything else perishes.",
  },
  "Az-Zahir": {
    ar: "الظاهر",
    en: "The Manifest",
    description_ar:
      "الظاهر يشير إلى أن الله هو الظاهر في كل شيء، حيث تظهر دلائل قدرته وعظمته في خلقه.",
    description_en:
      "Az-Zahir indicates that Allah is evident and apparent in all things. His power and greatness are manifest in the universe He created.",
  },
  "Al-Batin": {
    ar: "الباطن",
    en: "The Hidden",
    description_ar:
      "الباطن يدل على أن الله هو الخفي عن العين لكنه يعلم كل شيء، فهو القريب الذي لا تدركه الأبصار.",
    description_en:
      "Al-Batin signifies that Allah is hidden from the eye but He knows everything. He is near, yet beyond human perception.",
  },
  "Al-Bari": {
    ar: "البارئ",
    en: "The Evolver",
    description_ar:
      "البارئ يصف الله كخالق ومبدع كل شيء، فهو الذي خلق الخلق وأبدعه دون سابق مثال.",
    description_en:
      "Al-Bari describes Allah as the creator and innovator of all things. He brought creation into existence in perfect form without any previous model.",
  },
  "Al-Barr": {
    ar: "البر",
    en: "The Source of All Goodness",
    description_ar:
      "البر يدل على أن الله هو مصدر كل خير ونعمة، فهو الرحيم بعباده، المحسن إليهم.",
    description_en:
      "Al-Barr signifies that Allah is the source of all goodness and blessings. He is compassionate to His servants, bestowing goodness upon them.",
  },
  "Al-Basir": {
    ar: "البصير",
    en: "The All-Seeing",
    description_ar:
      "البصير يشير إلى أن الله يرى كل شيء في كل زمان ومكان، فلا تخفى عليه خافية.",
    description_en:
      "Al-Basir indicates that Allah sees everything at all times and places. Nothing is hidden from His sight.",
  },
  "At-Tawwab": {
    ar: "التواب",
    en: "The Acceptor of Repentance",
    description_ar:
      "التواب يدل على أن الله يقبل التوبة من عباده ويغفر لهم مهما كثرت ذنوبهم إذا تابوا بصدق.",
    description_en:
      "At-Tawwab signifies that Allah accepts the repentance of His servants, forgiving them no matter how many sins they have if they repent sincerely.",
  },
  "Al-Jabbar": {
    ar: "الجبار",
    en: "The Compeller",
    description_ar:
      "الجبار يصف قوة الله وسيطرته المطلقة على الكون، فهو الذي يجبر المخلوقات على مشيئته.",
    description_en:
      "Al-Jabbar describes Allah's might and absolute control over the universe. He compels all creation according to His will.",
  },
  "Al-Hafez": {
    ar: "الحافظ",
    en: "The Preserver",
    description_ar:
      "الحافظ يدل على أن الله يحفظ كل شيء ويصون خلقه من الفناء، ويعتني بهم برحمته.",
    description_en:
      "Al-Hafez signifies that Allah preserves everything and safeguards His creation from perishing. He cares for them with His mercy.",
  },
  "Al-Hasib": {
    ar: "الحسيب",
    en: "The Reckoner",
    description_ar:
      "الحسيب يشير إلى أن الله سيحاسب الجميع على أعمالهم يوم القيامة، ولا يغفل عن أي عمل.",
    description_en:
      "Al-Hasib indicates that Allah will reckon everyone's deeds on the Day of Judgment, and nothing escapes His account.",
  },
  "Al-Hafiz": {
    ar: "الحفيظ",
    en: "The Guardian",
    description_ar:
      "الحفيظ يصف الله كحافظ ومُعين على عباده، يحفظهم من الشرور والمكروهات.",
    description_en:
      "Al-Hafiz describes Allah as the guardian and supporter of His servants, protecting them from harm and evil.",
  },
  "Al-Haqq": {
    ar: "الحق",
    en: "The Truth",
    description_ar:
      "الحق يؤكد أن الله هو الحقيقة المطلقة ولا يظلم أحدًا، وكل وعد منه حق.",
    description_en:
      "Al-Haqq affirms that Allah is the absolute truth. He does not wrong anyone, and all His promises are true.",
  },
  "Al-Mubin": {
    ar: "المبين",
    en: "The Clear",
    description_ar:
      "المبين يدل على وضوح الهداية والحق من الله، فهو يبين للناس طريق الخير.",
    description_en:
      "Al-Mubin signifies the clarity of guidance and truth from Allah. He makes the path of goodness clear to people.",
  },
  "Al-Hakim": {
    ar: "الحكيم",
    en: "The Wise",
    description_ar:
      "الحكيم يشير إلى حكمة الله في خلقه وتدبير أموره، فلا يفعل شيئًا عبثًا.",
    description_en:
      "Al-Hakim indicates Allah's wisdom in His creation and management of affairs. He does nothing in vain.",
  },
  "Al-Halim": {
    ar: "الحليم",
    en: "The Forbearing",
    description_ar:
      "الحليم يدل على صبر الله ورحمته في معاملة عباده، فهو لا يعجل بالعقوبة.",
    description_en:
      "Al-Halim signifies Allah's patience and mercy in dealing with His servants. He does not hasten to punish them.",
  },
  "Al-Hamid": {
    ar: "الحميد",
    en: "The Praiseworthy",
    description_ar:
      "الحميد يصف الله بأنه يستحق الحمد والثناء على أفعاله العظيمة، فهو محمود في كل حال.",
    description_en:
      "Al-Hamid describes Allah as worthy of praise and commendation for His great deeds. He is praised in all situations.",
  },
  "Al-Hayy": {
    ar: "الحي",
    en: "The Ever-Living",
    description_ar:
      "الحي يدل على أن الله حي لا يموت وأزلي خالق كل شيء، فهو دائم الحياة.",
    description_en:
      "Al-Hayy signifies that Allah is ever-living, never dies, and is the eternal creator of all. He is perpetually alive.",
  },
  "Al-Qayyum": {
    ar: "القيوم",
    en: "The Sustainer",
    description_ar:
      "القيوم يدل على أن الله هو الذي يقوم على كل شيء ويحافظ عليه، فلا يحتاج إلى أحد.",
    description_en:
      "Al-Qayyum indicates that Allah is the one who sustains and maintains everything. He depends on no one.",
  },
  "Al-Khabir": {
    ar: "الخبير",
    en: "The All-Aware",
    description_ar:
      "الخبير يشير إلى علم الله بكل شيء بما في ذلك ما يخفيه الناس وما في نفوسهم.",
    description_en:
      "Al-Khabir indicates Allah's knowledge of everything, including what people conceal and what lies within their hearts.",
  },
  "Al-Khaliq": {
    ar: "الخالق",
    en: "The Creator",
    description_ar:
      "الخالق يدل على أن الله هو خالق كل شيء من العدم وبإرادته الكاملة.",
    description_en:
      "Al-Khaliq signifies that Allah is the creator of everything from nothing, by His complete will.",
  },
  "Al-Khallaq": {
    ar: "الخلاق",
    en: "The Supreme Creator",
    description_ar: "الخلاق يصف الله كخالق عظيم ومتفرد، يخلق ويبدع بلا نهاية.",
    description_en:
      "Al-Khallaq describes Allah as the supreme and unique creator, who continuously creates and innovates without end.",
  },
  "Ar-Ra'uf": {
    ar: "الرءوف",
    en: "The Compassionate",
    description_ar:
      "الرءوف يدل على لطف الله وحنانه تجاه عباده، فهو رءوف بهم في كل حال.",
    description_en:
      "Ar-Ra'uf signifies Allah's kindness and compassion towards His servants. He is compassionate with them in all circumstances.",
  },
  "Ar-Rahman": {
    ar: "الرحمن",
    en: "The Beneficent",
    description_ar:
      "الرحمن يشير إلى رحمة الله الواسعة والشاملة لكل خلقه، فلا يحرم أحدًا من فضله.",
    description_en:
      "Ar-Rahman indicates Allah's extensive and all-encompassing mercy towards all His creation. No one is deprived of His grace.",
  },
  "Ar-Rahim": {
    ar: "الرحيم",
    en: "The Merciful",
    description_ar:
      "الرحيم يدل على رحمة الله المستمرة والخاصّة بعباده المؤمنين، فهو رحيم بهم يوم القيامة.",
    description_en:
      "Ar-Rahim signifies Allah's ongoing mercy, especially towards His believing servants. He is merciful to them on the Day of Judgment.",
  },
  "Ar-Razzaq": {
    ar: "الرزاق",
    en: "The Provider",
    description_ar:
      "الرزاق يشير إلى أن الله هو المعطي والمانح لكل الخلق من الرزق، وهو يكفل الجميع.",
    description_en:
      "Ar-Razzaq indicates that Allah is the giver and provider of sustenance to all creation. He ensures provision for all.",
  },
  "Ar-Raqib": {
    ar: "الرقيب",
    en: "The Watchful",
    description_ar:
      "الرقيب يدل على أن الله يراقب كل شيء ولا يخفى عليه شيء، فهو يعلم السر وأخفى.",
    description_en:
      "Ar-Raqib signifies that Allah watches over everything, and nothing is hidden from Him. He knows the secrets and what is even more concealed.",
  },
  "As-Salam": {
    ar: "السلام",
    en: "The Source of Peace",
    description_ar:
      "السلام يصف الله بأنه مصدر السلام والأمان لكل الخلق، فبه تنعم القلوب بالطمأنينة.",
    description_en:
      "As-Salam describes Allah as the source of peace and safety for all creation. Through Him, hearts find tranquility.",
  },
  "As-Sami'": {
    ar: "السميع",
    en: "The All-Hearing",
    description_ar:
      "السميع يدل على أن الله يسمع كل الأصوات والدعوات مهما كانت خفية، فلا يفوته شيء.",
    description_en:
      "As-Sami' indicates that Allah hears all sounds and supplications, no matter how quiet they are. Nothing escapes His hearing.",
  },
  "Ash-Shakir": {
    ar: "الشاكر",
    en: "The Appreciative",
    description_ar:
      "الشاكر يصف الله بأنه يثني على عباده ويقدر جهودهم، ويجازيهم على أعمالهم الصالحة.",
    description_en:
      "Ash-Shakir describes Allah as one who appreciates and rewards His servants' efforts. He acknowledges their good deeds.",
  },
  "Ash-Shakur": {
    ar: "الشكور",
    en: "The Most Grateful",
    description_ar:
      "الشكور يدل على امتنان الله وفضله لعباده، فيكافئهم أضعاف ما عملوا.",
    description_en:
      "Ash-Shakur signifies Allah's gratitude and favor towards His servants. He rewards them manifold for their deeds.",
  },
  "Ash-Shahid": {
    ar: "الشهيد",
    en: "The Witness",
    description_ar:
      "الشهيد يشير إلى أن الله يشهد على كل أعمال ونيات عباده، فهو شهيد على كل شيء.",
    description_en:
      "Ash-Shahid indicates that Allah witnesses all the actions and intentions of His servants. He is a witness over everything.",
  },
  "As-Samad": {
    ar: "الصمد",
    en: "The Eternal",
    description_ar:
      "الصمد يدل على أن الله هو المستغني عن كل شيء ولا يحتاج إلى أحد، وكل الخلق يحتاجون إليه.",
    description_en:
      "As-Samad signifies that Allah is self-sufficient and in need of nothing, while all of creation is in need of Him.",
  },
  "Al-'Alem": {
    ar: "العالم",
    en: "The All-Knowing",
    description_ar:
      "العالم يشير إلى علم الله بكل شيء في الكون، فهو يعلم السر والعلن.",
    description_en:
      "Al-'Alem indicates Allah's knowledge of everything in the universe. He knows the seen and the unseen.",
  },
  "Al-'Aziz": {
    ar: "العزيز",
    en: "The Almighty",
    description_ar:
      "العزيز يدل على قوة الله وسلطته المطلقة، فهو العزيز الذي لا يُقهر.",
    description_en:
      "Al-'Aziz signifies Allah's might and absolute authority. He is the mighty one who cannot be overcome.",
  },
  "Al-'Azim": {
    ar: "العظيم",
    en: "The Magnificent",
    description_ar:
      "العظيم يصف عظمة الله وكبريائه، فهو العظيم الذي لا يحده شيء.",
    description_en:
      "Al-'Azim describes Allah's greatness and majesty. He is magnificent beyond all limits.",
  },
  "Al-'Afuww": {
    ar: "العفو",
    en: "The Pardoner",
    description_ar:
      "العفو يدل على مغفرة الله لذنوب عباده عند توبتهم، فهو يعفو عن كثير من الذنوب.",
    description_en:
      "Al-'Afuww signifies Allah's forgiveness of His servants' sins upon their repentance. He pardons many sins.",
  },
  "Al-'Alim": {
    ar: "العليم",
    en: "The All-Knowing",
    description_ar:
      "العليم يشير إلى علم الله اللامحدود بكل شيء، فهو يعلم ما كان وما سيكون.",
    description_en:
      "Al-'Alim indicates Allah's unlimited knowledge of everything. He knows what was, what is, and what will be.",
  },
  "Al-'Aliyy": {
    ar: "العلي",
    en: "The Most High",
    description_ar:
      "العلي يدل على سمو الله وعلو مكانته فوق كل شيء، فهو العلي الذي لا يدانيه أحد.",
    description_en:
      "Al-'Aliyy signifies Allah's exaltedness and high status above all things. He is the most high, above all.",
  },
  "Al-Ghaffar": {
    ar: "الغفار",
    en: "The Great Forgiver",
    description_ar:
      "الغفار يصف رحمة الله التي تغفر الذنوب مهما عظمت، فهو يغفر الذنوب كلها.",
    description_en:
      "Al-Ghaffar describes Allah's mercy that forgives sins no matter how great. He forgives all sins.",
  },
  "Al-Ghafur": {
    ar: "الغفور",
    en: "The Great Forgiver",
    description_ar:
      "الغفور يدل على غفران الله لعباده الذين يتوبون إليه، فهو غفور رحيم.",
    description_en:
      "Al-Ghafur signifies Allah's forgiveness towards His servants who repent to Him. He is most forgiving and merciful.",
  },
  "Al-Ghaniyy": {
    ar: "الغني",
    en: "The Self-Sufficient",
    description_ar:
      "الغني يدل على أن الله غني عن كل شيء ومحتاج لعباده، فهو المستغني بذاته.",
    description_en:
      "Al-Ghaniyy signifies that Allah is self-sufficient and His servants are in need of Him. He is independent in His essence.",
  },
  "Al-Fattah": {
    ar: "الفتاح",
    en: "The Opener",
    description_ar:
      "الفتاح يشير إلى أن الله يفتح الأبواب وييسر الأمور لعباده، ويكشف لهم أسرار الأمور.",
    description_en:
      "Al-Fattah indicates that Allah opens doors and facilitates matters for His servants. He reveals the secrets of affairs.",
  },
  "Al-Qader": {
    ar: "القادر",
    en: "The Omnipotent",
    description_ar:
      "القادر يدل على قدرة الله المطلقة في كل شيء، فلا يعجزه شيء.",
    description_en:
      "Al-Qader signifies Allah's absolute power over everything. Nothing is beyond His capability.",
  },
  "Al-Qahir": {
    ar: "القاهر",
    en: "The All-Subduer",
    description_ar:
      "القاهر يصف قدرة الله على إخضاع كل شيء تحت إرادته، فهو القاهر فوق عباده.",
    description_en:
      "Al-Qahir describes Allah's ability to subdue everything under His will. He is the subduer over His servants.",
  },
  "Al-Quddus": {
    ar: "القدوس",
    en: "The Most Sacred",
    description_ar:
      "القدوس يدل على طهارة الله ونقائه من كل نقص، فهو المتنزه عن العيوب.",
    description_en:
      "Al-Quddus signifies Allah's purity and freedom from any imperfection. He is free from all flaws.",
  },
  "Al-Qadir": {
    ar: "القدير",
    en: "The Powerful",
    description_ar:
      "القدير يشير إلى قدرة الله على فعل كل شيء بإرادته، فهو القادر على كل شيء.",
    description_en:
      "Al-Qadir indicates Allah's power to do everything by His will. He is capable of all things.",
  },
  "Al-Qarib": {
    ar: "القريب",
    en: "The Near",
    description_ar:
      "القريب يدل على قرب الله من عباده وقربه لسماع دعواتهم، فهو قريب يجيب الدعاء.",
    description_en:
      "Al-Qarib signifies Allah's closeness to His servants and His proximity in hearing their supplications. He is near and answers prayers.",
  },
  "Al-Qawiyy": {
    ar: "القوي",
    en: "The Strong",
    description_ar:
      "القوي يصف قوة الله وسلطته التي لا تضاهى، فهو القوي العزيز.",
    description_en:
      "Al-Qawiyy describes Allah's unmatched strength and authority. He is strong and mighty.",
  },
  "Al-Qahhar": {
    ar: "القهار",
    en: "The All-Subduer",
    description_ar:
      "القهار يدل على أن الله يفرض إرادته على كل شيء دون استثناء، فهو القاهر فوق عباده.",
    description_en:
      "Al-Qahhar signifies that Allah imposes His will over everything without exception. He is the subduer over His servants.",
  },
  "Al-Kabir": {
    ar: "الكبير",
    en: "The Great",
    description_ar:
      "الكبير يدل على عظمة الله ومكانته الرفيعة، فهو الكبير الذي لا يحده شيء.",
    description_en:
      "Al-Kabir signifies Allah's greatness and lofty status. He is the great one beyond all limits.",
  },
  "Al-Karim": {
    ar: "الكريم",
    en: "The Generous",
    description_ar:
      "الكريم يشير إلى كرم الله وسخائه في إعطاء النعم لعباده، فهو الكريم الذي لا ينفد عطاؤه.",
    description_en:
      "Al-Karim indicates Allah's generosity and His giving of blessings to His servants. He is generous beyond measure.",
  },
  "Al-Latif": {
    ar: "اللطيف",
    en: "The Gentle",
    description_ar:
      "اللطيف يدل على رقة الله وتعاطفه مع خلقه، فهو اللطيف الخبير.",
    description_en:
      "Al-Latif signifies Allah's gentleness and compassion towards His creation. He is gentle and all-aware.",
  },
  "Al-Mu’min": {
    ar: "المؤمن",
    en: "The Guardian of Faith",
    description_ar:
      "المؤمن يصف الله بأنه يمنح الأمن والطمأنينة للمؤمنين، ويحفظهم من الفتن.",
    description_en:
      "Al-Mu’min describes Allah as the one who grants security and peace to the believers. He protects them from trials.",
  },
  "Al-Muta’ali": {
    ar: "المتعالي",
    en: "The Self Exalted",
    description_ar:
      "المتعالي يدل على علو مكانة الله وسماوته عن كل نقص، فهو المتعالي عن كل شيء.",
    description_en:
      "Al-Muta’ali signifies Allah's exalted status and His transcendence above all imperfections. He is exalted over all.",
  },
  "Al-Mutakabbir": {
    ar: "المتكبر",
    en: "The Majestic",
    description_ar:
      "المتكبر يصف عظمة الله وجلاله الذي لا يضاهى، فهو المتكبر الذي لا يتكبر.",
    description_en:
      "Al-Mutakabbir describes Allah's majesty and glory that is unmatched. He is majestic and does not act arrogantly.",
  },
  "Al-Matin": {
    ar: "المتين",
    en: "The Firm One",
    description_ar:
      "المتين يدل على ثبات الله وصلابته في تدبير الأمور، فهو المتين القوي.",
    description_en:
      "Al-Matin signifies Allah's firmness and steadfastness in managing affairs. He is firm and strong.",
  },
  "Al-Mujib": {
    ar: "المجيب",
    en: "The Responsive",
    description_ar:
      "المجيب يشير إلى استجابة الله لدعاء عباده، فهو يجيب المضطر إذا دعاه.",
    description_en:
      "Al-Mujib indicates Allah's responsiveness to His servants' prayers. He answers the call of the distressed when they supplicate.",
  },
  "Al-Majid": {
    ar: "المجيد",
    en: "The Glorious",
    description_ar:
      "المجيد يصف مجد الله وعظمتة في كل شيء، فهو المجيد الذي لا يشبهه أحد.",
    description_en:
      "Al-Majid describes Allah's glory and magnificence in everything. He is glorious and unlike any other.",
  },
  "Al-Muhit": {
    ar: "المحيط",
    en: "The All-Embracing",
    description_ar:
      "المحيط يدل على أن علم الله وحكمته تشمل كل شيء، فهو المحيط بكل شيء.",
    description_en:
      "Al-Muhit signifies that Allah's knowledge and wisdom encompass everything. He surrounds all things with His knowledge.",
  },
  "Al-Musawwir": {
    ar: "المصور",
    en: "The Fashioner",
    description_ar:
      "المصور يصف الله كمن يصور خلقه بأحسن صورة، فهو الذي يصور كل شيء.",
    description_en:
      "Al-Musawwir describes Allah as the one who shapes His creation in the best form. He is the fashioner of all things.",
  },
  "Al-Muqtadir": {
    ar: "المقتدر",
    en: "The Creator of Power",
    description_ar:
      "المقتدر يدل على أن الله هو الذي يملك القدرة المطلقة على كل شيء، فهو المقتدر على كل شيء.",
    description_en:
      "Al-Muqtadir signifies that Allah possesses absolute power over everything. He is capable of all things.",
  },
  "Al-Muqit": {
    ar: "المقيت",
    en: "The Sustainer",
    description_ar:
      "المقيت يشير إلى أن الله هو الذي يرزق ويقوي عباده، فهو المقيت الذي يعطي القوت.",
    description_en:
      "Al-Muqit indicates that Allah is the one who provides sustenance and strengthens His servants. He gives nourishment.",
  },
  "Al-Malek": {
    ar: "الملك",
    en: "The King",
    description_ar:
      "الملك يدل على سلطان الله وحكمه على الملكوت، فهو الملك الذي لا يزول ملكه.",
    description_en:
      "Al-Malek signifies Allah's sovereignty and rule over the universe. He is the king whose dominion never ends.",
  },
  "Al-Malik": {
    ar: "المليك",
    en: "The Sovereign Lord",
    description_ar:
      "المليك يصف الله بأنه المالك الحقيقي لكل شيء، فهو مالك الملك الذي لا ينازعه أحد.",
    description_en:
      "Al-Malik describes Allah as the true owner of everything. He is the sovereign who owns all sovereignty.",
  },
  "Al-Mawla": {
    ar: "المولى",
    en: "The Master",
    description_ar:
      "المولى يدل على أن الله هو المولي والحامي لعباده، فهو الذي يتولى أمورهم.",
    description_en:
      "Al-Mawla signifies that Allah is the protector and guardian of His servants. He is the master who takes care of them.",
  },
  "Al-Muhaymin": {
    ar: "المهيمن",
    en: "The Protector",
    description_ar:
      "المهيمن يصف الله كمن يحفظ ويرعى خلقه، فهو المهيمن على كل شيء.",
    description_en:
      "Al-Muhaymin describes Allah as the one who preserves and watches over His creation. He is the guardian over everything.",
  },
  "An-Nasir": {
    ar: "النصير",
    en: "The Helper",
    description_ar:
      "النصير يدل على أن الله هو المنصر لعباده في الشدائد، فهو النصير الذي ينصر المؤمنين.",
    description_en:
      "An-Nasir signifies that Allah is the supporter of His servants in times of adversity. He aids the believers.",
  },
  "Al-Wahid": {
    ar: "الواحد",
    en: "The One",
    description_ar: "الواحد يؤكد توحيد الله وأنه لا شريك له، فهو الواحد الأحد.",
    description_en:
      "Al-Wahid affirms the oneness of Allah and that He has no partners. He is the one and only.",
  },
  "Al-Warith": {
    ar: "الوارث",
    en: "The Inheritor",
    description_ar:
      "الوارث يدل على أن الله هو الوريث لكل شيء بعد انتهاء الخلق، فهو الباقي بعد فناء كل شيء.",
    description_en:
      "Al-Warith signifies that Allah is the inheritor of everything after the end of creation. He remains when all else perishes.",
  },
  "Al-Wasi’": {
    ar: "الواسع",
    en: "The All-Encompassing",
    description_ar:
      "الواسع يصف علم الله وفضله الواسع الذي يشمل كل شيء، فهو الواسع الرحمة.",
    description_en:
      "Al-Wasi’ describes Allah's vast knowledge and grace that encompasses everything. He is vast in mercy.",
  },
  "Al-Wadud": {
    ar: "الودود",
    en: "The Most Loving",
    description_ar:
      "الودود يدل على محبة الله لعباده ورعايته لهم، فهو الودود الرحيم.",
    description_en:
      "Al-Wadud signifies Allah's love and care for His servants. He is the most loving and compassionate.",
  },
  "Al-Wakil": {
    ar: "الوكيل",
    en: "The Trustee",
    description_ar:
      "الوكيل يصف الله كمن يتكل عليه خلقه ويدبر أمورهم، فهو الوكيل الكافي.",
    description_en:
      "Al-Wakil describes Allah as the trustee whom His creation relies upon. He is sufficient for managing their affairs.",
  },
  "Al-Waliyy": {
    ar: "الولي",
    en: "The Protecting Friend",
    description_ar:
      "الولي يدل على أن الله هو الولي والحامي لعباده، فهو الولي المؤمنين.",
    description_en:
      "Al-Waliyy signifies that Allah is the guardian and protector of His servants. He is the ally of the believers.",
  },
  "Al-Wahhab": {
    ar: "الوهاب",
    en: "The Giver of Gifts",
    description_ar:
      "الوهاب يشير إلى سخاء الله في منح النعم والهبات لعباده، فهو الوهاب الذي لا ينفد عطاؤه.",
    description_en:
      "Al-Wahhab indicates Allah's generosity in granting blessings and gifts to His servants. He is the giver whose bounties never end.",
  },
  "Al-Jamil": {
    ar: "الجميل",
    en: "The Beautiful",
    description_ar:
      "الجميل يصف جمال الله وروعة خلقه، فهو الجميل الذي تجلت أسماؤه وصفاته.",
    description_en:
      "Al-Jamil describes the beauty of Allah and the splendor of His creation. His names and attributes are manifested beautifully.",
  },
  "Al-Jawad": {
    ar: "الجواد",
    en: "The Generous",
    description_ar:
      "الجواد يدل على كرم الله وسخائه في منح النعم، فهو الجواد الذي يعطي بغير حساب.",
    description_en:
      "Al-Jawad signifies Allah's generosity and bounty in granting blessings. He gives without reckoning.",
  },
  "Al-Hakam": {
    ar: "الحكم",
    en: "The Judge",
    description_ar:
      "الحكم يصف الله كالحاكم العادل الذي يحكم بالحق، فهو الحكم الذي لا ظلم عنده.",
    description_en:
      "Al-Hakam describes Allah as the just judge who rules with truth. There is no injustice in His judgment.",
  },
  "Al-Hayyi": {
    ar: "الحيي",
    en: "The Modest",
    description_ar:
      "الحيي يدل على تواضع الله ورحمته لعباده، فهو الحيي الذي يستحي أن يرد دعاء عباده.",
    description_en:
      "Al-Hayyi signifies Allah's humility and mercy towards His servants. He is shy to turn away the prayers of His servants.",
  },
  "Ar-Rabb": {
    ar: "الرب",
    en: "The Lord",
    description_ar:
      "الرب يشير إلى أن الله هو رب كل شيء ومدبر أمور الخلق، فهو الرب العظيم.",
    description_en:
      "Ar-Rabb indicates that Allah is the Lord of everything and the manager of creation's affairs. He is the great Lord.",
  },
  "Ar-Rafiq": {
    ar: "الرفيق",
    en: "The Gentle",
    description_ar:
      "الرفيق يدل على لطف الله ورفقه بعباده، فهو الرفيق الذي لا يعجل بالعقوبة.",
    description_en:
      "Ar-Rafiq signifies Allah's kindness and gentleness towards His servants. He is gentle and does not hasten to punish.",
  },
  "As-Subooh": {
    ar: "السبوح",
    en: "The All-Pure",
    description_ar:
      "السبوح يصف نقاء الله وطهارته من كل عيب، فهو المنزه عن العيوب.",
    description_en:
      "As-Subooh describes Allah's purity and freedom from any defect. He is free from all imperfections.",
  },
  "As-Sayyid": {
    ar: "السيد",
    en: "The Master",
    description_ar:
      "السيد يدل على أن الله هو السيد والمالك لكل شيء، فهو السيد العظيم.",
    description_en:
      "As-Sayyid signifies that Allah is the master and owner of everything. He is the great master.",
  },
  "Ash-Shafi": {
    ar: "الشافي",
    en: "The Healer",
    description_ar:
      "الشافي يصف الله كمن يشفي مرضاهم ويعافيهم، فهو الشافي الذي بيده الشفاء.",
    description_en:
      "Ash-Shafi describes Allah as the one who heals the sick and cures them. He is the healer, and healing is in His hands.",
  },
  "At-Tayyib": {
    ar: "الطيب",
    en: "The Pure",
    description_ar:
      "الطيب يدل على طهارة الله وصفاءه من كل فساد، فهو الطيب في أسمائه وصفاته.",
    description_en:
      "At-Tayyib signifies Allah's purity and cleanliness from all corruption. He is pure in His names and attributes.",
  },
  "Al-Qabid": {
    ar: "القابض",
    en: "The Withholder",
    description_ar:
      "القابض يشير إلى أن الله يقبض بعض النعم ويمنح أخرى لعباده، فهو القابض الباسط.",
    description_en:
      "Al-Qabid indicates that Allah withholds some blessings and grants others to His servants. He is the withholder and expander.",
  },
  "Al-Basit": {
    ar: "الباسط",
    en: "The Extender",
    description_ar:
      "الباسط يدل على أن الله يوسع النعم ويفتح أبواب الرزق لعباده، فهو الباسط بيده الخير.",
    description_en:
      "Al-Basit signifies that Allah expands blessings and opens doors of sustenance for His servants. He extends goodness with His hands.",
  },
  "Al-Muqaddim": {
    ar: "المقدم",
    en: "The Expediter",
    description_ar:
      "المقدم يشير إلى أن الله يقدم بعض الأمور ويؤخر غيرها بحكمة، فهو المقدم والمؤخر.",
    description_en:
      "Al-Muqaddim indicates that Allah advances some matters and delays others with wisdom. He is the expediter and delayer.",
  },
  "Al-Mu’akhkhir": {
    ar: "المؤخر",
    en: "The Delayer",
    description_ar:
      "المؤخر يدل على أن الله يؤخر بعض الأمور ويقدم غيرها حسب حكمته، فهو المؤخر الحكيم.",
    description_en:
      "Al-Mu’akhkhir signifies that Allah delays some matters and advances others according to His wisdom. He is wise in His timing.",
  },
  "Al-Muhsin": {
    ar: "المحسن",
    en: "The Benefactor",
    description_ar:
      "المحسن يصف الله كمن يحسن إلى خلقه ويعطيهم الخير، فهو المحسن العظيم.",
    description_en:
      "Al-Muhsin describes Allah as the benefactor who does good to His creation and grants them goodness. He is the great benefactor.",
  },
  "Al-Mu'ti": {
    ar: "المعطي",
    en: "The Giver",
    description_ar:
      "المعطي يدل على أن الله هو الذي يعطي النعم والبركات لعباده، فهو المعطي الكريم.",
    description_en:
      "Al-Mu'ti signifies that Allah is the giver of blessings and bounties to His servants. He is the generous giver.",
  },
  "Al-Mannan": {
    ar: "المنان",
    en: "The Bestower",
    description_ar:
      "المنان يصف الله كمن يمنح النعم دون حساب أو مقابل، فهو المنان العظيم.",
    description_en:
      "Al-Mannan describes Allah as the bestower who grants blessings without reckoning or return. He is the great bestower.",
  },
  "Al-Witr": {
    ar: "الوتر",
    en: "The One",
    description_ar:
      "الوتر يشير إلى أن الله هو الوحيد الذي لا شريك له، فهو الوتر الفرد الصمد.",
    description_en:
      "Al-Witr indicates that Allah is the only one without any partners. He is the unique and eternal one.",
  },
  "As-Sitteer": {
    ar: "الستير",
    en: "The Concealer",
    description_ar:
      "الستير: الذي يستر عيوب عباده ولا يفضحهم، ويحب الستر والحياء، ويدعو عباده إلى الستر على أنفسهم وعلى غيرهم.",
    description_en:
      "As-Sitteer: The One who conceals the faults of His servants and does not expose them. He loves modesty and concealment.",
  },
};

const Names = () => {
  const { language } = useTranslation();

  const [namesData, setNamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isErrorFetching, setIsErrorFetching] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا "
          : "Something happend , w'll fix it soon",
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching, language]);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const data = Object.entries(namesOfAllah).map(([key, value]) => ({
          key,
          ...value,
        }));
        setNamesData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching names:", error);
        setLoading(false);
        setIsErrorFetching(true);
      }
    };
    fetchNames();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return namesData;

    return namesData.filter((item) => {
      const ar = (item.ar || "").toLowerCase();
      const en = (item.en || "").toLowerCase();
      const key = (item.key || "").toLowerCase();
      return ar.includes(q) || en.includes(q) || key.includes(q);
    });
  }, [namesData, query]);

  const openDetails = (item) => {
    setSelected(item);
    setOpen(true);
  };

  const title = selected ? (language === "ar" ? selected.ar : selected.en) : "";
  const subtitle = selected
    ? language === "ar"
      ? selected.en
      : selected.ar
    : "";
  const description = selected
    ? language === "ar"
      ? selected.description_ar
      : selected.description_en
    : "";

  return (
    <div className="names-page" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="names-topbar">
        <div className="names-head">
          <Typography level="h3" className="names-title">
            {language === "ar" ? "أسماء الله الحسنى" : "Names of Allah"}
          </Typography>
          <Typography level="body-sm" className="names-subtitle">
            {language === "ar"
              ? "اضغط على الاسم لعرض الشرح"
              : "Click a name to see details"}
          </Typography>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === "ar" ? "ابحث..." : "Search..."}
          startDecorator={<SearchRoundedIcon />}
          className="names-search"
          variant="soft"
          size="md"
          sx={{
            bgcolor: "var(--card-color)",
            color: "var(--text-color)",
            border: "1px solid",
            borderColor: "var(--text-color)20",
          }}
        />
      </div>

      {loading ? (
        <div className="w-100 text-center loader-manager mt-5">
          <CircularProgress />
        </div>
      ) : filtered.length > 0 ? (
        <div className="names-container">
          {filtered.map((item, index) => (
            <Card
              key={item.key}
              variant="outlined"
              className="name-card"
              onClick={() => openDetails(item)}
              sx={{
                bgcolor: "var(--card-color)",
                color: "var(--text-color)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <div className="index-badge">{index + 1}</div>

                {/* ✅ show name based on language, not always Arabic */}
                <div className="name">
                  {language === "ar" ? item.ar : item.en}
                </div>

                {/* ✅ show the other language under it */}
                <div className="meaning">
                  {language === "ar" ? item.en : item.ar}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Typography level="h4">
            {language === "ar" ? "لا توجد نتائج" : "No results"}
          </Typography>
        </div>
      )}

      {/* Modal */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          className="name-modal sheet-surface"
          sx={{
            maxWidth: 560,
            width: "92vw",
            borderRadius: "16px",
            p: 3,
            boxShadow: "lg",
            backgroundColor: "var(--card-color)",
            direction: language === "ar" ? "rtl" : "ltr",
          }}
        >
          <ModalClose
            variant="plain"
            sx={{
              position: "absolute",
              top: 18,

              // 👇 force side based on language
              right: language === "en" ? 8 : "auto",
              left: language === "ar" ? 8 : "auto",

              color: "var(--text-color)",
            }}
          />

          <Stack spacing={1}>
            <Typography
              component="h2"
              id="modal-title"
              level="h3"
              sx={{ fontWeight: "xl", color: "var(--text-color)" }}
            >
              {title}
            </Typography>

            <Typography
              level="body-sm"
              sx={{ opacity: 0.85, color: "var(--text-color)" }}
            >
              {subtitle}
            </Typography>

            <Divider />

            <Typography id="modal-desc" sx={{ color: "var(--text-color)" }}>
              {description}
            </Typography>

            {selected?.source_url ? (
              <>
                <Divider />
                <Typography
                  level="body-sm"
                  sx={{ color: "var(--text-color)", opacity: 0.9 }}
                >
                  {language === "ar" ? "المصدر:" : "Source:"}{" "}
                  <a
                    className="source-link"
                    href={selected.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selected.source_url}
                  </a>
                </Typography>
              </>
            ) : null}
          </Stack>
        </Sheet>
      </Modal>
    </div>
  );
};

export default Names;
