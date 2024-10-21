import React, { useState, useEffect } from "react";
import "./adhkar.css";
import { useTranslation } from "../../../../components/languages/provider";
import { Tabs, Tab, TabList, TabPanel } from "@mui/joy";
import Card from "@mui/joy/Card";
import CircularProgress from "@mui/joy/CircularProgress";
import adhkarData from "./adhkar.json"; // Importing the adhkar data

const Adhkar = () => {
  const { language } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const fetchData = () => {
      setLoading(false);
    };
    fetchData();
  }, []);

  const getTitleByLanguage = (index) => {
    return adhkarData?.adhkars[index]?.title[language];
  };

  const getContentByLanguage = (index) => {
    return adhkarData.adhkars[index]?.content.map((item) => ({
      zekr: item.zekr[language],
      repeat: item.repeat,
      bless: item.bless[language],
    }));
  };

  return (
    <div>
      <Tabs
        aria-label="Adhkar Tabs"
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
        sx={{
          bgcolor: "var(--card-color)",
          color: "var(--text-color)",
          marginBottom: 2,
        }}
      >
        <TabList
          className="w-100 d-flex flex-row justify-content-between align-items-center p-0 gap-0 card "
          sx={{
            bgcolor: "var(--card-color)",
            color: "var(--text-color)",
            marginBottom: 2,
          }}
        >
          <Tab
            value={0}
            sx={{
              color: tabIndex === 0 ? "purple" : "var(--text-color)",
              padding: "10px",
              width: "calc(100%/3)",
            }}
            className="tabs"
          >
            {getTitleByLanguage(0)}
          </Tab>
          <Tab
            value={1}
            sx={{
              color: tabIndex === 1 ? "purple" : "var(--text-color)",
              padding: "10px",
              width: "calc(100%/3)",
            }}
            className="tabs"
          >
            {getTitleByLanguage(1)}
          </Tab>
          <Tab
            value={2}
            sx={{
              color: tabIndex === 2 ? "purple" : "var(--text-color)",
              padding: "10px",
              width: "calc(100%/3)",
            }}
            className="tabs"
          >
            {getTitleByLanguage(2)}
          </Tab>
        </TabList>

        <TabPanel value={0}>
          {/* Display Morning Adhkar */}
          {!loading ? (
            getContentByLanguage(0)?.map((item, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  bgcolor: "var(--card-color)",
                  color: "var(--text-color)",
                  marginBottom: 2,
                }}
              >
                <div>
                  {item.bless && (
                    <p className="text-success mb-2 p-2 border-bottom">
                      {item.bless}
                    </p>
                  )}
                  <p>{item.zekr}</p>
                  {item.repeat && (
                    <p className="badge bg-primary text-light">{`التكرار: ${item.repeat}`}</p>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="w-100 text-center loader-manager mt-5">
              <CircularProgress />
            </div>
          )}
        </TabPanel>

        <TabPanel value={1}>
          {/* Display Evening Adhkar */}
          {!loading ? (
            getContentByLanguage(1)?.map((item, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  bgcolor: "var(--card-color)",
                  color: "var(--text-color)",
                  marginBottom: 2,
                }}
              >
                <div>
                  {item.bless && (
                    <p className="text-success mb-2 p-2 border-bottom">
                      {item.bless}
                    </p>
                  )}
                  <p>{item.zekr}</p>
                  {item.repeat && (
                    <p className="badge bg-primary text-light">{`التكرار: ${item.repeat}`}</p>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="w-100 text-center loader-manager mt-5">
              <CircularProgress />
            </div>
          )}
        </TabPanel>

        <TabPanel value={2}>
          {/* Display Post-Prayer Adhkar */}
          {!loading ? (
            getContentByLanguage(2)?.map((item, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  bgcolor: "var(--card-color)",
                  color: "var(--text-color)",
                  marginBottom: 2,
                }}
              >
                <div>
                  {item.bless && (
                    <p className="text-success mb-2 p-2 border-bottom">
                      {item.bless}
                    </p>
                  )}
                  <p>{item.zekr}</p>
                  {item.repeat && (
                    <p className="badge bg-primary text-light">{`التكرار: ${item.repeat}`}</p>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="w-100 text-center loader-manager mt-5">
              <CircularProgress />
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Adhkar;
