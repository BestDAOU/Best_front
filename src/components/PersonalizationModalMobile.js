import React, { useState, useEffect } from "react";
import MessageAnimation from "../components/MessageAnimation";
import UploadToneModal from "../components/UploadToneModal";
import { convertText } from "../services/PersonalizationService";
import { getToneByFriendId } from "../services/ToneService";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaRedo, 
  FaTimes,
  FaUser,
  FaTag,
  FaStickyNote,
  FaComments
} from "react-icons/fa";

const PersonalizationModalMobile = ({
  selectedContacts,
  closeModal,
  convertedTexts,
  setConvertedTexts,
  message,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({});

  // 모달 열릴 때 배경 스크롤 방지
  useEffect(() => {
    // 모달이 열렸을 때 body 스크롤 막기
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // 모바일에서 추가적인 스크롤 방지
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = '100%';
    
    // 저장된 스크롤 위치
    const scrollY = window.scrollY;
    
    return () => {
      // 모달이 닫힐 때 원래 상태로 복원
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // 스크롤 위치 복원
      window.scrollTo(0, scrollY);
    };
  }, []);

  // 톤 상태 관리
  const [tones, setTones] = useState([]);
  const [tonesLoading, setTonesLoading] = useState(false);
  const [currentContactTones, setCurrentContactTones] = useState({});

  const currentContact = selectedContacts[currentIndex];
  const [selectedToneExamples, setSelectedToneExamples] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedExamples, setExpandedExamples] = useState(false);

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
        console.log(`📦 모바일 - ${currentContact.name}의 어조 목록:`, friendTones);

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

        {/* 헤더 */}
        <div style={styles.header}>
          <button style={styles.closeButton} onClick={closeModal}>
            <FaTimes size={16} />
          </button>
          <h2 style={styles.title}>텍스트 개인 맞춤화</h2>
          <div style={styles.placeholder}></div>
        </div>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div style={styles.scrollableContent}>
          {/* 연락처 네비게이션 */}
          <div style={styles.navigation}>
            <button
              style={{
                ...styles.navButton,
                ...(currentIndex === 0 ? styles.navButtonDisabled : {}),
              }}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft size={14} />
            </button>
            
            <div style={styles.contactInfo}>
              <span style={styles.contactName}>{currentContact?.name}</span>
              <span style={styles.contactCounter}>
                {currentIndex + 1} / {selectedContacts.length}
              </span>
            </div>
            
            <button
              style={{
                ...styles.navButton,
                ...(currentIndex === selectedContacts.length - 1 ? styles.navButtonDisabled : {}),
              }}
              onClick={handleNext}
              disabled={currentIndex === selectedContacts.length - 1}
            >
              <FaChevronRight size={14} />
            </button>
          </div>

          {/* 연락처 상세 정보 */}
          {currentContact && (
            <div style={styles.contactDetails}>
              <div style={styles.detailItem}>
                <FaUser size={12} style={styles.detailIcon} />
                <span style={styles.detailLabel}>이름:</span>
                <span style={styles.detailValue}>{currentContact.name}</span>
              </div>
              
              <div style={styles.detailItem}>
                <FaTag size={12} style={styles.detailIcon} />
                <span style={styles.detailLabel}>특징:</span>
                <span style={styles.detailValue}>{currentContact.tag || "없음"}</span>
              </div>
              
              <div style={styles.detailItem}>
                <FaStickyNote size={12} style={styles.detailIcon} />
                <span style={styles.detailLabel}>기억:</span>
                <span style={styles.detailValue}>{currentContact.memo || "없음"}</span>
              </div>
            </div>
          )}

          {/* 말투 선택 섹션 */}
          <div style={styles.toneSection}>
            <div style={styles.sectionHeader}>
              <FaComments size={14} style={styles.sectionIcon} />
              <span style={styles.sectionTitle}>말투 선택</span>
            </div>
            
            <div style={styles.toneButtons}>
              {tonesLoading ? (
                <div style={styles.loadingText}>어조 목록을 불러오는 중...</div>
              ) : tones.length > 0 ? (
                tones.map((tone) => (
                  <button
                    key={tone.id}
                    style={{
                      ...styles.toneButton,
                      backgroundColor:
                        selectedTones[currentContact.id] === tone.name
                          ? "#4A90E2"
                          : "#f8f9fa",
                      color:
                        selectedTones[currentContact.id] === tone.name
                          ? "white"
                          : "#333",
                      borderColor:
                        selectedTones[currentContact.id] === tone.name
                          ? "#4A90E2"
                          : "#ddd",
                    }}
                    onClick={() => handleToneSelection(tone.name)}
                    title={tone.instruction}
                  >
                    {tone.name}
                  </button>
                ))
              ) : (
                <div style={styles.noTonesText}>해당 친구의 어조가 없습니다.</div>
              )}

              <button
                style={styles.addToneButton}
                onClick={() => setShowUploadModal(true)}
              >
                + 말투 생성
              </button>
            </div>

            {/* 선택된 어조의 예시 */}
            {selectedToneExamples.length > 0 && (
              <div style={styles.examples}>
                <button
                  style={styles.examplesToggle}
                  onClick={() => setExpandedExamples(!expandedExamples)}
                >
                  <span>예시 보기 ({selectedToneExamples.length}개)</span>
                  <span>{expandedExamples ? "−" : "+"}</span>
                </button>
                
                {expandedExamples && (
                  <div style={styles.examplesContainer}>
                    {selectedToneExamples.map((example, index) => (
                      <div key={index} style={styles.exampleCard}>
                        <span style={styles.exampleIndex}>예시 {index + 1}</span>
                        <p style={styles.exampleText}>{example}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 텍스트 변환 섹션 */}
          <div style={styles.convertSection}>
            <div style={styles.convertHeader}>
              <span style={styles.convertTitle}>텍스트 변환</span>
              <div style={styles.convertActions}>
                <button
                  style={styles.resetButton}
                  onClick={initMessage}
                  title="원본 메시지로 초기화"
                >
                  <FaRedo size={12} />
                </button>
                <button
                  style={styles.convertButton}
                  onClick={handleConvert}
                  disabled={loading}
                >
                  {loading ? "변환 중..." : "변환"}
                </button>
              </div>
            </div>
            
            <textarea
              style={styles.textArea}
              value={convertedTexts[currentContact?.id] || ""}
              onChange={handleTextChange}
              placeholder="여기에 텍스트가 표시됩니다."
              rows={8}
            />
          </div>
        </div>

        {/* 업로드 모달 */}
        {showUploadModal && (
          <UploadToneModal
            onClose={() => setShowUploadModal(false)}
            friendId={currentContact?.id}
            onToneGenerated={(newTone) => {
              const newToneData = {
                id: Date.now(),
                name: newTone.label,
                instruction: newTone.instruction || "",
                examples: newTone.examples || "",
                friend_id: currentContact.id,
                default: false,
              };

              setTones((prevTones) => [...prevTones, newToneData]);

              setCurrentContactTones((prev) => ({
                ...prev,
                [currentContact.id]: [
                  ...(prev[currentContact.id] || []),
                  newToneData,
                ],
              }));

              setSelectedTones((prev) => ({
                ...prev,
                [currentContact.id]: newTone.label,
              }));

              updateToneExamples(newTone.label);
            }}
          />
        )}

        {/* 하단 버튼 */}
        <div style={styles.bottomActions}>
          <button style={styles.cancelButton} onClick={closeModal}>
            닫기
          </button>
          <button style={styles.completeButton} onClick={handleComplete}>
            완료
          </button>
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
    // alignItems: "center",
    alignItems: "flex-start",
paddingTop: "1px", // 원하는 거리로 조정
    zIndex: 1000,
    padding: "16px",
    boxSizing: "border-box",
    // 모바일에서 스크롤 방지를 위한 추가 스타일
    overscrollBehavior: "contain",
    touchAction: "none",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    height: "92vh", // maxHeight에서 height로 변경
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    overflow: "hidden", // 전체 모달의 overflow는 hidden
    // 모달 내부에서만 스크롤 허용
    overscrollBehavior: "contain",
  },
  // 새로운 스크롤 가능한 컨텐츠 영역 스타일 추가
  scrollableContent: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    // 모바일에서 부드러운 스크롤
    WebkitOverflowScrolling: "touch",
    // 스크롤바 커스터마이징 (웹킷 기반 브라우저)
    scrollbarWidth: "thin",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#fafafa",
  },
  closeButton: {
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    color: "#666",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },
  placeholder: {
    width: "32px",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0, // 네비게이션이 축소되지 않도록
  },
  navButton: {
    padding: "8px 12px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
    height: "36px",
  },
  navButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  contactInfo: {
    textAlign: "center",
    flex: 1,
    margin: "0 16px",
  },
  contactName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    display: "block",
  },
  contactCounter: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
    display: "block",
  },
  contactDetails: {
    padding: "16px 20px",
    backgroundColor: "white",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0, // 연락처 상세 정보가 축소되지 않도록
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "14px",
  },
  detailIcon: {
    color: "#4A90E2",
    marginRight: "8px",
    minWidth: "16px",
  },
  detailLabel: {
    fontWeight: "500",
    color: "#333",
    minWidth: "50px",
    marginRight: "8px",
  },
  detailValue: {
    color: "#666",
    flex: 1,
  },
  toneSection: {
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "white",
    flexShrink: 0, // 톤 섹션이 축소되지 않도록
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  sectionIcon: {
    color: "#4A90E2",
    marginRight: "8px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  toneButton: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addToneButton: {
    padding: "8px 12px",
    border: "1.5px dashed #4A90E2",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "white",
    color: "#4A90E2",
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    padding: "12px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    fontSize: "14px",
  },
  noTonesText: {
    padding: "12px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
  examples: {
    marginTop: "12px",
  },
  examplesToggle: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "500",
  },
  examplesContainer: {
    marginTop: "8px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  exampleCard: {
    backgroundColor: "#f9f9f9",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    marginBottom: "8px",
  },
  exampleIndex: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#4A90E2",
    display: "block",
    marginBottom: "4px",
  },
  exampleText: {
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.4",
    margin: 0,
  },
  convertSection: {
    padding: "16px 20px",
    backgroundColor: "white",
    flex: 1, // 남은 공간을 모두 차지
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // flex item이 축소될 수 있도록
  },
  convertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  convertTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  convertActions: {
    display: "flex",
    gap: "8px",
  },
  resetButton: {
    padding: "8px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  convertButton: {
    padding: "8px 16px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    minHeight: "36px",
  },
  textArea: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "120px",
  },
  bottomActions: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#fafafa",
    flexShrink: 0, // 하단 버튼이 축소되지 않도록
  },
  cancelButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  completeButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default PersonalizationModalMobile;