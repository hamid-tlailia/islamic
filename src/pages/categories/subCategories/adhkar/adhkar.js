import React, { useEffect, useMemo, useState } from "react";
import "./adhkar.css";
import { useTranslation } from "../../../../components/languages/provider";

import {
  Tabs,
  Tab,
  TabList,
  TabPanel,
  Card,
  Chip,
  Typography,
  Box,
  Skeleton,
} from "@mui/joy";

import adhkarData from "./json/adhkar.json";

const Adhkar = () => {
  const { language } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // keep your loading simulation
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const dir = language === "ar" ? "rtl" : "ltr";

  const getTitleByLanguage = (index) =>
    adhkarData?.adhkars?.[index]?.title?.[language] || "—";

  const getContentByLanguage = (index) =>
    (adhkarData?.adhkars?.[index]?.content || []).map((item) => ({
      zekr: item?.zekr?.[language] || "",
      repeat: item?.repeat || "",
      bless: item?.bless?.[language] || "",
    }));

  const tabs = useMemo(
    () => [
      { id: 0, title: getTitleByLanguage(0) },
      { id: 1, title: getTitleByLanguage(1) },
      { id: 2, title: getTitleByLanguage(2) },
    ],
    // eslint-disable-next-line
    [language]
  );

  const renderPanel = (panelIndex) => {
    if (loading) {
      return (
        <Box className="adhkarList">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="adhkarCard" variant="outlined">
              <Skeleton variant="text" level="title-md" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Skeleton variant="rectangular" width={90} height={28} />
                <Skeleton variant="rectangular" width={120} height={28} />
              </Box>
            </Card>
          ))}
        </Box>
      );
    }

    const list = getContentByLanguage(panelIndex);

    return (
      <Box className="adhkarList">
        {list.map((item, index) => (
          <Card key={index} className="adhkarCard" variant="outlined">
            {item.bless ? (
              <Box className="adhkarBless">
                <Typography level="body-sm" className="adhkarBlessText">
                  {item.bless}
                </Typography>
              </Box>
            ) : null}

            <Typography level="body-lg" className="adhkarText">
              {item.zekr}
            </Typography>

            <Box className="adhkarFooter">
              {item.repeat ? (
                <Chip className="repeatChip" variant="soft" size="sm">
                  {language === "ar" ? "التكرار" : "Repeat"}: {item.repeat}
                </Chip>
              ) : (
                <span />
              )}

              <Chip className="typeChip" variant="soft" size="sm">
                {tabs[panelIndex]?.title || ""}
              </Chip>
            </Box>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box className="adhkarPage" dir={dir}>
      <Box className="adhkarHeader">
        <Typography level="h4" className="adhkarTitle">
          {language === "ar" ? "الأذكار" : "Adhkar"}
        </Typography>
        <Typography level="body-sm" className="adhkarSubtitle">
          {language === "ar"
            ? "اختر القسم ثم اقرأ الأذكار بسهولة"
            : "Pick a section and read comfortably"}
        </Typography>
      </Box>

      <Tabs
        aria-label="Adhkar Tabs"
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
        className="adhkarTabsRoot"
      >
        <TabList className="adhkarTabList">
          {tabs.map((t) => (
            <Tab key={t.id} value={t.id} className="adhkarTab">
              {t.title}
            </Tab>
          ))}
        </TabList>

        <TabPanel value={0} className="adhkarPanel">
          {renderPanel(0)}
        </TabPanel>

        <TabPanel value={1} className="adhkarPanel">
          {renderPanel(1)}
        </TabPanel>

        <TabPanel value={2} className="adhkarPanel">
          {renderPanel(2)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};

export default Adhkar;
