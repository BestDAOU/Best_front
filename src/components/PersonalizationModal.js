import React, { useState, useEffect } from "react";
import axios from "axios";
import tonesobj from "../data/tones.json";
import MessageAnimation from "../components/MessageAnimation";
import examplesobj from "../data/examples.json"; // 예시목록들 가져오기
import UploadToneModal from "../components/UploadToneModal"; // 상단 import
import PersonalizationService from "../services/PersonalizationService"; // Import the OpenAI service

const PersonalizationModal = ({
  selectedContacts,
  closeModal,
  convertedTexts,
  setConvertedTexts,
  onComplete,
  message,
  //추가
  setContacts, // 추가
  //
}) => {
  // 톤 선택 버튼을 렌더링하기 위한 톤 목록
  const tones = tonesobj;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({}); // 선택된 톤 상태

  const currentContact = selectedContacts[currentIndex];
  // 기존 isHovering → 새로운 state로 변경
  const [hoveringTarget, setHoveringTarget] = useState(null);
  const [selectedToneExamples, setSelectedToneExamples] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);



  // handleToneSelection 함수 추가
  const handleToneSelection = (toneInstruction) => {
    if (currentContact) {
      const tone = tones.find((tone) => tone.instruction === toneInstruction);
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: toneInstruction,
      }));

      // examples.json에서 label로 예시 가져오기
      const matchingExamples = examplesobj.find(
        (example) => example.label === tone.label
      );
      setSelectedToneExamples(
        matchingExamples ? matchingExamples.examples : []
      );
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
  // 현재 연락처의 기본 선택된 어조 설정
  useEffect(() => {
    if (currentContact) {
      // 이미 선택된 어조가 있으면 유지, 없으면 기본 어조로 초기화
      setSelectedTones((prev) => {
        if (prev[currentContact.id]) return prev; // 기존 선택값 유지
        const defaultTone = tones.find(
          (tone) => tone.label === currentContact.tone
        );
        return {
          ...prev,
          [currentContact.id]: defaultTone
            ? defaultTone.instruction
            : "기본 말투로",
        };
      });

      // examples.json에서 초기 예시 가져오기
      const defaultTone = tones.find(
        (tone) => tone.label === currentContact.tone
      );
      if (defaultTone) {
        const matchingExamples = examplesobj.find(
          (example) => example.label === defaultTone.label
        );
        setSelectedToneExamples(
          matchingExamples ? matchingExamples.examples : []
        );
      } else {
        setSelectedToneExamples([]); // 예시가 없으면 빈 배열
      }
    }
  }, [currentContact, tones]);

  const handleConvert = async () => {
    const textToConvert = convertedTexts[currentContact.id] || ""; //변환된 문자 배열 중 현재 수신자의 id
    if (!textToConvert) {
      alert("변환할 텍스트를 입력하세요.");
      return;
    }

    const selectedToneInstruction = selectedTones[currentContact.id]; // 선택된 유저의 선택된 어조 추출

    // 톤.json에서 선택된 톤에 대한 라벨,설명,예시 정보 추출
    const selectedToneData = tones.find(
      (tone) => tone.instruction === selectedToneInstruction
    );
    if (!selectedToneData) {
      alert("선택된 톤에 대한 데이터를 찾을 수 없습니다.");
      return;
    }

    // 예시들이 배열이어서 한개의 문자열로 바꿈
    const examplesText = selectedToneData.examples
      .map((example, index) => `Example ${index + 1}: "${example}"`)
      .join("\n");

    setLoading(true);

    try {
      // OpenAI 서비스 호출
      const originalMessage = await PersonalizationService.convertText({
        text: textToConvert,
        name: currentContact.name,
        tag: currentContact.tag,
        memo: currentContact.memo,
        instruction: selectedToneData.instruction,
        examplesText: examplesText,
      });
      // 이모지 제거 후 ContactList의 convertedTexts 업데이트
      const cleanedMessage = removeEmojis(originalMessage);
      // 변환된 문자 내용으로 적용
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

  const handleToneFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      console.log("업로드된 파일 내용:", content); // ✅ 콘솔에 출력
    };

    reader.readAsText(file);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {loading && <MessageAnimation />}
        {/* 왼쪽 영역 */}
        <div style={styles.leftSection}>
          <div style={styles.titleWithInlineButton}>
            <h2 style={styles.inlineTitle}>텍스트 개인 맞춤화</h2>
            <input
              type="file"
              accept=".txt"
              onChange={handleToneFileUpload}
              style={{ display: "none" }}
              id="toneFileInput"
            />
            <button
              onClick={() => document.getElementById("toneFileInput").click()}
              style={{
                ...styles.inlineToneExtractButton,
                ...(hoveringTarget === "extract" &&
                  styles.inlineToneExtractButtonHover),
              }}
              onMouseEnter={() => setHoveringTarget("extract")}
              onMouseLeave={() => setHoveringTarget(null)}
            >
              대화 말투 추출
            </button>
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
                  {tones.map((tone) => (
                    <button
                      key={tone.label}
                      type="button"
                      style={{
                        ...styles.toneButton,
                        backgroundColor:
                          selectedTones[currentContact.id] === tone.instruction
                            ? "#4A90E2"
                            : "#e1e5f2", // 선택되지 않은 경우 흰색
                        color:
                          selectedTones[currentContact.id] === tone.instruction
                            ? "white"
                            : "black",
                      }}
                      onClick={() => handleToneSelection(tone.instruction)}
                    >
                      {tone.label}
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
                {/* 선택된 어조의 예시 표시 */}
                {/* 예시 설명 및 렌더링 */}
                <div style={styles.examples}>
                  {selectedToneExamples.length > 0 ? (
                    <>
                      <p style={styles.examplesDescription}>
                        해당 말투는 이런 예시들을 참고합니다:
                      </p>
                      {selectedToneExamples.map((example, index) => (
                        <div key={index} style={styles.exampleCard}>
                          <p style={styles.exampleText}>
                            <strong>예시 {index + 1}: </strong>
                            {example}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p style={styles.noExampleText}>예시가 없습니다.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {showUploadModal && (
          <UploadToneModal
            onClose={() => setShowUploadModal(false)}
            onToneGenerated={(newTone) => {
              // tonesobj가 state일 경우 setTones([...tones, newTone]) 해야 함
              tones.push(newTone); // 현재 구조 기준
              setSelectedTones((prev) => ({
                ...prev,
                [currentContact.id]: newTone.instruction,
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
            >
              ↺ 되돌리기
            </button>
          </div>

          <textarea
            style={styles.textArea}
            value={convertedTexts[currentContact.id] || ""}
            onChange={handleTextChange}
            placeholder="여기에 텍스트가 표시됩니다."
          />
          <div style={styles.pagination}>
            <button onClick={() => setCurrentIndex(0)} style={styles.navButton}>
              처음
            </button>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={styles.navButton}
            >
              이전
            </button>
            <span style={styles.pageInfo}>
              {currentIndex + 1} / {selectedContacts.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === selectedContacts.length - 1}
              style={styles.navButton}
            >
              다음
            </button>
            <button
              onClick={() => setCurrentIndex(selectedContacts.length - 1)}
              style={styles.navButton}
            >
              끝
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
    height: "900px", // 높이 증가
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

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  navButton: {
    backgroundColor: "#4A90E2", // 네비게이션 버튼 색상
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 페이지 정보 색상
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
    backgroundColor: "white", // 흰색 배경
    color: "black", // 검은 텍스트
    fontSize: "15px",
    borderWidth: "3px", // 테두리 두께
    borderStyle: "solid", // 테두리 스타일
    borderColor: "#d3d3d3", // 테두리 색상
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "auto", // 오른쪽 정렬
    transition: "all 0.3s ease", // 부드러운 hover 효과
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
};

export default PersonalizationModal;
