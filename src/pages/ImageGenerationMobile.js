// ImageGenerationMobile.js - 모바일 전용 이미지 생성 페이지
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { detectPlatform } from "../utils/platformDetector";
import {REST_API_BASE_URL} from "../config/apiConfig";

const ImageGenerationMobile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState(location.state?.message || "");
  const [keyword, setKeyword] = useState(location.state?.keyword || "");
  const [style, setStyle] = useState(null);
  const [subject, setSubject] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [background, setBackground] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const translateCategory = (category, selection) => {
    const translations = {
      style: {
        사실적: "realistic",
        애니메이션: "animation",
        일러스트: "illustration",
        "픽셀 아트": "pixel art",
      },
      emotion: {
        행복한: "happy",
        슬픈: "sad",
        차분한: "calm",
        "에너지 넘치는": "energetic",
      },
      background: {
        실내: "indoor",
        야외: "outdoor",
        도시: "city",
        해변: "beach",
      },
    };
    return translations[category][selection];
  };

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleSubmit = () => {
    if (!style || !subject || !emotion || !background) {
      alert("모든 카테고리에서 최소한 한 개의 옵션을 선택해야 합니다.");
      return;
    }

    setIsButtonDisabled(true);
    setIsLoading(true);

    const requestData = {
      style: translateCategory("style", style),
      keyword,
      emotion: translateCategory("emotion", emotion),
      background: translateCategory("background", background),
      message: inputText,
    };

    // fetch("http://localhost:8080/api/images/generate", {
        fetch(`${REST_API_BASE_URL}/images/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "success") {
          const formattedImages = data.images.map((image) => ({
            original: `data:image/png;base64,${image}`,
            thumbnail: `data:image/png;base64,${image}`,
          }));
          setGeneratedImages(formattedImages);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("이미지 생성 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => setIsButtonDisabled(false), 5000);
      });
  };

  const handleUseImage = () => {
    if (generatedImages.length > 0) {
      const selectedImage = generatedImages[currentImageIndex];
      const platform = detectPlatform();
      
      if (platform.isMobile) {
        navigate("/main-mobile", {
          state: {
            message: inputText,
            generatedImage: selectedImage.original,
          },
        });
      } else {
        navigate("/main", {
          state: {
            message: inputText,
            generatedImage: selectedImage.original,
          },
        });
      }
    } else {
      alert("이미지를 먼저 생성해주세요.");
    }
  };

  return (
    <div style={styles.container}>
      {isLoading && <LoadingAnimation />}
      
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>이미지 자동생성</h1>
        <p style={styles.headerSubtitle}>키워드와 옵션을 선택해서 이미지를 만들어보세요</p>
      </div>

      {/* 키워드 입력 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>추출된 키워드</h2>
        <input
          type="text"
          value={keyword}
          onChange={handleInputChange}
          style={styles.keywordInput}
          placeholder="키워드를 입력하세요"
        />
      </div>

      {/* 메시지 내용 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>메시지 내용</h2>
        <textarea
          value={inputText}
          readOnly
          style={styles.textArea}
          placeholder="메시지 내용이 여기에 표시됩니다"
        />
      </div>

      {/* 스타일 선택 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>스타일</h2>
        <div style={styles.optionGrid}>
          {["사실적", "애니메이션", "일러스트", "픽셀 아트"].map((option) => (
            <button
              key={option}
              onClick={() => setStyle(option)}
              style={{
                ...styles.optionButton,
                backgroundColor: style === option ? "#4A90E2" : "#f8f9fa",
                color: style === option ? "white" : "#333",
                borderColor: style === option ? "#4A90E2" : "#ddd",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 목적 선택 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>목적</h2>
        <div style={styles.optionGrid}>
          {["청첩장", "축하 문자", "안부 문자", "소식 전달"].map((option) => (
            <button
              key={option}
              onClick={() => setSubject(option)}
              style={{
                ...styles.optionButton,
                backgroundColor: subject === option ? "#4A90E2" : "#f8f9fa",
                color: subject === option ? "white" : "#333",
                borderColor: subject === option ? "#4A90E2" : "#ddd",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 감정/분위기 선택 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>감정/분위기</h2>
        <div style={styles.optionGrid}>
          {["행복한", "슬픈", "차분한", "에너지 넘치는"].map((option) => (
            <button
              key={option}
              onClick={() => setEmotion(option)}
              style={{
                ...styles.optionButton,
                backgroundColor: emotion === option ? "#4A90E2" : "#f8f9fa",
                color: emotion === option ? "white" : "#333",
                borderColor: emotion === option ? "#4A90E2" : "#ddd",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 배경 선택 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>배경</h2>
        <div style={styles.optionGrid}>
          {["실내", "야외", "도시", "해변"].map((option) => (
            <button
              key={option}
              onClick={() => setBackground(option)}
              style={{
                ...styles.optionButton,
                backgroundColor: background === option ? "#4A90E2" : "#f8f9fa",
                color: background === option ? "white" : "#333",
                borderColor: background === option ? "#4A90E2" : "#ddd",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div style={styles.buttonContainer}>
        <button
          onClick={handleSubmit}
          style={{
            ...styles.generateButton,
            opacity: isButtonDisabled ? 0.7 : 1,
          }}
          disabled={isButtonDisabled}
        >
          {isButtonDisabled ? "생성 중..." : "이미지 생성"}
        </button>
      </div>

      {/* 생성 결과 섹션 */}
      {generatedImages.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>생성 결과</h2>
          <div style={styles.imageDisplayContainer}>
            <div style={styles.imageDisplay}>
              <ImageGallery
                items={generatedImages}
                onSlide={(currentIndex) => setCurrentImageIndex(currentIndex)}
                showPlayButton={false}
                showFullscreenButton={false}
                showNav={true}
                showThumbnails={true}
                thumbnailPosition="bottom"
              />
            </div>
            
            <button
              onClick={handleUseImage}
              style={styles.useButton}
            >
              이 이미지 사용하기
            </button>
          </div>
        </div>
      )}

      {/* 이미지가 없을 때 플레이스홀더 */}
      {generatedImages.length === 0 && !isLoading && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>생성 결과</h2>
          <div style={styles.noImageContainer}>
            <p style={styles.noImageText}>
              옵션을 선택하고 이미지를 생성해보세요
            </p>
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
  keywordInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#fafafa",
  },
  textArea: {
    width: "100%",
    height: "100px",
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  optionButton: {
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
  imageDisplayContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  imageDisplay: {
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f0f4f8",
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  noImageContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "40px 20px",
    textAlign: "center",
    border: "2px dashed #ddd",
  },
  noImageText: {
    color: "#999",
    fontSize: "16px",
    margin: "0",
  },
  bottomSpacer: {
    height: "24px",
  },
};

export default ImageGenerationMobile;