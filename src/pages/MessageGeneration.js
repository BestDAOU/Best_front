// 수정된 MessageGeneration.js 파일
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageGenerateAnimation from "../components/MessageGenerateAnimation";
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
      <div style={styles.panelsContainer}>
        {/* 왼쪽 패널: 발송 목적 및 내용 */}
        <div style={styles.inputPanel}>
          <div style={styles.inputTitleContainer}>
            <h2 style={styles.inputTitle}>발송 목적 및 내용</h2>
          </div>
          <div style={styles.panelContent}>
            <textarea
              placeholder="메시지를 입력하세요"
              value={inputText}
              onChange={handleInputChange}
              style={styles.textArea}
            />

            {/* 주요 키워드를 버튼으로 제공하는 영역 */}
            <div style={styles.keywordContainer}>
              <h3 style={styles.keywordTitle}>주요 키워드 제시</h3>
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
                ...styles.actionButton,
                ...(isGenerateButtonHover && !isLoading ? styles.buttonHover : {})
              }}
              disabled={isLoading}
            >
              {isLoading ? "생성 중..." : "메시지 생성"}
            </button>

            {/* 에러 메시지 표시 */}
            {error && <p style={styles.errorText}>{error}</p>}
          </div>
        </div>

        {/* 오른쪽 패널: 생성 결과 */}
        <div style={styles.resultPanel}>
          <div style={styles.resultTitleContainer}>
            <h2 style={styles.resultTitle}>생성 결과</h2>
          </div>
          <div style={styles.panelContent}>
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
                ...styles.actionButton,
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
    // marginTop: "80px", // 헤더 높이 고려
    // backgroundColor: "#f5f5f5",
    minHeight: "calc(100vh - 80px)", // 전체 높이에서 헤더 높이 빼기
  },
  panelsContainer: {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    gap: "20px",
    height: "calc(100vh - 140px)", // 컨테이너 높이 지정
  },
  inputPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
  resultPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
  inputTitleContainer: {
    backgroundColor: "#f5f7fa",
    borderBottom: "1px solid #e5e5e5",
    padding: "15px 20px",
  },
  resultTitleContainer: {
    backgroundColor: "#4c5873", // 첫 번째 이미지와 유사한 어두운 블루/그레이 색상
    padding: "15px 20px",
    position: "relative",
  },
  inputTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  resultTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "white", // 첫 번째 이미지와 같이 흰색 텍스트
  },
  panelContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  textArea: {
    width: "100%",
    flex: 1, // 남은 공간 채우기
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "16px",
    fontFamily: "'Arial', sans-serif",
    resize: "none",
    boxSizing: "border-box",
    marginBottom: "20px",
    minHeight: "250px", // 최소 높이 설정
  },
  keywordContainer: {
    marginBottom: "20px",
  },
  keywordTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  keywordButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "flex-start",
  },
  keywordButton: {
    width: "83px", 
    height: "40px",
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
  actionButton: {
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    color: "white",
    backgroundColor: "#4A90E2",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    width: "100%",
  },
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