import React, { useState, useEffect } from "react";
import MessageAnimation from "../components/MessageAnimation";
import UploadToneModal from "../components/UploadToneModal"; // 상단 import
import { convertText } from "../services/PersonalizationService"; // Import the OpenAI service
import firstIcon from "../assets/images/firstIcon.png";
import prevIcon from "../assets/images/prevIcon.png";
import nextIcon from "../assets/images/nextIcon.png";
import lastIcon from "../assets/images/lastIcon.png";

const PersonalizationModal = ({
  selectedContacts,
  closeModal,
  convertedTexts,
  setConvertedTexts,
  message,
  //
}) => {
  // 톤 선택 버튼을 렌더링하기 위한 톤 목록
  // const tones = tonesobj;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({}); // 선택된 톤 상태

  const currentContact = selectedContacts[currentIndex];
  // 기존 isHovering → 새로운 state로 변경
  const [hoveringTarget, setHoveringTarget] = useState(null);
  const [selectedToneExamples, setSelectedToneExamples] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);

  // handleToneSelection 함수 추가
  const handleToneSelection = (toneName) => {
    if (currentContact) {
      // toneName을 직접 저장 (단일 선택)
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: toneName,
      }));

      // 해당 톤의 예시 직접 사용
      const matchingTone = currentContact.tonesInfo.find(
        (tone) => tone.name === toneName
      );
      setSelectedToneExamples(matchingTone?.toneExamples || []); // examples → toneExamples
    }
  };

  const handleComplete = () => {
    closeModal();
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, selectedContacts.length - 1)
    );
  };

  // 현재 연락처의 기본 선택된 어조 설정 (useEffect 수정)
  useEffect(() => {
    if (currentContact) {
      // 이미 선택된 어조가 있으면 유지, 없으면 기본 어조로 초기화
      setSelectedTones((prev) => {
        if (prev[currentContact.id]) return prev; // 기존 선택값 유지
        return {
          ...prev,
          [currentContact.id]: currentContact.tone || "", // 기본값은 빈 문자열
        };
      });

      // 기본 선택된 어조의 예시 가져오기
      if (currentContact.tone) {
        // 현재 선택된 톤 정보 찾기
        const matchingTone = currentContact.tonesInfo.find(
          (tone) => tone.name === currentContact.tone
        );

        // 해당 톤의 예시 직접 사용
        setSelectedToneExamples(matchingTone?.toneExamples || []); // examples → toneExamples
      } else {
        setSelectedToneExamples([]); // 예시가 없으면 빈 배열
      }
    }
  }, [currentContact]);

  // handleConvert 함수 수정
  const handleConvert = async () => {
    const textToConvert = convertedTexts[currentContact.id] || "";
    if (!textToConvert) {
      alert("변환할 텍스트를 입력하세요.");
      return;
    }

    const selectedToneName = selectedTones[currentContact.id]; // 선택된 톤 이름

    if (!selectedToneName) {
      alert("어조를 선택해주세요.");
      return;
    }

    // currentContact.tonesInfo에서 선택된 톤 정보를 찾음
    const selectedToneData = currentContact.tonesInfo?.find(
      (tone) => tone.name === selectedToneName
    );

    if (!selectedToneData) {
      alert("선택된 톤에 대한 데이터를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);

    try {
      // 선택된 톤의 ID와 텍스트만 전달하는 방식으로 변경
      const originalMessage = await convertText({
        originalText: textToConvert,
        toneId: selectedToneData.id,
      });

      const cleanedMessage = removeEmojis(originalMessage);
      setConvertedTexts((prev) => ({
        ...prev,
        [currentContact.id]: cleanedMessage,
      }));
    } catch (error) {
      console.error(
        "API 호출 오류:",
        error.response ? error.response.data : error.message
      );
      alert("텍스트 변환에 실패했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
  };

  const removeEmojis = (text) => {
    return text.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ""
    );
  };

  const handleTextChange = (e) => {
    const { value } = e.target;
    setConvertedTexts((prev) => ({
      ...prev,
      [currentContact.id]: value,
    }));
  };
  const initMessage = () => {
    setConvertedTexts((prev) => ({
      ...prev,
      [currentContact.id]: message, // 현재 연락처의 텍스트를 기본 메시지로 변경
    }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {loading && <MessageAnimation />}
        {/* 왼쪽 영역 */}
        <div style={styles.leftSection}>
          <div style={styles.titleWithInlineButton}>
            <h2 style={styles.inlineTitle}>텍스트 개인 맞춤화</h2>
          </div>

          {currentContact && (
            <>
              <div style={styles.inputGroup}>
                <label>이름:</label>
                <input
                  type="text"
                  value={currentContact.name}
                  readOnly
                  style={styles.inputField}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>특징:</label>
                <input
                  type="text"
                  value={currentContact.tag}
                  readOnly
                  style={styles.inputField}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>기억:</label>
                <input
                  type="text"
                  value={currentContact.memo}
                  readOnly
                  style={styles.inputField}
                />
              </div>

              <div style={styles.toneSelection}>
                <label>말투 선택:</label>
                <div style={styles.toneButtons}>
                  {/* 현재 연락처의 모든 tonesInfo 사용 (중복 제거 없음) */}
                  {currentContact.tonesInfo &&
                    currentContact.tonesInfo.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        style={{
                          ...styles.toneButton,
                          backgroundColor:
                            selectedTones[currentContact.id] === tone.name
                              ? "#4A90E2"
                              : "#e1e5f2",
                          color:
                            selectedTones[currentContact.id] === tone.name
                              ? "white"
                              : "black",
                        }}
                        onClick={() => handleToneSelection(tone.name)}
                      >
                        {tone.name}
                      </button>
                    ))}
                  <button
                    type="button"
                    style={{
                      ...styles.toneButton,
                      border: "1.5px dashed #4A90E2",
                      color: "#4A90E2",
                      backgroundColor: "#ffffff",
                      fontWeight: "bold",
                      ...(hoveringTarget === "generate" && {
                        backgroundColor: "#e8f1fd",
                      }),
                    }}
                    onClick={() => setShowUploadModal(true)}
                    onMouseEnter={() => setHoveringTarget("generate")}
                    onMouseLeave={() => setHoveringTarget(null)}
                  >
                    + 말투 생성
                  </button>
                </div>

                {/* 선택된 어조의 예시 표시 - 스크롤바 추가 */}
                <div style={styles.examples}>
                  {selectedToneExamples.length > 0 ? (
                    <>
                      <p style={styles.examplesDescription}>
                        해당 말투는 이런 예시들을 참고합니다:
                      </p>
                      <div style={styles.examplesContainer}>
                        {selectedToneExamples.map((example, index) => (
                          <div key={index} style={styles.exampleCard}>
                            <p style={styles.exampleText}>
                              <strong>예시 {index + 1}: </strong>
                              {example}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={styles.noExampleText}>예시가 없습니다.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 업로드 모달 부분 수정 - 새로운 어조가 추가되면 현재 연락처의 tonesInfo에도 추가 */}
        {showUploadModal && (
          <UploadToneModal
            onClose={() => setShowUploadModal(false)}
            friendId={currentContact?.id}
            onToneGenerated={(newTone) => {
              // 현재 연락처의 tonesInfo에 새 어조 추가
              if (currentContact && currentContact.tonesInfo) {
                currentContact.tonesInfo.push({
                  id: Date.now(), // 임시 ID 생성
                  name: newTone.label,
                  default: false,
                });
              }
              setSelectedTones((prev) => ({
                ...prev,
                [currentContact.id]: newTone.label,
              }));
            }}
          />
        )}

        {/* 오른쪽 영역 */}
        <div style={styles.rightSection}>
          <div style={styles.convertSection}>
            <span style={styles.convertLabel}>텍스트 변환</span>
            <button
              type="button"
              onClick={handleConvert}
              disabled={loading}
              onMouseEnter={() => setHoveringTarget("convert")}
              onMouseLeave={() => setHoveringTarget(null)}
              style={{
                ...styles.convertButton,
                ...(hoveringTarget === "convert" && styles.convertButtonHover),
              }}
            >
              {loading ? "변환 중..." : "변환"}
            </button>
            <button
              type="button"
              onClick={initMessage}
              onMouseEnter={() => setHoveringTarget("reset")}
              onMouseLeave={() => setHoveringTarget(null)}
              style={{
                ...styles.resetButton,
                ...(hoveringTarget === "reset" && styles.resetButtonHover),
              }}
              title="원본 메시지로 초기화" // 툴팁으로 설명 추가
            >
              ↺
            </button>
          </div>

          <textarea
            style={styles.textArea}
            value={convertedTexts[currentContact.id] || ""}
            onChange={handleTextChange}
            placeholder="여기에 텍스트가 표시됩니다."
          />
          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentIndex(0)}
              style={{
                ...styles.navButton,
                ...(currentIndex === 0 ? styles.navButtonDisabled : {}),
                ...(hoveringTarget === "first" && currentIndex !== 0
                  ? styles.navButtonHover
                  : {}),
              }}
              disabled={currentIndex === 0}
              onMouseEnter={() => setHoveringTarget("first")}
              onMouseLeave={() => setHoveringTarget(null)}
            >
              <img
                src={firstIcon}
                alt="처음으로 이동"
                style={{
                  width: "15px",
                  height: "auto",
                  objectFit: "contain",
                  marginTop: "2px",
                  opacity: currentIndex === 0 ? 0.4 : 1,
                }}
              />
            </button>
            <button
              onClick={handlePrev}
              style={{
                ...styles.navButton,
                ...(currentIndex === 0 ? styles.navButtonDisabled : {}),
                ...(hoveringTarget === "prev" && currentIndex !== 0
                  ? styles.navButtonHover
                  : {}),
              }}
              disabled={currentIndex === 0}
              onMouseEnter={() => setHoveringTarget("prev")}
              onMouseLeave={() => setHoveringTarget(null)}
            >
              <img
                src={prevIcon}
                alt="이전으로 이동"
                style={{
                  width: "11px",
                  height: "auto",
                  objectFit: "contain",
                  marginTop: "2px",
                  opacity: currentIndex === 0 ? 0.4 : 1,
                }}
              />
            </button>
            <span style={styles.pageInfo}>
              {currentIndex + 1} / {selectedContacts.length}
            </span>
            <button
              onClick={handleNext}
              style={{
                ...styles.navButton,
                ...styles.arrowButton,
                ...(currentIndex === selectedContacts.length - 1
                  ? styles.navButtonDisabled
                  : {}),
                ...(hoveringTarget === "next" &&
                currentIndex !== selectedContacts.length - 1
                  ? styles.navButtonHover
                  : {}),
              }}
              disabled={currentIndex === selectedContacts.length - 1}
              onMouseEnter={() => setHoveringTarget("next")}
              onMouseLeave={() => setHoveringTarget(null)}
            >
              <img
                src={nextIcon}
                alt="다음으로 이동"
                style={{
                  width: "11px",
                  height: "auto", // 👉 원본 비율 유지
                  objectFit: "contain", // 👉 필요 시 비율 보존
                  marginTop: "2px",
                  opacity:
                    currentIndex === selectedContacts.length - 1 ? 0.4 : 1,
                }}
              />
            </button>
            <button
              onClick={() => setCurrentIndex(selectedContacts.length - 1)}
              style={{
                ...styles.navButton,
                ...styles.mediaButton,
                ...(currentIndex === selectedContacts.length - 1
                  ? styles.navButtonDisabled
                  : {}),
                ...(hoveringTarget === "last" &&
                currentIndex !== selectedContacts.length - 1
                  ? styles.navButtonHover
                  : {}),
              }}
              disabled={currentIndex === selectedContacts.length - 1}
              onMouseEnter={() => setHoveringTarget("last")}
              onMouseLeave={() => setHoveringTarget(null)}
            >
              <img
                src={lastIcon}
                alt="끝으로 이동"
                style={{
                  width: "15px",
                  height: "auto", // 👉 원본 비율 유지
                  objectFit: "contain", // 👉 필요 시 비율 보존
                  marginTop: "5px",
                  opacity:
                    currentIndex === selectedContacts.length - 1 ? 0.4 : 1,
                }}
              />
            </button>
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={closeModal} style={styles.closeButton}>
              닫기
            </button>
            {/* <button onClick={onComplete} style={styles.completeButton}>
            완료
          </button> */}
            <button onClick={handleComplete} style={styles.completeButton}>
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "1200px", // 너비 증가
    height: "98%", // 높이 증가
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
    display: "flex", // 좌우 레이아웃
    gap: "20px", // 좌우 간격
    overflowY: "auto",
  },
  leftSection: {
    flex: 1.7, // 왼쪽 섹션 크기 조정
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  rightSection: {
    flex: 1.4, // 오른쪽 섹션 크기 조정
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  textArea: {
    flex: 1, // 오른쪽 영역에서 입력창이 충분히 커지도록
    marginTop: "15px",
    padding: "12px",
    fontSize: "18px",
    lineHeight: "1.6", // 줄 간격 조정 (가독성 향상)
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    boxSizing: "border-box",
    height: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  inputField: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  toneSelection: {
    marginBottom: "15px",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
  toneButton: {
    padding: "12px 12px",
    border: "1px solid white",
    borderRadius: "20px",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    color: "black",
  },
  convertSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  convertLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 라벨 색상
  },
  convertButton: {
    backgroundColor: "#4A90E2", // 버튼 색상
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },

  // 페이지네이션 컨테이너 스타일 수정
  pagination: {
    display: "flex",
    justifyContent: "center", // 중앙 정렬
    alignItems: "center", // 수직 중앙 정렬
    gap: "40px", // 버튼 사이 간격 늘림
    marginTop: "15px",
  },

  navButton: {
    backgroundColor: "transparent",
    color: "#4A90E2",
    border: "none",
    padding: "5px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "bold",
    minWidth: "30px",
    height: "30px", // 높이 고정
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // 수직 정렬
    boxShadow: "none",
    lineHeight: 1, // 라인 높이를 1로 통일
  },

  pageInfo: {
    fontSize: "16px",
    fontWeight: "",
    color: "#333", // 색상 변경
    margin: "0 10px", // 좌우 여백 추가
  },

  // disabled 상태일 때의 스타일도 추가
  navButtonDisabled: {
    color: "#cccccc", // 비활성화 상태일 때 연한 회색
    cursor: "default", // 비활성화 상태일 때 커서 변경
  },

  // hover 상태일 때의 스타일 추가
  navButtonHover: {
    color: "#3a78c2", // 호버 시 색상 변경
    transform: "scale(1.2)", // 호버 시 약간 확대
  },

  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px", // 닫기와 완료 버튼 간격 추가
    marginTop: "20px",
  },
  closeButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
  completeButton: {
    backgroundColor: "#4A90E2", // 완료 버튼 색상
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
  resetButton: {
    backgroundColor: "white",
    color: "black",
    fontSize: "22px",
    fontWeight: "500", // 중간 정도 두께로 설정 (normal과 bold 사이)
    padding: "7px 11px", // 패딩 약간 증가
    cursor: "pointer",
    marginLeft: "auto",
    transition: "all 0.3s ease",
    border: "none", // ✅ 테두리 없애기
  },
  resetButtonHover: {
    backgroundColor: "#f0f0f0", // hover 시 밝은 회색 배경
    borderColor: "#b0b0b0", // hover 시 테두리 색상 변경
    transform: "scale(1.02)", // 약간 커짐
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // 눌리는 느낌의 그림자
  },
  examples: {
    marginTop: "20px", // 어조 선택 버튼과 예시 간의 간격
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  // 스크롤바 컨테이너 추가
  examplesContainer: {
    maxHeight: "290px", // 최대 높이 제한
    overflowY: "auto", // 세로 스크롤바 추가
    marginRight: "-5px", // 오른쪽 패딩을 줄여서 스크롤바 공간 확보
    paddingRight: "5px", // 스크롤바와 내용 사이 간격
    // 스크롤바 스타일 커스터마이징 (webkit 기반 브라우저)
    scrollbarWidth: "thin", // Firefox
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#a8a8a8",
    },
  },
  examplesDescription: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: "15px", // 설명과 예시 카드 간의 간격
  },
  exampleCard: {
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "15px", // 각 예시 카드 간의 간격
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  exampleText: {
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.5",
  },
  noExampleText: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
  },
  titleWithInlineButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px", // 제목과 버튼 사이 간격
    marginBottom: "20px",
  },
  inlineToneExtractButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "regular",
    transition: "0.3s",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    height: "32px", // 텍스트 높이와 잘 맞게
    lineHeight: "1", // 텍스트 수직 정렬
  },
  convertButtonHover: {
    backgroundColor: "#3a78c2",
    transform: "scale(1.05)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },

  inlineToneExtractButtonHover: {
    backgroundColor: "#3a78c2",
    transform: "scale(1.05)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
  inlineTitle: {
    margin: 0,
  },
};

export default PersonalizationModal;
