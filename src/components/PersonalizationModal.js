import React, { useState, useEffect } from "react";
import MessageAnimation from "../components/MessageAnimation";
import UploadToneModal from "../components/UploadToneModal";
import { convertText } from "../services/PersonalizationService";
import { getToneByFriendId } from "../services/ToneService"; // 톤 서비스 추가
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({});

  // 톤 상태 관리 추가
  const [tones, setTones] = useState([]);
  const [tonesLoading, setTonesLoading] = useState(false);
  const [currentContactTones, setCurrentContactTones] = useState({}); // 각 연락처별 톤 캐시

  const currentContact = selectedContacts[currentIndex];
  const [hoveringTarget, setHoveringTarget] = useState(null);
  const [selectedToneExamples, setSelectedToneExamples] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 현재 연락처가 변경될 때마다 해당 연락처의 톤 목록 가져오기
  useEffect(() => {
    const fetchContactTones = async () => {
      if (!currentContact) return;

      // 이미 캐시된 톤이 있으면 사용
      if (currentContactTones[currentContact.id]) {
        setTones(currentContactTones[currentContact.id]);
        return;
      }

      try {
        setTonesLoading(true);
        const friendTones = await getToneByFriendId(currentContact.id);
        console.log(`📦 ${currentContact.name}의 어조 목록:`, friendTones);

        const tonesArray = Array.isArray(friendTones) ? friendTones : [];
        setTones(tonesArray);

        // 캐시에 저장
        setCurrentContactTones((prev) => ({
          ...prev,
          [currentContact.id]: tonesArray,
        }));
      } catch (error) {
        console.error("친구 어조 불러오기 오류:", error);
        setTones([]);
      } finally {
        setTonesLoading(false);
      }
    };

    fetchContactTones();
  }, [currentContact?.id, currentContactTones]);

  // 선택된 톤 ID로 톤 이름 찾기 헬퍼 함수
  const getToneNameById = (toneId) => {
    if (!tones || !Array.isArray(tones) || tones.length === 0) {
      return "";
    }
    const tone = tones.find((t) => t.id === toneId);
    return tone ? tone.name : "";
  };

  // 선택된 톤으로 예시 업데이트
  const updateToneExamples = (toneName) => {
    if (!toneName || !tones.length) {
      setSelectedToneExamples([]);
      return;
    }

    const matchingTone = tones.find((tone) => tone.name === toneName);
    if (matchingTone && matchingTone.examples) {
      // examples가 문자열이면 쉼표로 분리, 배열이면 그대로 사용
      const examples =
        typeof matchingTone.examples === "string"
          ? matchingTone.examples
              .split(",")
              .map((ex) => ex.trim())
              .filter((ex) => ex)
          : Array.isArray(matchingTone.examples)
          ? matchingTone.examples
          : [];
      setSelectedToneExamples(examples);
    } else {
      setSelectedToneExamples([]);
    }
  };

  // 톤 선택 핸들러
  const handleToneSelection = (toneName) => {
    if (currentContact) {
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: toneName,
      }));

      updateToneExamples(toneName);
    }
  };

  // 현재 연락처 변경 시 기본 톤 설정
  useEffect(() => {
    if (currentContact && tones.length > 0) {
      // 이미 선택된 어조가 있으면 유지
      if (selectedTones[currentContact.id]) {
        updateToneExamples(selectedTones[currentContact.id]);
        return;
      }

      // 연락처에 selectedToneId가 있으면 해당 톤으로 설정
      if (currentContact.selectedToneId) {
        const toneName = getToneNameById(currentContact.selectedToneId);
        if (toneName) {
          setSelectedTones((prev) => ({
            ...prev,
            [currentContact.id]: toneName,
          }));
          updateToneExamples(toneName);
          return;
        }
      }

      // 기본값 설정 (첫 번째 톤 또는 빈 문자열)
      const defaultTone = tones.length > 0 ? tones[0].name : "";
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: defaultTone,
      }));
      updateToneExamples(defaultTone);
    }
  }, [currentContact, tones, selectedTones]);

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

  // 텍스트 변환 핸들러
  const handleConvert = async () => {
    const textToConvert = convertedTexts[currentContact.id] || "";
    if (!textToConvert) {
      alert("변환할 텍스트를 입력하세요.");
      return;
    }

    const selectedToneName = selectedTones[currentContact.id];
    if (!selectedToneName) {
      alert("어조를 선택해주세요.");
      return;
    }

    // 현재 톤 목록에서 선택된 톤 정보 찾기
    const selectedToneData = tones.find(
      (tone) => tone.name === selectedToneName
    );
    if (!selectedToneData) {
      alert("선택된 톤에 대한 데이터를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);

    try {
      const originalMessage = await convertText({
        originalText: textToConvert,
        toneId: selectedToneData.id,
        friendId: currentContact.id,
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
      [currentContact.id]: message,
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
                  value={currentContact.tag || ""}
                  readOnly
                  style={styles.inputField}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>기억:</label>
                <input
                  type="text"
                  value={currentContact.memo || ""}
                  readOnly
                  style={styles.inputField}
                />
              </div>

              <div style={styles.toneSelection}>
                <label>말투 선택:</label>
                <div style={styles.toneButtons}>
                  {tonesLoading ? (
                    <div style={styles.loadingText}>
                      어조 목록을 불러오는 중...
                    </div>
                  ) : tones.length > 0 ? (
                    tones.map((tone) => (
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
                        title={tone.instruction} // 툴팁으로 설명 표시
                      >
                        {tone.name}
                      </button>
                    ))
                  ) : (
                    <div style={styles.noTonesText}>
                      해당 친구의 어조가 없습니다.
                    </div>
                  )}

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

                {/* 선택된 어조의 예시 표시 */}
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

        {/* 업로드 모달 */}
        {showUploadModal && (
          <UploadToneModal
            onClose={() => setShowUploadModal(false)}
            friendId={currentContact?.id}
            onToneGenerated={(newTone) => {
              // 새 어조가 생성되면 현재 톤 목록에 추가
              const newToneData = {
                id: newTone.id,
                name: newTone.name,
                instruction: newTone.instruction || "",
                examples: newTone.examples || "",
                friend_id: currentContact.id,
                default: false,
              };
              console.log(newToneData);

              setTones((prevTones) => [...prevTones, newToneData]);

              // 캐시도 업데이트
              setCurrentContactTones((prev) => ({
                ...prev,
                [currentContact.id]: [
                  ...(prev[currentContact.id] || []),
                  newToneData,
                ],
              }));

              // 새 어조를 선택 상태로 설정
              setSelectedTones((prev) => ({
                ...prev,
                [currentContact.id]: newTone.name,
              }));

              updateToneExamples(newTone.name);
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
              title="원본 메시지로 초기화"
            >
              ↺
            </button>
          </div>

          <textarea
            style={styles.textArea}
            value={convertedTexts[currentContact?.id] || ""}
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
                  height: "auto",
                  objectFit: "contain",
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
                  height: "auto",
                  objectFit: "contain",
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
    width: "1200px",
    height: "98%",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
    display: "flex",
    gap: "20px",
    overflowY: "auto",
  },
  leftSection: {
    flex: 1.7,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  rightSection: {
    flex: 1.4,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  textArea: {
    flex: 1,
    marginTop: "15px",
    padding: "12px",
    fontSize: "18px",
    lineHeight: "1.6",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    boxSizing: "border-box",
    height: "400px",
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
  loadingText: {
    padding: "10px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  noTonesText: {
    padding: "10px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
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
    color: "#4A90E2",
  },
  convertButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  convertButtonHover: {
    backgroundColor: "#3a78c2",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
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
    height: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "none",
    lineHeight: 1,
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "",
    color: "#333",
    margin: "0 10px",
  },
  navButtonDisabled: {
    color: "#cccccc",
    cursor: "default",
  },
  navButtonHover: {
    backgroundColor: "#f0f0f0",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
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
    backgroundColor: "#4A90E2",
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
    fontWeight: "500",
    padding: "7px 11px",
    cursor: "pointer",
    marginLeft: "auto",
    transition: "all 0.3s ease",
    border: "none",
  },
  resetButtonHover: {
    backgroundColor: "#f0f0f0",
  },
  examples: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  examplesContainer: {
    maxHeight: "290px",
    overflowY: "auto",
    marginRight: "-5px",
    paddingRight: "5px",
    scrollbarWidth: "thin",
  },
  examplesDescription: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: "15px",
  },
  exampleCard: {
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "15px",
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
    gap: "12px",
    marginBottom: "20px",
  },
  inlineTitle: {
    margin: 0,
  },
};

export default PersonalizationModal;
