import { getJSON, TTL } from "../../../../lib/apiClient";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReactPlayer from "react-player";
import "./fiqh.css";
import {
  PictureAsPdf,
  Audiotrack,
  Link as LinkIcon,
  Image as ImageIcon, // Import an icon for images
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useTranslation } from "../../../../components/languages/provider";
import { toast } from "react-toastify";

const Fiqh = ({ src, audioName }) => {
  const [categories, setCategories] = useState([]);
  const [modalStack, setModalStack] = useState([]); // Stack to manage nested modals
  const [loading, setLoading] = useState(false); // Loader state
  const [categoryItems, setCategoryItems] = useState([]); // State for category items
  const [selectedFullDescription, setSelectedFullDescription] = useState(""); // State for the selected full description
  const [isAudioLoading, setIsAudioLoading] = useState(false); // Track MP3 loading state
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null); // Store current audio source
  const [errorFetching, setErrorFetching] = useState(false);
  const audioRef = useRef(null); // Ref for the hidden audio element
  const { language } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Start loader
      try {
        const data = await getJSON(`https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-object-category-tree/${language}/json`, { ttl: TTL.LONG });
        if (data.sub_categories && data.sub_categories.length > 3) {
          setCategories(data.sub_categories[3].sub_categories); // Only use subcategories of the fourth main category
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

  const handleOpenModal = async (category) => {
    if (category.has_children && category.sub_categories.length > 0) {
      setModalStack((prevStack) => [...prevStack, { category, isLeaf: false }]);
    } else if (category.category_items) {
      await fetchCategoryItems(category.category_items);
      setModalStack((prevStack) => [...prevStack, { category, isLeaf: true }]);
    }
  };

  const handleOpenFullDescription = (fullDescription) => {
    setSelectedFullDescription(fullDescription);
    setModalStack((prevStack) => [
      ...prevStack,
      { fullDescription, isLeaf: false, isFullDescription: true },
    ]);
  };

  const handleCloseModal = () => {
    setModalStack((prevStack) => prevStack.slice(0, -1)); // Go back in the modal stack
    if (modalStack.length === 1) {
      setCategoryItems([]); // Clear the category items when closing the main modal
    }
  };

  const fetchCategoryItems = async (url) => {
    setLoading(true); // Start loader
    try {
      const data = await getJSON(url, { ttl: TTL.LONG });
      setCategoryItems(data.data || []); // Ensure that data is correctly set or an empty array if none
    } catch (error) {
      console.error("Error fetching category items", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Handle listening to MP3 files with a hidden audio element and loader
  const pageName = "الفقه الاسلامي";
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

  const ModalContent = ({ category, isLeaf, isFullDescription }) => {
    return (
      <Box sx={{ p: 1 }} className = "fiqh-component">
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
            {isFullDescription
              ? language === "ar"
                ? "الوصف الكامل"
                : "Full Description"
              : category?.title}
          </Typography>
          <IconButton onClick={handleCloseModal}>
            {modalStack.length > 1 ? (
              <ArrowBackIcon className="text-success" />
            ) : (
              <CloseIcon className="text-danger" />
            )}
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : isFullDescription ? (
          <Box sx={{ mt: 2, p: 2 }}>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedFullDescription),
              }}
            />
          </Box>
        ) : isLeaf ? (
          <Box sx={{ mt: 2 }}>
            {categoryItems.length > 0 ? (
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
                        item.attachments.length > 0 &&
                        item.attachments.map((file, idx) => (
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
                            {file.extension_type.toUpperCase() === "MP3" && (
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
                                      onClick={() =>
                                        handleListenClick(file.url)
                                      }
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
                                  {language === "ar"
                                    ? "ملف فيديو"
                                    : "Video File"}
                                </Typography>
                                <ReactPlayer
                                  url={file.url}
                                  controls
                                  width="100%"
                                />
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
                            {/* No file provided */}
                            {item.attachments.length === 0 && (
                              <p className="text-danger">
                                {" "}
                                {language === "ar"
                                  ? "لا يحتوي على بيانات"
                                  : "No data provided"}{" "}
                                ggerge
                              </p>
                            )}
                          </Box>
                        ))}
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
        ) : (
          <Box sx={{ mt: 2 }}>
            {category?.sub_categories?.map((subCategory, index) => (
              <Card
                key={index}
                sx={{
                  m: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                  backgroundColor: "var(--card-color)",
                  color: "var(--text-color)",
                  border: "1px solid white",
                }}
                onClick={() => handleOpenModal(subCategory)}
              >
                <CardContent>
                  <Typography variant="body1" className="text-coral">
                    {subCategory.title || "No Title"}
                  </Typography>
                  <Typography variant="body1">
                    {subCategory.description && subCategory.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
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
      {modalStack.map((modalCategoryObj, index) => (
        <Modal
          key={index}
          open={index === modalStack.length - 1} // Only the top modal in the stack is open
          onClose={handleCloseModal}
          fullscreen="true" // Full-screen modal
          sx={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
          }}
        >
          <Box className="sheet-surface"
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
            <ModalContent
              category={modalCategoryObj.category}
              isLeaf={modalCategoryObj.isLeaf}
              isFullDescription={modalCategoryObj.isFullDescription}
            />
          </Box>
        </Modal>
      ))}
    </div>
  );
};

export default Fiqh;
