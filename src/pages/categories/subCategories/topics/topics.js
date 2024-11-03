import React, { useState, useEffect, useRef, useCallback } from "react";
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
import "./topics.css";
import {
  PictureAsPdf,
  Audiotrack,
  Link as LinkIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useTranslation } from "../../../../components/languages/provider";
import { toast } from "react-toastify";

const Topics = ({ src, audioName }) => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // Controls modal visibility
  const [modalStack, setModalStack] = useState([]); // Stack to manage nested modals
  const [loading, setLoading] = useState(false); // Loader state
  const [categoryItems, setCategoryItems] = useState([]); // State for category items
  const [selectedCategory, setSelectedCategory] = useState(null); // Currently selected category
  const [selectedFullDescription, setSelectedFullDescription] = useState(""); // State for the selected full description
  const [isAudioLoading, setIsAudioLoading] = useState(false); // Track MP3 loading state
  const [currentAudioSrc, setCurrentAudioSrc] = useState(null); // Store current audio source
  const [errorFetching, setErrorFetching] = useState(false);
  const audioRef = useRef(null); // Ref for the hidden audio element
  const { language } = useTranslation();

  const hiddenIndices = [3, 7, 8, 12];

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Start loader
      try {
        const response = await fetch(
          `https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/get-object-category-tree/${language}/json`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const newData = data.sub_categories.filter(
          (item, index) => !hiddenIndices.includes(index)
        );
        setCategories(newData); // Set the filtered categories
      } catch (error) {
        setErrorFetching(true);
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    fetchCategories();
    // eslint-disable-next-line
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

  // Handler to open modals
  const handleOpenModal = useCallback(
    async (category) => {
      if (category.has_children && category.sub_categories.length > 0) {
        setModalStack((prevStack) => [
          ...prevStack,
          { category, isLeaf: false },
        ]);
        setSelectedCategory(category);
        setModalOpen(true);
      } else if (category.category_items) {
        setModalStack((prevStack) => [
          ...prevStack,
          { category, isLeaf: true },
        ]);
        setSelectedCategory(category);
        setModalOpen(true);
        setLoading(true);
        try {
          const response = await fetch(category.category_items);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setCategoryItems(data.data || []); // Ensure that data is correctly set or an empty array if none
        } catch (error) {
          setErrorFetching(true);
          console.error("Error fetching category items", error);
        } finally {
          setLoading(false); // Stop loader
        }
      }
    },
    // eslint-disable-next-line
    [language]
  );

  // Handler to open full descriptions
  const handleOpenFullDescription = useCallback((fullDescription) => {
    setModalStack((prevStack) => [
      ...prevStack,
      { category: null, isLeaf: true },
    ]);
    setSelectedFullDescription(fullDescription);
    setModalOpen(true);
  }, []);

  // Handler to close modals
  const handleCloseModal = useCallback(() => {
    if (modalStack.length > 1) {
      setModalStack((prevStack) => prevStack.slice(0, -1));
      setSelectedCategory(modalStack[modalStack.length - 2].category);
    } else {
      setModalOpen(false);
      setCategoryItems([]); // Clear the category items when closing the modal
      setModalStack([]);
      // Reset selected full description
      setSelectedFullDescription("");
    }
  }, [modalStack]);

  // Handler to go back in modal stack
  const handleBack = useCallback(() => {
    if (selectedFullDescription) {
      setSelectedFullDescription("");
      setModalStack((prevStack) => prevStack.slice(0, -1));
    } else if (modalStack.length > 1) {
      const updatedStack = modalStack.slice(0, -1);
      setModalStack(updatedStack);
      setSelectedCategory(updatedStack[updatedStack.length - 1].category);
    } else {
      setModalOpen(false);
      setModalStack([]);
      // Reset selected full description
      setSelectedFullDescription("");
    }
  }, [modalStack, selectedFullDescription]);

  const pageName = "زاد طالب العلم";

  // Handler for listening to audio
  const handleListenClick = useCallback(
    (audioSrc) => {
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
          toast.error(
            language === "ar"
              ? "خطأ في تحميل الملف الصوتي."
              : "Error loading audio file."
          );
        };
      } else {
        // If the same audio is clicked again, play it
        audio.play();
      }
    },
    [src, audioName, language]
  );

  // Removed pagination handlers
  // const handleLoadMoreSubCategories = () => { /* Removed */ };
  // const handleLoadMoreCategoryItems = () => { /* Removed */ };

  // Removed pagination states
  // const [currentPageSubCategories, setCurrentPageSubCategories] = useState(1);
  // const [currentPageCategoryItems, setCurrentPageCategoryItems] = useState(1);
  // const itemsPerPage = 10;

  // Removed audioDisplayCount and related handlers

  const ModalContent = () => {
    // Determine which content to display
    const isFullDescription = Boolean(selectedFullDescription);
    const isSubCategories =
      selectedCategory?.sub_categories?.length > 0 && !isFullDescription;
    const isCategoryItems = categoryItems.length > 0 && !isFullDescription;

    return (
      <Box sx={{ p: 1 }} className="topics-component">
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
        ) : isFullDescription ? (
          <Box sx={{ mt: 2, p: 2 }}>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedFullDescription),
              }}
            />
          </Box>
        ) : isSubCategories ? (
          <Box sx={{ mt: 2 }}>
            {selectedCategory.sub_categories.map((subCategory, index) =>
              // Optionally exclude specific subcategories if needed
              // For example, exclude index 1:
              // index !== 1 && (
              selectedCategory.id === 86219 &&
              (index === 1 || index === 2) ? null : (
                <Card
                  key={subCategory.id} // Use unique identifier
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
                      {subCategory.description || ""}
                    </Typography>
                  </CardContent>
                </Card>
              )
            )}
            {/* Removed "Load More" button */}
          </Box>
        ) : isCategoryItems ? (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {categoryItems.map((item, index) => (
              <Card
                key={item.id || index} // Use unique identifier
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
                                  <PictureAsPdf
                                    className="ms-3"
                                    color="error"
                                  />
                                }
                                onClick={() => window.open(file.url, "_blank")}
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
                            <ReactPlayer
                              url={file.url}
                              controls
                              width="100%"
                              height="100%"
                              style={{ maxHeight: "400px" }}
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
                                loading="lazy"
                              />
                              <Button
                                variant="outlined"
                                startIcon={
                                  <ImageIcon className="ms-3 pe-none" />
                                }
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
                    ))}

                  {/* Removed "Load More Attachments" button */}
                </CardContent>
              </Card>
            ))}
            {/* Removed "Load More" button for category items */}
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
            key={category.id} // Use unique identifier
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
                {category.description || ""}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
      {/* Modal for Subcategories or Files */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
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

export default Topics;
