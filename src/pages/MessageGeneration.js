// //src/pages/MessageGeneration.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingAnimation from "../components/LoadingAnimation";
import MessageGenerateAnimation from "../components/MessageGenerateAnimation";
import Message2Animation from "../components/MessageAnimation";
import MessageGenerationService from "../services/MessageGenerationService";

// 메시지 생성 페이지 컴포넌트
const MessageGenerationPage = () => {
  const [inputText, setInputText] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Hover 상태 관리를 위한 state
  const [hoverKeyword, setHoverKeyword] = useState(null);
  const [isGenerateButtonHover, setIsGenerateButtonHover] = useState(false);
  const [isUseButtonHover, setIsUseButtonHover] = useState(false);

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
    navigate("/", { state: { message: generatedMessage } });
  };

  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords(
      (prevSelected) =>
        prevSelected.includes(keyword)
          ? prevSelected.filter((k) => k !== keyword)
          : [...prevSelected, keyword]
    );
  };

  return (
    <div style={styles.container}>
      {isLoading && <MessageGenerateAnimation />}
      <div style={styles.row}>
        {/* 왼쪽 섹션: 발송 목적 및 내용 */}
        <div style={styles.column}>
          <h2>발송 목적 및 내용</h2>
          <textarea
            placeholder="메시지를 입력하세요"
            value={inputText}
            onChange={handleInputChange}
            style={styles.textArea}
          />

          {/* 주요 키워드를 버튼으로 제공하는 영역 */}
          <div style={styles.keywordContainer}>
            <h3>주요 키워드 제시</h3>
            <div style={styles.keywordButtons}>
              {keywords.map((keyword) => {
                const isSelected = selectedKeywords.includes(keyword);
                const isHovered = hoverKeyword === keyword;
                
                // 키워드 버튼 호버 스타일
                const keywordHoverStyle = isHovered ? {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  backgroundColor: isSelected ? "#3980d3" : "#d0d6e6"
                } : {};
                
                return (
                  <button
                    key={keyword}
                    onClick={() => toggleKeywordSelection(keyword)}
                    onMouseEnter={() => setHoverKeyword(keyword)}
                    onMouseLeave={() => setHoverKeyword(null)}
                    style={{
                      ...styles.keywordButton,
                      backgroundColor: isSelected ? "#4A90E2" : "#e1e5f2",
                      ...keywordHoverStyle
                    }}
                  >
                    {keyword}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 메시지 생성 버튼 */}
          <button
            onClick={handleGenerateMessage}
            onMouseEnter={() => setIsGenerateButtonHover(true)}
            onMouseLeave={() => setIsGenerateButtonHover(false)}
            style={{
              ...styles.generateButton,
              ...(isGenerateButtonHover && !isLoading ? styles.buttonHover : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "메시지 생성"}
          </button>

          {/* 에러 메시지 표시 */}
          {error && <p style={styles.errorText}>{error}</p>}
        </div>

        {/* 오른쪽 섹션: 생성 결과 */}
        <div style={styles.column}>
          <h2>생성 결과</h2>
          <textarea
            style={styles.textArea}
            placeholder="결과"
            value={generatedMessage}
            readOnly
          />
          {/* 메시지 사용 버튼 */}
          <button
            onClick={handleUseMessage}
            onMouseEnter={() => setIsUseButtonHover(true)}
            onMouseLeave={() => setIsUseButtonHover(false)}
            style={{
              ...styles.useButton,
              backgroundColor: generatedMessage ? "#4A90E2" : "#ccc",
              cursor: generatedMessage ? "pointer" : "not-allowed",
              ...(isUseButtonHover && generatedMessage ? styles.buttonHover : {})
            }}
            disabled={!generatedMessage}
          >
            메시지 사용
          </button>
        </div>
      </div>
    </div>
  );
};

// 스타일 객체 정의
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    marginTop: "80px", // 헤더 높이 고려
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1000px", // 약간 더 넓게 조정
    marginBottom: "20px",
    gap: "30px", // 좌우 열 사이의 간격
  },
  column: {
    display: "flex",
    flexDirection: "column",
    width: "50%", // 동일한 너비로 설정 (마진 제외)
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  textArea: {
    width: "100%",
    height: "350px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #4A90E2",
    fontSize: "18px",
    fontFamily: "'Arial', sans-serif",
    fontWeight: "bold",
    resize: "none",
    boxSizing: "border-box", // 패딩이 너비에 포함되도록
  },
  keywordSection: {
    marginTop: "20px",
    width: "100%", // 전체 너비 사용
  },
  keywordTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  keywordButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "flex-start", // 왼쪽 정렬
  },
  keywordButton: {
    minWidth: "80px", // 모든 버튼의 최소 너비 통일
    height: "40px", // 모든 버튼의 높이 통일
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "1px solid #4A90E2",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  generateButton: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    color: "white",
    backgroundColor: "#4A90E2",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    transition: "all 0.2s ease", // 모든 속성에 트랜지션 적용
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    width: "100%", // 전체 너비
  },
  useButton: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    color: "#fff",
    backgroundColor: "#4A90E2",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    transition: "all 0.2s ease", // 모든 속성에 트랜지션 적용
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    width: "100%", // 전체 너비
  },
  // 버튼 호버 효과 스타일
  buttonHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#3980d3",
  },
  errorText: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
  },
};

export default MessageGenerationPage;