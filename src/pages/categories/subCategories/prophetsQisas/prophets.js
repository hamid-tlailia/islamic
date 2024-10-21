import React, { useEffect, useRef, useState } from "react";
import "./prophets.css";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import { useTranslation } from "../../../../components/languages/provider";
import Modal from "@mui/material/Modal";
import stories from "./stories.json"; // Import stories.json
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CircularProgress from "@mui/joy/CircularProgress";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import ReactPlayer from "react-player";

const Prophets = ({ scrollUp }) => {
  const { language } = useTranslation();
  const [selectedStory, setSelectedStory] = useState(null); // Track the selected story
  const [showModal, setShowModal] = useState(false); // Track modal visibility
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const content = useRef(null);

  const suggests = useRef(null);

  // Handle story click
  const handleStoryClick = (e, story, index) => {
    setSelectedCardIndex(index);
    setSelectedStory(story);
    if (content.current) {
      content.current.scrollIntoView({ top: 0, behavior: "smooth" }); // Scroll to top when story is clicked
    }
    scrollUp();
    // Save selected story to localStorage
    localStorage.setItem("selectedStory", JSON.stringify(story));
    localStorage.setItem("selectedCardIndex", index);
  };

  // Handle modal open/close
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // On component mount, load the saved story from localStorage
  useEffect(() => {
    const savedStory = localStorage.getItem("selectedStory");
    const savedIndex = localStorage.getItem("selectedCardIndex");
    if (savedStory && savedIndex !== null) {
      const story = JSON.parse(savedStory);
      setSelectedStory(story);
      setSelectedCardIndex(parseInt(savedIndex));
    } else {
      // No saved story, state remains empty
      setSelectedStory(null);
      setSelectedCardIndex(null);
    }
  }, []);

  const breadcrumbs = [
    <NavLink
      underline="hover"
      className="text-primary border-primary border-bottom"
      key="2"
      color="inherit"
      onClick={handleClick}
    >
      {selectedStory && language === "ar" ? " القصص" : "Stories"}
    </NavLink>,
    <Typography key="3" sx={{ color: "var(--text-color)" }}>
      {selectedStory && language === "ar"
        ? selectedStory?.name.ar
        : selectedStory?.name.en}
    </Typography>,
  ];

  function handleClick(event) {
    event.preventDefault();
    if (suggests.current) {
      suggests.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="single_story" ref={content}>
      {/* Display content for the selected story */}
      {selectedStory && (
        <div className="single_story_container">
          <div className="context">
            <div className="d-flex flex-column-reverse flex-lg-row flex-md-row gap-3 justify-content-between align-items-center w-100">
              <h2 className="title">
                {language === "ar"
                  ? selectedStory.name.ar
                  : selectedStory.name.en}
              </h2>
              <Stack spacing={2} className="ltr">
                <Breadcrumbs
                  separator={
                    <NavigateNextIcon color="primary" fontSize="small" />
                  }
                  aria-label="breadcrumb"
                >
                  {breadcrumbs}
                </Breadcrumbs>
              </Stack>
            </div>
            <p className="describe">
              {language === "ar"
                ? selectedStory.story.ar
                : selectedStory.story.en}
            </p>
            <div className="story_video">
              <button
                className="btn btn-outline-info d-flex flex-row justify-content-center align-items-center fs-3 border border-info gap-3"
                onClick={handleOpenModal}
              >
                {language === "ar" ? "مشاهدة القصة" : "Watch the Story"}
                <span>
                  <PlayCircleFilledWhiteOutlinedIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      <hr />
      <h2 className="title_pages flex">
        {selectedStory
          ? language === "ar"
            ? "--' المزيد من القصص '--"
            : "--' More Stories '--"
          : language === "ar"
          ? "--'   قصص الأنبياء '--"
          : "--'  Stories '--"}
      </h2>
      <div className="suggest" ref={suggests}>
        {/* Display stories from the JSON file */}
        {stories.prophets.map((prophet, index) => (
          <div
            key={index}
            className={`story-item card rounded-1 ${
              selectedCardIndex === index ? "selected" : ""
            }`}
            onClick={(e) => handleStoryClick(e, prophet, index)} // Update selected story on click
          >
            <section
              className="item w-100 pe-none"
              title={language === "ar" ? prophet.name.ar : prophet.name.en}
            >
              <div className="w-100">
                <img
                  loading="lazy"
                  className="story-img img-fluid rounded-3"
                  src={prophet.image}
                  alt="storyLogo"
                  style={{
                    opacity: selectedCardIndex === index ? 0.5 : 1,
                  }}
                />
                <hr />
              </div>
              <h2 className="title">
                {language === "ar" ? prophet.name.ar : prophet.name.en}
              </h2>
            </section>
          </div>
        ))}
      </div>

      {/* Modal for video playback */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        className="modal-fullscreen bg-dark"
        sx={{
          backgroundColor: "var(--card-color)",
          color: "var(--text-color)",
        }}
      >
        <div className="modal-content-fullscreen">
          <div className="modal-header">
            <button onClick={handleCloseModal} className="close-btn">
              <CloseOutlinedIcon />
            </button>
            <h2 className="modal-title">
              <span>
                {language === "ar"
                  ? selectedStory?.name.ar
                  : selectedStory?.name.en}
              </span>
            </h2>
          </div>
          <div className="modal-body">
            {/* Video Content */}
            <div
              style={{ position: "relative", width: "100%", height: "600px" }}
            >
              {/* ReactPlayer */}
              <ReactPlayer
                url={selectedStory?.video}
                width="100%"
                height="600px"
                playing
                controls
                onReady={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{
                  opacity: loading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />

              {/* Loader (CircularProgress) */}
              {loading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <CircularProgress />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Prophets;
