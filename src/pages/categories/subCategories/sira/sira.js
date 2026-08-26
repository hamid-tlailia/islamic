import { getJSON, TTL } from "../../../../lib/apiClient";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReactPlayer from "react-player";
import "./sira.css";
import {
  PictureAsPdf,
  Audiotrack,
  Link as LinkIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useTranslation } from "../../../../components/languages/provider";
import { toast } from "react-toastify";

const Sira = ({ src, audioName }) => {
  const [categoryItems, setCategoryItems] = useState([]); // State for category items
  const [selectedItem, setSelectedItem] = useState(null); // Item selected for modal
  const [loading, setLoading] = useState(false); // Loader state
  const [isAudioLoading, setIsAudioLoading] = useState(false); // Track MP3 loading state
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null); // Store current audio source
  const [errorFetching, setErrorFetching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Modal open state
  const audioRef = useRef(null); // Ref for the hidden audio element
  const { language } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Start loader
      try {
        const data = await getJSON(`https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-category-items/795/showall/${language}/${language}/1/25/json`, { ttl: TTL.LONG });
        if (data.data.length > 0) {
          setCategoryItems(data.data);
        }
      } catch (error) {
        setErrorFetching(true);
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    fetchCategories();
  }, [language]);

  useEffect(() => {
    if (errorFetching) {
      toast.error(
        language === "ar"
          ? "خطأ في الاتصال يرجى المحاولة لاحقا"
          : "Error occurred, please try later"
      );
    }
    return () => {
      setErrorFetching(false);
    };
    // eslint-disable-next-line
  }, [errorFetching]);

  const pageName = "السيرة النبوية";
  const handleListenClick = (audioSrc) => {
    const audio = audioRef.current;
    src(audioSrc);
    if (audio.src !== audioSrc) {
      setIsAudioLoading(true);
      setCurrentAudioSrc(audioSrc);

      audio.src = audioSrc;
      audio.load();

      audio.onloadeddata = () => {
        setIsAudioLoading(false);
        src(audioSrc);
        audioName(pageName);
      };

      audio.onerror = () => {
        setIsAudioLoading(false);
        // Reset currentAudioSrc since there was an error
        setCurrentAudioSrc(null);
      };
    } else {
      // If the same audio is clicked again, you can choose to pause or restart the audio
      // For now, we'll just keep it playing
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
    // Stop any playing audio when modal is closed
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentAudioSrc(null);
  };

  return (
    <div className="container-fluid sira-component">
      <audio ref={audioRef} style={{ display: "none" }} />{" "}
      {/* Hidden audio element */}
      {loading ? (
        <div className="w-100 text-center">
          <CircularProgress />
        </div>
      ) : categoryItems.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {categoryItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                m: 1,
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)", cursor: "pointer" },
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                border: "1px solid white",
              }}
              onClick={() => handleCardClick(item)}
            >
              <CardContent>
                <Typography variant="h5" className="text-coral">
                  {item.title || "No Title"}
                </Typography>
                {item.description && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography>
          {language === "ar" ? "لم يتم العثور على العناصر." : "No items found."}
        </Typography>
      )}
      {/* Modal for Attachments */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box className="sheet-surface"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            bgcolor: "background.paper",
            boxShadow: 24,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            overflow: "hidden",
            border: "1px solid white",
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--card-color)",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid white",
            }}
          >
            <Typography variant="h5">
              {selectedItem?.title || "No Title"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon className="text-danger" />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
            }}
          >
            {selectedItem?.full_description && (
              <Typography
                variant="body1"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedItem.full_description),
                }}
                sx={{ mb: 2, p: 2 }}
              />
            )}

            {selectedItem?.attachments &&
            selectedItem.attachments.length > 0 ? (
              selectedItem.attachments.map((file, idx) => (
                <Box key={idx} sx={{ mt: 2 }}>
                  {file.extension_type.toUpperCase() === "PDF" && (
                    <Card
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        mb: 2,
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                      }}
                    >
                      <Box className="file" sx={{ width: "100%" }}>
                        <Typography variant="h6" sx={{ color: "green" }}>
                          {file.description || "Download PDF"}{" "}
                          <span className="text-primary ms-2">
                            ({file.size})
                          </span>
                        </Typography>
                        <Button
                          variant="outlined"
                          className="mt-2"
                          startIcon={
                            <PictureAsPdf className="ms-3" color="error" />
                          }
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          {language === "ar" ? "تحميل PDF" : "Download PDF"}
                        </Button>
                      </Box>
                    </Card>
                  )}
                  {file.extension_type.toUpperCase() === "MP3" && (
                    <Card
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                      }}
                    >
                      <Box className="file" sx={{ width: "100%" }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {file.description
                            ? file.description
                            : language === "ar"
                            ? "ملف صوتي"
                            : "Audio file"}
                        </Typography>
                        {isAudioLoading && currentAudioSrc === file.url ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={
                              <Audiotrack
                                className="ms-3 pe-none"
                                color="primary"
                              />
                            }
                            onClick={() => handleListenClick(file.url)}
                            id={`audioMP3_${idx}`}
                            style={{
                              color:
                                currentAudioSrc === file.url
                                  ? "red"
                                  : undefined,
                            }}
                          >
                            <Typography className="pe-none">
                              {currentAudioSrc === file.url
                                ? language === "ar"
                                  ? "جاري التشغيل"
                                  : "Playing now"
                                : language === "ar"
                                ? "استمع"
                                : "Listen"}
                            </Typography>
                          </Button>
                        )}
                      </Box>
                    </Card>
                  )}
                  {file.extension_type.toUpperCase() === "MP4" && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        {language === "ar" ? "ملف فيديو" : "Video File"}
                      </Typography>
                      <ReactPlayer url={file.url} controls width="100%" />
                    </Box>
                  )}
                  {file.extension_type.toUpperCase() === "LINK" && (
                    <Card
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        mb: 2,
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="h6">
                          {file.description ||
                            (language === "ar" ? "رابط" : "Link")}
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<LinkIcon className="my-3" />}
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          {language === "ar" ? "فتح الرابط" : "Open Link"}
                        </Button>
                      </Box>
                    </Card>
                  )}
                  {(file.extension_type.toUpperCase() === "JPG" ||
                    file.extension_type.toUpperCase() === "JPEG" ||
                    file.extension_type.toUpperCase() === "PNG") && (
                    <Card
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: "var(--card-color)",
                        color: "var(--text-color)",
                      }}
                    >
                      <Box className="file d-flex flex-column gap-2 justify-content-center align-items-center">
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {file.description ||
                            (language === "ar" ? "صورة" : "Image")}
                        </Typography>
                        <img
                          src={file.url}
                          alt={file.description || "Image"}
                          style={{
                            maxWidth: "50%",
                            height: "50%",
                            borderRadius: "5px",
                          }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<ImageIcon className="ms-3 pe-none" />}
                          sx={{ mt: 2 }}
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          {language === "ar"
                            ? "عرض الصورة بالحجم الكامل"
                            : "View Full Image"}
                        </Button>
                      </Box>
                    </Card>
                  )}
                </Box>
              ))
            ) : (
              <Typography>
                {language === "ar"
                  ? "لا توجد مرفقات."
                  : "No attachments available."}
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Sira;
