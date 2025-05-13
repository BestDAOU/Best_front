// src/pages/ImageGeneration.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "./ImageGeneration.css";
const ImageGeneration = () => {
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

  // Hover 상태 관리
  const [isGenerateButtonHover, setIsGenerateButtonHover] = useState(false);
  const [isUseButtonHover, setIsUseButtonHover] = useState(false);
  const [hoverOption, setHoverOption] = useState(null);

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

    fetch("http://localhost:8080/api/images/generate", {
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

  return (
    <div style={styles.container}>
      {isLoading && <LoadingAnimation />}
      <div style={styles.panelsContainer}>
        {/* 왼쪽 패널: 발송 목적 및 내용 */}
        <div style={styles.inputPanel}>
          <div style={styles.inputTitleContainer}>
            <h2 style={styles.inputTitle}>발송 목적 및 내용</h2>
          </div>
          <div style={styles.panelContent}>
            <div style={styles.selectedKeyword}>
              <h3 style={styles.subTitle}>추출된 키워드:</h3>
              <input
                type="text"
                value={keyword}
                onChange={handleInputChange}
                style={styles.keywordInput}
              />
            </div>

            <div style={styles.textAreaContainer}>
              <textarea
                placeholder="text 입력"
                value={inputText}
                readOnly
                style={styles.textArea}
              />
            </div>

            <div style={styles.keywordContainer}>
              <h3 style={styles.subTitle}>주요 키워드 제시</h3>
              <div style={styles.categoriesContainer}>
                <div style={styles.categoryColumn}>
                  <CategorySelector
                    label="스타일"
                    options={["사실적", "애니메이션", "일러스트", "픽셀 아트"]}
                    selected={style}
                    onSelect={setStyle}
                    hoverOption={hoverOption}
                    setHoverOption={setHoverOption}
                    category="style"
                  />
                  <CategorySelector
                    label="목적"
                    options={["청첩장", "축하 문자", "안부 문자", "소식 전달"]}
                    selected={subject}
                    onSelect={setSubject}
                    hoverOption={hoverOption}
                    setHoverOption={setHoverOption}
                    category="subject"
                  />
                </div>
                <div style={styles.categoryColumn}>
                  <CategorySelector
                    label="감정/분위기"
                    options={["행복한", "슬픈", "차분한", "에너지 넘치는"]}
                    selected={emotion}
                    onSelect={setEmotion}
                    hoverOption={hoverOption}
                    setHoverOption={setHoverOption}
                    category="emotion"
                  />
                  <CategorySelector
                    label="배경"
                    options={["실내", "야외", "도시", "해변"]}
                    selected={background}
                    onSelect={setBackground}
                    hoverOption={hoverOption}
                    setHoverOption={setHoverOption}
                    category="background"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              onMouseEnter={() => setIsGenerateButtonHover(true)}
              onMouseLeave={() => setIsGenerateButtonHover(false)}
              style={{
                ...styles.actionButton,
                ...(isGenerateButtonHover && !isButtonDisabled
                  ? styles.buttonHover
                  : {}),
              }}
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? "생성 중..." : "이미지 생성"}
            </button>
          </div>
        </div>

        {/* 오른쪽 패널: 생성 결과 */}
        <div style={styles.resultPanel}>
          <div style={styles.resultTitleWithArrow}>
            <div style={styles.arrow}></div>
            <h2 style={styles.resultTitle}>생성 결과</h2>
          </div>
          <div style={styles.panelContent}>
            <div style={styles.imageDisplay}>
              {generatedImages.length > 0 ? (
                <ImageGallery
                  items={generatedImages}
                  onSlide={(currentIndex) => setCurrentImageIndex(currentIndex)}
                  showPlayButton={false}
                  showFullscreenButton={false}
                  showNav={true}
                  showThumbnails={true}
                  thumbnailPosition="bottom"
                />
              ) : (
                <div style={styles.noImageMessage}>
                  <p>이미지를 생성하세요</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (generatedImages.length > 0) {
                  const selectedImage = generatedImages[currentImageIndex];
                  navigate("/main", {
                    state: {
                      message: inputText,
                      generatedImage: selectedImage.original,
                    },
                  });
                } else {
                  alert("이미지를 먼저 생성해주세요.");
                }
              }}
              onMouseEnter={() => setIsUseButtonHover(true)}
              onMouseLeave={() => setIsUseButtonHover(false)}
              style={{
                ...styles.actionButton,
                backgroundColor:
                  generatedImages.length > 0 ? "#4A90E2" : "#ccc",
                cursor: generatedImages.length > 0 ? "pointer" : "not-allowed",
                ...(isUseButtonHover && generatedImages.length > 0
                  ? styles.buttonHover
                  : {}),
              }}
              disabled={generatedImages.length === 0}
            >
              이미지 사용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySelector = ({
  label,
  options,
  selected,
  onSelect,
  hoverOption,
  setHoverOption,
  category,
}) => (
  <div style={styles.category}>
    <h4 style={styles.categoryLabel}>{label}</h4>
    <div style={styles.optionsContainer}>
      {options.map((option) => {
        const isSelected = selected === option;
        const isHovered = hoverOption === `${category}-${option}`;

        // 옵션 버튼 호버 스타일
        const optionHoverStyle = isHovered
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              backgroundColor: isSelected ? "#3980d3" : "#d0d6e6",
            }
          : {};

        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            onMouseEnter={() => setHoverOption(`${category}-${option}`)}
            onMouseLeave={() => setHoverOption(null)}
            style={{
              ...styles.optionButton,
              backgroundColor: isSelected ? "#4A90E2" : "#e1e5f2",
              color: isSelected ? "white" : "#333",
              ...optionHoverStyle,
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    // marginTop: '80px', // 헤더 높이 고려
    // backgroundColor: '#f5f5f5',
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
    position: "relative", // 화살표의 상대 위치 설정을 위해
  },
  inputTitleContainer: {
    backgroundColor: "#f5f7fa",
    padding: "15px 20px",
    borderBottom: "1px solid #e5e5e5",
  },
  resultTitleWithArrow: {
    backgroundColor: "#4c5873",
    height: "50px",
    display: "flex",
    alignItems: "center",
    paddingLeft: "30px", // 화살표 공간 확보
    position: "relative", // 화살표의 상대 위치 설정을 위해
    borderBottom: "1px solid #e5e5e5",
  },
  arrow: {
    position: "absolute",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    borderTop: "25px solid transparent", // 위쪽 삼각형 (title 높이의 절반)
    borderBottom: "25px solid transparent", // 아래쪽 삼각형 (title 높이의 절반)
    borderLeft: "10px solid #f5f5f5", // 배경색과 같은 색상으로 왼쪽 화살표
    marginLeft: "-10px", // 왼쪽으로 삼각형 크기만큼 이동
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
    color: "white",
  },
  panelContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "auto", // 내용이 많을 경우 스크롤
  },
  subTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  selectedKeyword: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#f4f4f9",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  keywordInput: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginTop: "5px",
    boxSizing: "border-box",
  },
  textAreaContainer: {
    marginBottom: "15px",
  },
  textArea: {
    width: "100%",
    height: "180px", // 높이 증가
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    resize: "none",
    boxSizing: "border-box",
    lineHeight: "1.5",
    overflowY: "auto",
  },
  keywordContainer: {
    marginBottom: "15px",
  },
  categoriesContainer: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  categoryColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  category: {
    marginBottom: "5px",
  },
  categoryLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  optionsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  optionButton: {
    width: "96px", // 고정 너비 설정
    padding: "8px 10px",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    fontWeight: "500",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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
    marginTop: "auto", // 버튼을 컨텐츠 영역 하단에 배치
    marginBottom: "10px",
  },
  buttonHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#3980d3",
  },
  imageDisplay: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px",
    overflow: "hidden",
    background: "#aaa",
    marginBottom: "20px",
    minHeight: "400px", // 이미지 디스플레이 최소 높이 설정
  },
  noImageMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "300px",
    width: "100%",
    color: "#999",
    fontSize: "16px",
  },
};

export default ImageGeneration;
