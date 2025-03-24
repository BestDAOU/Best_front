//src/pages/MainPage.js
import { FiRotateCw } from "react-icons/fi"; // 되돌리기 아이콘
import { AiOutlineClose } from "react-icons/ai"; // 삭제 아이콘
import { AiOutlineUpload } from "react-icons/ai"; // 업로드 아이콘 추가
import React, { useState } from "react";
import ContactList from "../components/ContactList";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import axios from "axios";
import { DiFirebase } from "react-icons/di";
import { sendMessages } from "../services/PpurioApiService";
import SendAnimation from "../components/SendAnimation";
import Select from "react-select";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// 현재 시간을 기준으로 가장 가까운 5분 단위의 시간 계산
const getInitialReserveTime = () => {
  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;

  let hour = now.getHours();
  let minute = roundedMinutes;
  let date = new Date(now);

  if (roundedMinutes >= 60) {
    hour = (hour + 1) % 24;
    minute = 0;

    if (hour === 0) {
      // 날짜를 하루 증가시켜줌
      date.setDate(date.getDate() + 1);
    }
  }

  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    date,
  };
};

const {
  hour: initialHour,
  minute: initialMinute,
  date: initialDate,
} = getInitialReserveTime();

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 전달된 state에서 메시지와 이미지를 추출
  const messageFromState = location.state?.message || "";
  const [message, setMessage] = useState(messageFromState);
  const [generatedImage, setGeneratedImage] = useState(
    location.state?.generatedImage
  ); // 이미지 상태 관리
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [prevImage, setPrevImage] = useState(null); // 이전 이미지를 저장

  //const generatedImage = location.state?.generatedImage || null; // Retrieve the generated image URL
  const [convertedTexts, setConvertedTexts] = useState({}); // 수신자별 메시지 상태
  const [selectedContacts, setSelectedContacts] = useState([]); // 선택된 연락처 목록
  const [currentContactIndex, setCurrentContactIndex] = useState(0); //현재 어떤 수신자인지 인덱스 표시
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isUploadHovered, setIsUploadHovered] = useState(false); // 업로드 버튼 호버 상태
  const [isLoading, setIsLoading] = useState(false);

  // 즉시, 예약 전송 모드를 위한 변수수
  const [isReserveMode, setIsReserveMode] = useState(false);
  // reserveDate를 Date 객체로 바꿔줘야 함
  const [reserveDate, setReserveDate] = useState(initialDate);
  const [reserveHour, setReserveHour] = useState(initialHour);
  const [reserveMinute, setReserveMinute] = useState(initialMinute);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); //달력 창 열고 닫기 위한 변수
  const formattedDate = reserveDate ? format(reserveDate, "yyyy-MM-dd") : ""; // 년-월-일 형식으로 변환

  // 날짜 선택되면 값 저장 후 닫기
  const handleDateSelect = (date) => {
    setReserveDate(date);
    setIsDatePickerOpen(false); // 선택하면 닫힘
  };

  // 메시지에서 키워드를 추출하는 함수
  const extractKeywords = async (message) => {
    try {
      const prompt = `
        Please extract one single keyword in English from the following message that can be used for image generation.

        메시지: ${message}

        키워드:
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an NLP expert. Extract exactly one relevant keyword in English from the provided message that can be used for image generation. The keyword must be concise and relevant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const keywords = response.data.choices[0].message.content.trim();
      return keywords.split(",").map((keyword) => keyword.trim());
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleImageGeneration = async () => {
    if (!message.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }

    try {
      const extractedKeywords = await extractKeywords(message);

      if (extractedKeywords.length === 0) {
        alert("키워드를 추출하지 못했습니다. 메시지를 확인해주세요.");
        return;
      }

      const keyword = extractedKeywords[0];
      console.log("추출된 키워드:", keyword);

      navigate("/image-generation", { state: { message, keyword } });
    } catch (error) {
      console.error("키워드 추출 중 오류 발생:", error);
      alert("키워드 추출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSendButtonClick = async () => {
    const mergedData = mergePhoneAndMessages(); // 데이터 병합 (전화번호, 메시지, 이미지)
    console.log(mergedData);
    try {
      console.log(
        "Sending data to backend:",
        JSON.stringify(mergedData, null, 2)
      );

      setIsLoading(true); // 전송 상태

      const response = await sendMessages(mergedData); // API 호출
      console.log("서버 응답:", response.data);
      alert("메시지가 성공적으로 전송되었습니다!");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    setIsLoading(false);
  };

  const mergePhoneAndMessages = () => {
    const mergedData = selectedContacts.map((contact) => {
      const message = convertedTexts[contact.id] || ""; // 선택된 연락처에 해당하는 메시지 내용 가져오기
      const imageBase64 = generatedImage?.split(",")[1] || null; // Base64 데이터만 추출

      // 디버깅: 이미지 데이터 크기 확인
      if (imageBase64) {
        console.log(`Image Base64 Size (before): ${imageBase64.length}`);
        const calculatedSize = Math.floor((imageBase64.length * 3) / 4); // Base64 원본 크기 계산
        console.log(`Calculated Original Size: ${calculatedSize}`);
      }

      return {
        recipientPhoneNumber: contact.phone, // 전화번호
        messageContent: message, // 메시지 내용
        imageBase64: imageBase64, // Base64 데이터 전달
      };
    });

    console.log("Merged Data:", JSON.stringify(mergedData, null, 2)); // 병합된 데이터 확인
    return mergedData;
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0]; // 드롭한 첫 번째 파일만 처리

    //const file = event.target.files[0]; // 첫 번째 선택한 파일만 처리
    if (file) {
      // 파일 크기 제한: 300KB 미만
      if (file.size >= 300 * 1024) {
        alert("이미지 크기는 300KB 이하이어야 합니다.");
        return;
      }

      // 파일 MIME 타입 확인
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 첨부할 수 있습니다.");
        return;
      }

      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setGeneratedImage(base64Image); // 상태 업데이트
        setPrevImage(base64Image); // 이전 이미지에도 저장
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    document.getElementById("fileUploadInput").click(); // 숨겨진 파일 입력 요소를 클릭
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size >= 300 * 1024) {
        alert("이미지 크기는 300KB 이하이어야 합니다.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 첨부할 수 있습니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setGeneratedImage(base64Image);
        setPrevImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // 기본 드래그 오버 동작 방지
  };

  const hourOptions = [...Array(24).keys()].map((h) => ({
    value: String(h).padStart(2, "0"),
    label: `${String(h).padStart(2, "0")}시`,
  }));

  const minuteOptions = Array.from({ length: 60 / 5 }, (_, i) => {
    const m = String(i * 5).padStart(2, "0");
    return { value: m, label: `${m}분` };
  });

  const handleReserveSend = () => {
    const mergedData = mergePhoneAndMessages();

    if (!reserveDate) {
      alert("예약 날짜를 선택해주세요.");
      return;
    }

    const reserveTime = `${format(
      reserveDate,
      "yyyy-MM-dd"
    )} ${reserveHour}:${reserveMinute}`;

    console.log("📦 예약 메시지 전송 정보:");
    console.log("✅ 선택된 날짜:", format(reserveDate, "yyyy-MM-dd"));
    console.log("✅ 선택된 시간:", `${reserveHour}:${reserveMinute}`);
    console.log("✅ 전체 예약 시간:", reserveTime);
    console.log("✅ 전송될 메시지 목록:", mergedData);

    alert(`${reserveTime}에 메시지가 예약되었습니다.`);
  };

  return (
    <div style={styles.container}>
      {isLoading && <SendAnimation />}
      <div style={styles.topSection}>
        <img src={logo} alt="service-logo" style={styles.image} />
        <h1>문자 자동생성 서비스</h1>
        <p>
          문자, 이미지 자동생성 서비스를 활용하여 편리하게 메시지를 전송하세요.
        </p>
      </div>

      <div style={styles.row}>
        <div style={styles.section}>
          <div style={styles.labelWithButton}>
            <label style={styles.label}>메시지</label>
            <button
              style={
                isMessageHovered
                  ? { ...styles.messageButton, ...styles.messageButtonHover }
                  : styles.messageButton
              }
              onMouseEnter={() => setIsMessageHovered(true)}
              onMouseLeave={() => setIsMessageHovered(false)}
              onClick={() => navigate("/message-generation")}
            >
              문자 자동생성
            </button>
          </div>
          {selectedContacts.length > 0 ? (
            <>
              {/* 현재 선택된 연락처의 변환된 메시지 표시 */}
              <textarea
                style={styles.textArea}
                value={
                  convertedTexts[selectedContacts[currentContactIndex]?.id] ||
                  message
                }
                onChange={(e) => {
                  const updatedMessage = e.target.value;
                  setConvertedTexts((prev) => ({
                    ...prev,
                    [selectedContacts[currentContactIndex]?.id]: updatedMessage,
                  }));
                }}
              ></textarea>

              {/* 현재 수신자 인덱스 및 이름 표시 */}
              <p style={styles.contactInfo}>
                {`수신자 ${currentContactIndex + 1} / ${
                  selectedContacts.length
                } : ${selectedContacts[currentContactIndex].name}`}
              </p>

              {/* 이전/다음 버튼 */}
              <div style={styles.navigationButtons}>
                <button
                  style={styles.navButton}
                  disabled={currentContactIndex === 0}
                  onClick={() =>
                    setCurrentContactIndex((prevIndex) =>
                      Math.max(prevIndex - 1, 0)
                    )
                  }
                >
                  이전
                </button>
                <button
                  style={styles.navButton}
                  disabled={currentContactIndex === selectedContacts.length - 1}
                  onClick={() =>
                    setCurrentContactIndex((prevIndex) =>
                      Math.min(prevIndex + 1, selectedContacts.length - 1)
                    )
                  }
                >
                  다음
                </button>
              </div>
            </>
          ) : (
            ////////////////////////////////////////////////////////////////////////////////////////////////////
            <>
              {/* 선택된 연락처가 없을 경우 기본 메시지 입력 */}
              <textarea
                style={styles.textArea}
                placeholder="메시지를 입력하세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.labelWithButton}>
            <label style={styles.label}>이미지</label>
            <div style={styles.buttonGroup}>
              <button
                style={
                  isUploadHovered
                    ? { ...styles.uploadButton, ...styles.uploadButtonHover }
                    : styles.uploadButton
                }
                onClick={handleUploadButtonClick}
                onMouseEnter={() => setIsUploadHovered(true)}
                onMouseLeave={() => setIsUploadHovered(false)}
              >
                <AiOutlineUpload size={22} />
              </button>
              <button
                style={
                  isImageHovered
                    ? { ...styles.imageButton, ...styles.imageButtonHover }
                    : styles.imageButton
                }
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onClick={handleImageGeneration}
              >
                이미지 자동생성
              </button>
            </div>
          </div>
          <div
            style={styles.imageBox}
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
          >
            {generatedImage ? (
              <div style={styles.imageContainer}>
                <img
                  src={generatedImage}
                  alt="Generated"
                  style={{ width: "100%", height: "100%" }}
                />
                <button
                  style={
                    isDeleteButtonHovered
                      ? {
                          ...styles.imageDeleteButton,
                          ...styles.imageDeleteButtonHover,
                        }
                      : styles.imageDeleteButton
                  }
                  onClick={() => {
                    setPrevImage(generatedImage);
                    setGeneratedImage(null);
                  }}
                  onMouseEnter={() => setIsDeleteButtonHovered(true)}
                  onMouseLeave={() => setIsDeleteButtonHovered(false)}
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>
            ) : (
              <>
                {/* 복원 버튼과 텍스트 렌더링 */}

                {prevImage && (
                  <button
                    style={
                      isDeleteButtonHovered
                        ? {
                            ...styles.imageRestoreButton,

                            ...styles.imageRestoreButtonHover,
                          }
                        : styles.imageRestoreButton
                    }
                    onClick={() => {
                      setGeneratedImage(prevImage); // 이전 이미지를 복원

                      setPrevImage(null); // 복원 후 초기화
                    }}
                    onMouseEnter={() => setIsDeleteButtonHovered(true)}
                    onMouseLeave={() => setIsDeleteButtonHovered(false)}
                  >
                    <FiRotateCw size={20} />
                  </button>
                )}

                {/* 박스 중앙에 텍스트 표시 */}

                <p style={styles.imagePlaceholderText}>
                  이미지가 여기에 표시됩니다.
                </p>
              </>
            )}
          </div>
          <input
            id="fileUploadInput"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={styles.hiddenFileInput}
          />
        </div>
      </div>

      {/* 주소록을 메시지와 이미지 자동생성 바로 아래에 배치 */}
      <div style={styles.contactListSection}>
        <ContactList
          message={message}
          setMessage={setMessage}
          convertedTexts={convertedTexts}
          setConvertedTexts={setConvertedTexts}
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
        />

        <div style={styles.reserveSettingSection}>
          <p
            style={{
              marginBottom: "10px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            발송 설정
          </p>
          <div style={styles.toggleWrapper}>
            <button
              onClick={() => setIsReserveMode(false)}
              style={{
                ...styles.toggleButton,
                ...(isReserveMode
                  ? styles.inactiveButton
                  : styles.activeButton),
                borderRadius: "8px 0 0 8px",
              }}
            >
              즉시 발송
            </button>
            <button
              onClick={() => setIsReserveMode(true)}
              style={{
                ...styles.toggleButton,
                ...(isReserveMode
                  ? styles.activeButton
                  : styles.inactiveButton),
                borderRadius: "0 8px 8px 0",
              }}
            >
              예약 발송
            </button>
          </div>

          {isReserveMode && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={formattedDate}
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  readOnly
                  placeholder="날짜 선택"
                  style={styles.datePicker}
                />
                {isDatePickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 10,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      marginTop: "15px",
                      width: "320px",
                    }}
                  >
                    <DayPicker
                      mode="single"
                      selected={reserveDate}
                      onSelect={handleDateSelect}
                    />
                  </div>
                )}
              </div>

              <div style={{ width: "140px" }}>
                <Select
                  options={hourOptions}
                  value={hourOptions.find((opt) => opt.value === reserveHour)}
                  onChange={(selected) => setReserveHour(selected.value)}
                  styles={customSelectStyles}
                  placeholder="시 선택"
                />
              </div>

              <div style={{ width: "140px" }}>
                <Select
                  options={minuteOptions}
                  value={minuteOptions.find(
                    (opt) => opt.value === reserveMinute
                  )}
                  onChange={(selected) => setReserveMinute(selected.value)}
                  styles={customSelectStyles}
                  placeholder="분 선택"
                />
              </div>
            </div>
          )}
        </div>

        {/* 전송하기 버튼을 주소록 바로 아래에 배치 */}
        <div style={styles.sendButtonContainer}>
          <button
            style={styles.sendButton}
            onClick={isReserveMode ? handleReserveSend : handleSendButtonClick}
          >
            전송하기
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* <button
          style={styles.chatbotButton}
          onClick={() => navigate("/chatbot")}
        >
          챗봇 사용하기
        </button> */}
      </div>
    </div>
  );
};

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    height: "45px",
    borderRadius: "8px",
    borderColor: "#ccc",
    fontSize: "16px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    maxHeight: 180, // 6개 정도 보이는 높이로 설정
    overflowY: "auto", // ✅ 내부에서만 스크롤 생기게
    padding: 0, // ✅ 여백 없이 정리
    margin: 0,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: 180, // ✅ menuList에도 명시적으로 적용
    overflowY: "auto",
    padding: 0,
    margin: 0,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0e7ff" : "white",
    color: "#333",
    fontSize: "15px",
    cursor: "pointer",
  }),
};

const styles = {
  contactName: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  contactInfo: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#555",
  },
  // 기존 스타일 정의
  container: {
    margin: "85px",
    backgroundColor: "white",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  topSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  image: {
    width: "100px",
    height: "100px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "40px",
    gap: "20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    padding: "30px",
    borderRadius: "8px",
    minWidth: "450px",
    boxSizing: "border-box",
    backgroundColor: "#F9FAFB",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  labelWithButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%", // 라벨과 버튼이 같은 섹션에서 정렬되도록
    marginBottom: "10px",
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "black",
    marginRight: "10px", // 버튼과 약간의 간격 추가
  },
  messageButton: {
    background: "#4A90E2",
    color: "white",
    border: "none",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  messageButtonHover: {
    background: "#007BFF",
    transform: "scale(1.05)",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
  },
  imageButton: {
    background: "linear-gradient(to right, #4A90E2, #007BFF)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    marginRight: "0px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  imageButtonHover: {
    background: "linear-gradient(to right, #007BFF, #4A90E2)",
    transform: "scale(1.1)",
    boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
  },
  textArea: {
    width: "100%",
    height: "400px",
    padding: "20px",
    fontSize: "16px",
    border: "1px solid #4A90E2",
    borderRadius: "8px",
    resize: "none",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    color: "#333",
    lineHeight: "1.5",
    outline: "none",
    marginBottom: "10px",
    fontFamily: "'Arial', sans-serif", // 폰트 설정
    fontWeight: "bold", // 글씨를 bold로 설정
  },

  imageBox: {
    width: "100%",
    height: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // 중앙 정렬을 위해 추가
    border: "1px solid #4A90E2",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    textAlign: "center",
    marginBottom: "10px",
    boxSizing: "border-box",
    fontSize: "20px",
    color: "#A9A9A9",
    fontFamily: "'Arial', sans-serif", // 폰트 설정
    fontWeight: "bold", //bold로 설정
  },
  contactListSection: {
    width: "1200px",
    maxWidth: "1200px",
  },
  sendButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px", // 전송하기 버튼과 주소록 사이의 간격
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    padding: "15px 30px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    width: "200px", // 버튼 크기 지정
    textAlign: "center",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    gap: "20px", // 버튼 간격 추가
  },
  navButton: {
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  imageDeleteButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(128, 128, 128, 0.7)", // 기본 회색
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    transition: "0.3s ease", // hover 애니메이션 효과
  },
  imageDeleteButtonHover: {
    backgroundColor: "rgba(0, 0, 0, 1)", // 검정색
    transform: "scale(1.2)", // 크기 확대 효과
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.3)", // 그림자 효과 강화
  },
  imageRestoreButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(128, 128, 128, 0.7)", // 기본 회색
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.3s ease", // hover 애니메이션 효과
  },
  imageRestoreButtonHover: {
    backgroundColor: "rgba(0, 0, 0, 1)", // 검정색
    transform: "scale(1.2)", // 크기 확대 효과
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.3)", // 그림자 효과 강화
  },
  imagePlaceholderText: {
    fontSize: "20px",
    color: "#A9A9A9",
    textAlign: "center",
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)", // 텍스트를 박스 중앙에 배치
    pointerEvents: "none", // 클릭 불가
  },
  fileInput: {
    marginTop: "10px",
    display: "block",
    cursor: "pointer",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "14px",
  },
  uploadButton: {
    background: "#4A90E2",
    color: "white",
    border: "none",
    padding: "10px",
    marginRight: "10px",
    borderRadius: "10px",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative", // 위치 조정 가능하게 설정
    top: "2px", // 아래로 5px 이동
  },
  uploadButtonHover: {
    background: "#007BFF",
    transform: "scale(1.05)",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
  },
  hiddenFileInput: {
    display: "none",
  },
  reserveButton: {
    backgroundColor: "#5D6D7E", // 오렌지 색상
    color: "white",
    border: "none",
    padding: "15px 30px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    width: "200px",
    textAlign: "center",
    marginLeft: "20px", // 전송하기 버튼과 간격
  },
  reserveSettingSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F4FA",
    padding: "12px 40px",
    borderRadius: "12px",
    width: "850px",
    maxWidth: "100%",
    margin: "0 auto 30px auto",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "16px",
  },
  datePicker: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "160px", // 추가된 너비
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
  },

  selectBox: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "120px", // 시간과 분 선택 박스 너비 확장
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage:
      'url(\'data:image/svg+xml;utf8,<svg fill="%23666" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px",
  },
  toggleWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  },

  toggleButton: {
    padding: "14px 36px",
    border: "1px solid #ccc",
    fontSize: "15px",
    cursor: "pointer",
    outline: "none",
    transition: "0.3s ease-in-out",
    fontWeight: "bold",
  },

  activeButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "1px solid #4A90E2",
  },

  inactiveButton: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    border: "1px solid #ccc",
  },
};

export default MainPage;
