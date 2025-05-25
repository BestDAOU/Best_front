// MessageGenerationMobile.js - 모바일 전용 메시지 생성 페이지
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageGenerateAnimation from "../components/MessageGenerateAnimation";
import MessageGenerationService from "../services/MessageGenerationService";
import { detectPlatform } from "../utils/platformDetector";

const MessageGenerationMobile = () => {
  const [inputText, setInputText] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const keywords = [
    "초대",
    "안내", 
    "홍보",
    "안부",
    "감사",
    "사과",
    "환영",
    "명절인사",
    "부고",
  ];

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleGenerateMessage = async () => {
    if (inputText.trim() === "") {
      alert("메시지를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = await MessageGenerationService.generateMessage(
        inputText,
        selectedKeywords
      );

      setGeneratedMessage(message);
    } catch (err) {
      console.error(err);
      setError(err.message || "메시지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMessage = () => {
    const platform = detectPlatform();
    
    if (platform.isMobile) {
      navigate("/main-mobile", { state: { message: generatedMessage } });
    } else {
      navigate("/main", { state: { message: generatedMessage } });
    }
  };

  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords((prevSelected) =>
      prevSelected.includes(keyword)
        ? prevSelected.filter((k) => k !== keyword)
        : [...prevSelected, keyword]
    );
  };

  return (
    <div style={styles.container}>
      {isLoading && <MessageGenerateAnimation />}
      
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>메시지 자동생성</h1>
        <p style={styles.headerSubtitle}>원하는 내용을 입력하고 키워드를 선택하세요</p>
      </div>

      {/* 입력 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>발송 목적 및 내용</h2>
        <textarea
          placeholder="메시지를 입력하세요"
          value={inputText}
          onChange={handleInputChange}
          style={styles.textArea}
        />
      </div>

      {/* 키워드 선택 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>주요 키워드 선택</h2>
        <div style={styles.keywordGrid}>
          {keywords.map((keyword) => {
            const isSelected = selectedKeywords.includes(keyword);
            return (
              <button
                key={keyword}
                onClick={() => toggleKeywordSelection(keyword)}
                style={{
                  ...styles.keywordButton,
                  backgroundColor: isSelected ? "#4A90E2" : "#f8f9fa",
                  color: isSelected ? "white" : "#333",
                  borderColor: isSelected ? "#4A90E2" : "#ddd",
                }}
              >
                {keyword}
              </button>
            );
          })}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div style={styles.buttonContainer}>
        <button
          onClick={handleGenerateMessage}
          style={{
            ...styles.generateButton,
            opacity: isLoading ? 0.7 : 1,
          }}
          disabled={isLoading}
        >
          {isLoading ? "생성 중..." : "메시지 생성"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* 생성 결과 섹션 */}
      {(generatedMessage || isLoading) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>생성 결과</h2>
          <div style={styles.resultContainer}>
            <textarea
              style={styles.resultTextArea}
              placeholder={isLoading ? "메시지를 생성하고 있습니다..." : "생성된 메시지가 여기에 표시됩니다"}
              value={generatedMessage}
              readOnly
            />
            
            {generatedMessage && (
              <button
                onClick={handleUseMessage}
                style={styles.useButton}
              >
                이 메시지 사용하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 하단 여백 */}
      <div style={styles.bottomSpacer} />
    </div>
  );
};

const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
    padding: "20px 16px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px 16px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 16px 0",
  },
  textArea: {
    width: "100%",
    height: "120px",
    padding: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#fafafa",
  },
  keywordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  keywordButton: {
    padding: "12px 8px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    padding: "0 16px",
    marginBottom: "16px",
  },
  generateButton: {
    width: "100%",
    padding: "16px 24px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
    transition: "all 0.2s ease",
    minHeight: "52px",
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
    marginLeft: "16px",
    marginRight: "16px",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "14px",
    margin: "0",
    textAlign: "center",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultTextArea: {
    width: "100%",
    height: "140px",
    padding: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  useButton: {
    width: "100%",
    padding: "14px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    minHeight: "48px",
  },
  bottomSpacer: {
    height: "24px",
  },
};

export default MessageGenerationMobile;