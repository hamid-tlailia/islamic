import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Input,
  Card,
  CircularProgress,
  List,
  ListItem,
  Alert,
  Button,
} from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "../../../../components/languages/provider";
import { toast } from "react-toastify";

const MAX_QUESTION_LENGTH = 50; // Set a maximum length for the question

const Questions = () => {
  const { language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState([]); // State for suggestions
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lengthWarning, setLengthWarning] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [isErrorFetching, setIsErrorFetching] = useState(false);
  // Reference to the list container
  const listRef = useRef(null);
  useEffect(() => {
    if (isErrorFetching) {
      toast.error(
        language === "ar"
          ? "هناك خطأ ما سيتم معالجة الأمر قريبا "
          : "Something happend , w'll fix it soon"
      );
    }
    // eslint-disable-next-line
  }, [isErrorFetching]);
  // Function to check if text contains Arabic characters
  const isArabicText = (text) => {
    // Arabic Unicode range: \u0600-\u06FF
    return /[\u0600-\u06FF]/.test(text);
  };

  // Debounce timer
  let debounceTimer;

  const handleQuestionChange = (e) => {
    const input = e.target.value;
    setQuestion(input);

    // Clear error and suggestions when input is empty
    if (!input.trim()) {
      setError(null);
      setSuggestions([]);
      setLengthWarning(false);
      return;
    }

    // Check if the question length exceeds the maximum length
    if (input.length > MAX_QUESTION_LENGTH) {
      setLengthWarning(true);
      setSuggestions([]);
      setError(null); // Clear other errors
    } else {
      setLengthWarning(false);

      if (isArabicText(input)) {
        setError(null); // Clear error
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchSuggestions(input);
        }, 500); // Debounce API calls by 500ms
      } else {
        setError(
          language === "ar"
            ? "نحن نجيب فقط على الأسئلة باللغة العربية."
            : "Sorry , answers available only in arabic"
        );
        setSuggestions([]);
      }
    }
  };

  const fetchSuggestions = async (input) => {
    const endpoint = "https://ar.wikipedia.org/w/api.php";
    const url = `${endpoint}?action=query&list=search&srsearch=${encodeURIComponent(
      input
    )}&format=json&origin=*`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (
        data &&
        data.query &&
        data.query.search &&
        data.query.search.length > 0
      ) {
        setSuggestions(data.query.search);

        // If only one suggestion, automatically fetch the data
        if (data.query.search.length === 1) {
          handleSuggestionClick(data.query.search[0]);
        }
      } else {
        setSuggestions([]);

        // No suggestions, fetch data for the input query
        fetchDataForQuery(input);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setIsErrorFetching(true);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuestion(suggestion.title);
    setSuggestions([]);
    setLoading(true);
    setError(null);

    const endpoint = "https://ar.wikipedia.org/w/api.php";
    const pageId = suggestion.pageid;

    // Fetch the page extract (summary)
    const pageUrl = `${endpoint}?action=query&prop=extracts&pageids=${pageId}&exintro&explaintext&format=json&origin=*`;

    try {
      const pageResponse = await fetch(pageUrl);
      const pageData = await pageResponse.json();

      const extract =
        pageData.query.pages[pageId].extract ||
        "لم يتم العثور على إجابة لهذا السؤال.";

      setResponses((prevResponses) => [
        ...prevResponses,
        { question: suggestion.title, answer: extract, lang: "ar" },
      ]);
      setShowInput(false); // Hide input and show back arrow
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("حدث خطأ. حاول مرة أخرى.");

      setResponses((prevResponses) => [
        ...prevResponses,
        {
          question: suggestion.title,
          answer: "حدث خطأ. حاول مرة أخرى.",
          lang: "ar",
        },
      ]);
      setShowInput(false); // Hide input and show back arrow
    } finally {
      setLoading(false);
      setLengthWarning(false);
    }
  };

  const fetchDataForQuery = async (input) => {
    setLoading(true);
    setError(null);

    const endpoint = "https://ar.wikipedia.org/w/api.php";
    const url = `${endpoint}?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(
      input
    )}&format=json&origin=*`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (pageId !== "-1" && page.extract) {
        setResponses((prevResponses) => [
          ...prevResponses,
          { question: input, answer: page.extract, lang: "ar" },
        ]);
      } else {
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            question: input,
            answer: "لم يتم العثور على إجابة لهذا السؤال.",
            lang: "ar",
          },
        ]);
      }
      setShowInput(false); // Hide input and show back arrow
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("حدث خطأ. حاول مرة أخرى.");

      setResponses((prevResponses) => [
        ...prevResponses,
        {
          question: input,
          answer: "حدث خطأ. حاول مرة أخرى.",
          lang: "ar",
        },
      ]);
      setShowInput(false); // Hide input and show back arrow
    } finally {
      setLoading(false);
      setQuestion("");
      setLengthWarning(false);
    }
  };

  // Effect to scroll to the latest answer when responses change
  useEffect(() => {
    if (responses.length > 0) {
      // Scroll to the bottom of the list
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [responses]);

  return (
    <Box
      sx={{
        p: 0,
        backgroundColor: "var(--card-color)",
        color: "var(--text-color)",
        minHeight: "100%",
        width: "100%",
        direction: "rtl",
      }}
    >
      <Typography
        level="h4"
        sx={{ mb: 2, textAlign: "center", color: "var(--text-color)" }}
      >
        {language === "ar" ? "مركز الأسئلة" : "Questions Center"}
      </Typography>

      {showInput && (
        <Alert
          variant="outlined"
          color="warning"
          sx={{
            mb: 2,
            backgroundColor: "var(--card-color)",
            direction: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar"
            ? "نحن نستخدم ويكيبيديا للحصول على معلومات عامة. قد لا تكون الإجابات دقيقة تمامًا، يُرجى التحقق من المعلومات المهمة."
            : "We use Wikipedia for general information. Answers may not be entirely accurate; please verify important information."}
        </Alert>
      )}

      <Card
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--card-color)",
          color: "var(--text-color)",
          gap: 2,
          width: "100%",
        }}
      >
        {showInput ? (
          <>
            <Input
              value={question}
              onChange={handleQuestionChange}
              placeholder={
                language === "ar"
                  ? "استخدم كلمات مفتاحية بدلاً من سؤال طويل..."
                  : "Use key terms instead of a long question..."
              }
              sx={{
                mb: 0,
                backgroundColor: "var(--card-color)",
                color: "var(--text-color)",
                direction: language === "ar" ? "rtl" : "ltr",
              }}
              multiline
              minRows={3}
            />
            {lengthWarning && (
              <Alert
                variant="outlined"
                color="warning"
                sx={{
                  mb: 2,
                  backgroundColor: "var(--card-color)",
                  direction: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {language === "ar"
                  ? `يرجى استخدام كلمات مفتاحية لا تتجاوز ${MAX_QUESTION_LENGTH} حرفًا.`
                  : `Please use key terms not exceeding ${MAX_QUESTION_LENGTH} characters.`}
              </Alert>
            )}
            {error && (
              <Alert
                color="danger"
                sx={{ mb: 2, direction: language === "ar" ? "rtl" : "ltr" }}
              >
                {error}
              </Alert>
            )}
            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <List
                sx={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  backgroundColor: "var(--card-color)",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  p: 1,
                  width: "100%",
                  direction: "rtl",
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      cursor: "pointer",
                      marginBottom: "3px",
                      "&:hover": {
                        backgroundColor: "green",
                        color: "white",
                      },
                    }}
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Typography
                      level="body2"
                      sx={{
                        direction: "rtl",
                        width: "100%",
                      }}
                    >
                      {suggestion.title}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            startDecorator={<ArrowBackIcon />}
            onClick={() => {
              setShowInput(true);
              setError(null);
              setResponses([]);
            }}
          >
            {language === "ar" ? "عودة" : "Back"}
          </Button>
        )}
      </Card>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <List
        ref={listRef}
        sx={{
          maxHeight: "100%",
          overflowY: "auto",
          backgroundColor: "var(--card-color)",
          borderRadius: "8px",
          p: 2,
          width: "100%",
          direction: "rtl",
        }}
      >
        {responses.map((response, index) => (
          <ListItem
            key={index}
            sx={{
              mb: 2,
              flexDirection: "column",
              alignItems: "flex-end",
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              borderRadius: "8px",
              p: 2,
              width: "100%",
              direction: "rtl",
            }}
          >
            <Typography
              level="body1"
              sx={{
                fontWeight: "bold",
                direction: "rtl",
                width: "100%",
              }}
              color="primary"
            >
              {language === "ar" ? "سؤال :" : "Question"}
            </Typography>
            <Typography
              level="body1"
              sx={{
                direction: "rtl",
                width: "100%",
              }}
            >
              {response.question}
            </Typography>

            <Typography
              level="body1"
              sx={{
                fontWeight: "bold",
                mt: 2,
                direction: "rtl",
                width: "100%",
              }}
              color="success"
            >
              {language === "ar" ? "إجابة :" : "Answer"}
            </Typography>
            <Typography
              level="body1"
              sx={{
                direction: "rtl",
                width: "100%",
              }}
            >
              {response.answer}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Questions;
