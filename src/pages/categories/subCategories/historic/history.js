import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Modal,
  Box,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import ReactPlayer from "react-player";
import "./historic.css";
import {
  PictureAsPdf,
  Audiotrack,
  Link as LinkIcon,
  Image as ImageIcon, // Import an icon for images
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useTranslation } from "../../../../components/languages/provider";
import { toast } from "react-toastify";

const History = ({ src, audioName }) => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // Controls modal visibility
  const [modalStack, setModalStack] = useState([]); // Stack to manage modal states
  const [loading, setLoading] = useState(false); // Loader state
  const [categoryItems, setCategoryItems] = useState([]); // State for category items
  const [selectedCategory, setSelectedCategory] = useState(null); // Currently selected category
  const [selectedFullDescription, setSelectedFullDescription] = useState(""); // State for the selected full description
  const [isAudioLoading, setIsAudioLoading] = useState(false); // Track MP3 loading state
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null); // Store current audio source
  const [errorFetching, setErrorFetching] = useState(false);
  const audioRef = useRef(null); // Ref for the hidden audio element
  const { language } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-object-category-tree/${language}/json`
        );
        const data = await response.json();
        if (data.sub_categories && data.sub_categories.length > 0) {
          setCategories(data.sub_categories[7].sub_categories); // Only use subcategories of the eighth main category
        }
      } catch (error) {
        setErrorFetching(true);
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false);
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

  const handleOpenModal = async (category) => {
    // Push the current state onto the modal stack
    setModalStack((prevStack) => [
      ...prevStack,
      { category, isFullDescription: false },
    ]);
    setSelectedCategory(category);
    setSelectedFullDescription(""); // Clear any full description
    setModalOpen(true);

    if (category.has_children && category.sub_categories.length > 0) {
      // Handle nested categories
      setCategoryItems(category.sub_categories);
    } else if (category.category_items) {
      // If no children, fetch category items
      setLoading(true);
      try {
        const response = await fetch(category.category_items);
        const data = await response.json();
        setCategoryItems(data.data || []); // Set the fetched items
      } catch (error) {
        console.error("Error fetching category items", error);
      } finally {
        setLoading(false); // Stop loader
      }
    }
  };

  const handleOpenFullDescription = (fullDescription) => {
    // Push the current state onto the modal stack
    setModalStack((prevStack) => [
      ...prevStack,
      { category: null, isFullDescription: true },
    ]);
    setSelectedFullDescription(fullDescription);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCategoryItems([]); // Clear items when closing the modal
    setModalStack([]); // Clear the modal stack
    setSelectedCategory(null);
    setSelectedFullDescription("");
  };

  const handleBack = () => {
    if (modalStack.length > 1) {
      // Pop the last state from the stack
      setModalStack((prevStack) => prevStack.slice(0, -1));
      const previousState = modalStack[modalStack.length - 2];

      if (previousState.isFullDescription) {
        setSelectedFullDescription(previousState.fullDescription);
        setSelectedCategory(null);
      } else {
        setSelectedCategory(previousState.category);
        setSelectedFullDescription("");
        if (
          previousState.category.has_children &&
          previousState.category.sub_categories.length > 0
        ) {
          setCategoryItems(previousState.category.sub_categories);
        } else if (previousState.category.category_items) {
          // Fetch the previous category items
          setLoading(true);
          fetch(previousState.category.category_items)
            .then((response) => response.json())
            .then((data) => {
              setCategoryItems(data.data || []);
            })
            .catch((error) => {
              console.error("Error fetching category items", error);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    } else {
      handleCloseModal();
    }
  };

  const pageName = "التاريخ الاسلامي";
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

  const ModalContent = () => {
    return (
      <Box sx={{ p: 1 }} className="historic-component">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            p: 1,
            border: "1px solid cyan",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h6">
            {selectedFullDescription
              ? language === "ar"
                ? "الوصف الكامل"
                : "Full Description"
              : selectedCategory?.title}
          </Typography>
          <Box>
            {modalStack.length > 1 ? (
              <IconButton onClick={handleBack}>
                <ArrowBackIcon className="text-success" />
              </IconButton>
            ) : (
              <IconButton onClick={handleCloseModal}>
                <CloseIcon className="text-danger" />
              </IconButton>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : selectedFullDescription ? (
          <Box sx={{ mt: 2, p: 2 }}>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedFullDescription),
              }}
            />
          </Box>
        ) : categoryItems.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {categoryItems.map((item, index) => (
              <Card
                key={index}
                sx={{
                  m: 1,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                  border: "1px solid white",
                  cursor:
                    item.has_children && item.sub_categories.length > 0
                      ? "pointer"
                      : "default",
                }}
                onClick={() => {
                  if (item.has_children && item.sub_categories.length > 0) {
                    handleOpenModal(item);
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "green" }}>
                    {item.title || "No Title"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.description
                      ? item.description
                      : language === "ar"
                      ? "الوصف غير متوفر"
                      : "No description available"}
                  </Typography>

                  {item.full_description && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() =>
                        handleOpenFullDescription(item.full_description)
                      }
                    >
                      {language === "ar"
                        ? "عرض الوصف الكامل"
                        : "View Full Description"}
                    </Button>
                  )}

                  {item.attachments &&
                    item.attachments.map((file, idx) => {
                      const extension = file.extension_type.toUpperCase();
                      return (
                        <Box key={idx} sx={{ mt: 2 }}>
                          {extension === "PDF" && (
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
                              <Box className="file">
                                <Typography
                                  variant="h6"
                                  sx={{ color: "green" }}
                                >
                                  {file.description || "Download PDF"}{" "}
                                  <span className="text-primary ms-2">
                                    ({file.size})
                                  </span>
                                </Typography>
                                <Button
                                  variant="outlined"
                                  className="mt-2"
                                  startIcon={
                                    <PictureAsPdf
                                      className="ms-3"
                                      color="error"
                                    />
                                  }
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  {language === "ar"
                                    ? "تحميل PDF"
                                    : "Download PDF"}
                                </Button>
                              </Box>
                            </Card>
                          )}
                          {extension === "MP3" && (
                            <Card
                              sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: "var(--card-color)",
                                color: "var(--text-color)",
                              }}
                            >
                              <Box className="file">
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {file.description
                                    ? file.description
                                    : language === "ar"
                                    ? "ملف صوتي"
                                    : "Audio file"}
                                </Typography>
                                {isAudioLoading &&
                                currentAudioSrc === file.url ? (
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
                          {extension === "MP4" && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body1">
                                {language === "ar" ? "ملف فيديو" : "Video File"}
                              </Typography>
                              <ReactPlayer
                                url={file.url}
                                controls
                                width="100%"
                              />
                            </Box>
                          )}
                          {extension === "LINK" && (
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
                              <Box>
                                <Typography variant="h6">
                                  {file.description ||
                                    (language === "ar" ? "رابط" : "Link")}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  startIcon={<LinkIcon className="mx-3" />}
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  {language === "ar"
                                    ? "فتح الرابط"
                                    : "Open Link"}
                                </Button>
                              </Box>
                            </Card>
                          )}
                          {/* New case for image files */}
                          {(extension === "JPG" ||
                            extension === "JPEG" ||
                            extension === "PNG") && (
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
                                  startIcon={
                                    <ImageIcon className="ms-3 pe-none" />
                                  }
                                  sx={{ mt: 2 }}
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  {language === "ar"
                                    ? "عرض الصورة بالحجم الكامل"
                                    : "View Full Image"}
                                </Button>
                              </Box>
                            </Card>
                          )}
                        </Box>
                      );
                    })}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Typography>
            {language === "ar"
              ? "لم يتم العثور على العناصر."
              : "No items found."}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <div>
      <audio ref={audioRef} style={{ display: "none" }} />{" "}
      {/* Hidden audio element */}
      {loading && categories.length === 0 ? (
        <div className="w-100 text-center">
          <CircularProgress />
        </div>
      ) : (
        categories.map((category) => (
          <Card
            key={category.id}
            sx={{
              m: 2,
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
              backgroundColor: "var(--card-color)",
              color: "var(--text-color)",
              border: "1px solid white",
            }}
            onClick={() => handleOpenModal(category)}
          >
            <CardContent>
              <Typography variant="h5" className="text-coral">
                {category.title || "No Title"}
              </Typography>
              <Typography variant="body1">
                {category.description && category.description}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
      <Modal open={modalOpen} onClose={handleCloseModal} fullscreen="true">
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            overflowY: "auto",
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          <ModalContent />
        </Box>
      </Modal>
    </div>
  );
};

export default History;
