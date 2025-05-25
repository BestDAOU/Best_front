//src/pages/MainPageMobile.js
import { FiRotateCw } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineUpload } from "react-icons/ai";
import React, { useState, useEffect, useRef } from "react";
// import ContactList from "../components/ContactList";
import ContactListMobile from "../components/ContactListMobile"; // 모바일용 ContactList로 변경
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { sendMessages } from "../services/PpurioApiService";
import SendAnimation from "../components/SendAnimation";
import Select from "react-select";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { extractKeywordsFromServer } from "../services/KeywordService";
import { detectPlatform } from "../utils/platformDetector"; // ✅ 추가된 import


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

const MainPageMobile = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const loginMemberId = localStorage.getItem("memberId");
    const messageFromState = location.state?.message || "";
    const [message, setMessage] = useState(messageFromState);
    const [generatedImage, setGeneratedImage] = useState(
        location.state?.generatedImage
    );
    const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
    const [prevImage, setPrevImage] = useState(null);

    const [convertedTexts, setConvertedTexts] = useState({});
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [currentContactIndex, setCurrentContactIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 즉시, 예약 전송 모드
    const [isReserveMode, setIsReserveMode] = useState(false);
    const [reserveDate, setReserveDate] = useState(initialDate);
    const [reserveHour, setReserveHour] = useState(initialHour);
    const [reserveMinute, setReserveMinute] = useState(initialMinute);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const formattedDate = reserveDate ? format(reserveDate, "yyyy-MM-dd") : "";
    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown === "date") {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDropdown]);

       // 플랫폼 감지하여 메시지 생성 페이지로 이동
       const handleMessageGeneration = () => {
        const platform = detectPlatform();
        
        if (platform.isMobile) {
            navigate("/message-generation-mobile");
        } else {
            navigate("/message-generation");
        }
    };

    const toggleDropdown = (type) => {
        setActiveDropdown((prev) => (prev === type ? null : type));
    };

    // const handleImageGeneration = async () => {
    //     if (!message.trim()) {
    //         alert("메시지를 입력하세요.");
    //         return;
    //     }

    //     try {
    //         setIsLoading(true);
    //         const extractedKeywords = await extractKeywordsFromServer(message);

    //         if (!extractedKeywords || extractedKeywords.length === 0) {
    //             alert("키워드를 추출하지 못했습니다. 메시지를 확인해주세요.");
    //             return;
    //         }

    //         const keyword = extractedKeywords[0];
    //         console.log("추출된 키워드:", keyword);

    //         navigate("/image-generation", { state: { message, keyword } });
    //     } catch (error) {
    //         console.error("키워드 추출 중 오류 발생:", error);
    //         alert("키워드 추출에 실패했습니다. 다시 시도해주세요.");
    //     }
    // };
    const handleImageGeneration = async () => {
        if (!message.trim()) {
            alert("메시지를 입력하세요.");
            return;
        }

        try {
            setIsLoading(true);
            const extractedKeywords = await extractKeywordsFromServer(message);

            if (!extractedKeywords || extractedKeywords.length === 0) {
                alert("키워드를 추출하지 못했습니다. 메시지를 확인해주세요.");
                return;
            }

            const keyword = extractedKeywords[0];
            console.log("추출된 키워드:", keyword);

            // ✅ 플랫폼 감지하여 적절한 이미지 생성 페이지로 이동
            const platform = detectPlatform();
            
            if (platform.isMobile) {
                navigate("/image-generation-mobile", { state: { message, keyword } });
            } else {
                navigate("/image-generation", { state: { message, keyword } });
            }
        } catch (error) {
            console.error("키워드 추출 중 오류 발생:", error);
            alert("키워드 추출에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendButtonClick = async () => {
        const mergedData = mergePhoneAndMessages();
        try {
            setIsLoading(true);
            const response = await sendMessages(mergedData);
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
            const message = convertedTexts[contact.id] || "";
            const imageBase64 = generatedImage?.split(",")[1] || null;

            return {
                recipientPhoneNumber: contact.phone,
                messageContent: message,
                imageBase64: imageBase64,
            };
        });

        return mergedData;
    };

    const handleImageDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

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

    const handleUploadButtonClick = () => {
        document.getElementById("fileUploadInput").click();
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
        event.preventDefault();
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

        alert(`${reserveTime}에 메시지가 예약되었습니다.`);
    };

    return (
        <div style={styles.container}>
            {isLoading && <SendAnimation />}

            {/* 헤더 */}
            <div style={styles.header}>
                <img src={logo} alt="service-logo" style={styles.logo} />
                <h1 style={styles.title}>문자 자동생성</h1>
                <p style={styles.subtitle}>
                    간편하게 메시지를 생성하고 전송하세요
                </p>
            </div>

            {/* 메시지 섹션 */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>메시지</h2>
                    <button
                        style={styles.generateButton}
                        // onClick={() => navigate("/message-generation")}
                        onClick={handleMessageGeneration} // ✅ 수정된 함수 사용
                    >
                        자동생성
                    </button>
                </div>

                {selectedContacts.length > 0 ? (
                    <>
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
                            placeholder="메시지를 입력하세요"
                        />

                        <div style={styles.contactInfo}>
                            <span style={styles.contactText}>
                                {`수신자 ${currentContactIndex + 1} / ${selectedContacts.length} : ${selectedContacts[currentContactIndex].name}`}
                            </span>
                        </div>

                        <div style={styles.navigationButtons}>
                            <button
                                style={{
                                    ...styles.navButton,
                                    ...(currentContactIndex === 0 ? styles.navButtonDisabled : {})
                                }}
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
                                style={{
                                    ...styles.navButton,
                                    ...(currentContactIndex === selectedContacts.length - 1 ? styles.navButtonDisabled : {})
                                }}
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
                    <textarea
                        style={styles.textArea}
                        placeholder="메시지를 입력하세요"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                )}
            </div>

            {/* 이미지 섹션 */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>이미지</h2>
                    <div style={styles.imageButtons}>
                        <button
                            style={styles.uploadButton}
                            onClick={handleUploadButtonClick}
                        >
                            <AiOutlineUpload size={18} />
                        </button>
                        <button
                            style={styles.generateButton}
                            onClick={handleImageGeneration}
                        >
                            자동생성
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
                                style={styles.image}
                            />
                            <button
                                style={styles.deleteButton}
                                onClick={() => {
                                    setPrevImage(generatedImage);
                                    setGeneratedImage(null);
                                }}
                            >
                                <AiOutlineClose size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            {prevImage && (
                                <button
                                    style={styles.restoreButton}
                                    onClick={() => {
                                        setGeneratedImage(prevImage);
                                        setPrevImage(null);
                                    }}
                                >
                                    <FiRotateCw size={16} />
                                </button>
                            )}
                            <p style={styles.imagePlaceholder}>
                                이미지가 여기에 표시됩니다
                            </p>
                        </>
                    )}
                </div>

                <input
                    id="fileUploadInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={styles.hiddenInput}
                />
            </div>

            {/* 주소록 섹션 */}
            <div style={styles.section}>
                {/* <ContactList
          memberId={loginMemberId}
          message={message}
          setMessage={setMessage}
          convertedTexts={convertedTexts}
          setConvertedTexts={setConvertedTexts}
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
        /> */}
                <ContactListMobile
                    memberId={loginMemberId}
                    message={message}
                    setMessage={setMessage}
                    convertedTexts={convertedTexts}
                    setConvertedTexts={setConvertedTexts}
                    selectedContacts={selectedContacts}
                    setSelectedContacts={setSelectedContacts}
                />
            </div>

            {/* 발송 설정 섹션 */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>발송 설정</h2>

                <div style={styles.toggleContainer}>
                    <button
                        onClick={() => setIsReserveMode(false)}
                        style={{
                            ...styles.toggleButton,
                            ...(isReserveMode ? styles.inactiveToggle : styles.activeToggle),
                            borderRadius: "8px 0 0 8px",
                        }}
                    >
                        즉시 발송
                    </button>
                    <button
                        onClick={() => setIsReserveMode(true)}
                        style={{
                            ...styles.toggleButton,
                            ...(isReserveMode ? styles.activeToggle : styles.inactiveToggle),
                            borderRadius: "0 8px 8px 0",
                        }}
                    >
                        예약 발송
                    </button>
                </div>

                {isReserveMode && (
                    <div style={styles.reserveControls}>
                        <div style={{ position: "relative", marginBottom: "15px" }}>
                            <input
                                type="text"
                                value={formattedDate}
                                onClick={() => toggleDropdown("date")}
                                readOnly
                                placeholder="날짜 선택"
                                style={styles.datePicker}
                            />
                            {activeDropdown === "date" && (
                                <div ref={datePickerRef} style={styles.datePickerDropdown}>
                                    <DayPicker
                                        mode="single"
                                        selected={reserveDate}
                                        onSelect={(date) => {
                                            setReserveDate(date);
                                            setActiveDropdown(null);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={styles.timeSelectors}>
                            <div style={styles.timeSelector}>
                                <Select
                                    options={hourOptions}
                                    value={hourOptions.find((opt) => opt.value === reserveHour)}
                                    onChange={(selected) => {
                                        setReserveHour(selected.value);
                                        setActiveDropdown(null);
                                    }}
                                    styles={mobileSelectStyles}
                                    placeholder="시 선택"
                                />
                            </div>

                            <div style={styles.timeSelector}>
                                <Select
                                    options={minuteOptions}
                                    value={minuteOptions.find(
                                        (opt) => opt.value === reserveMinute
                                    )}
                                    onChange={(selected) => {
                                        setReserveMinute(selected.value);
                                        setActiveDropdown(null);
                                    }}
                                    styles={mobileSelectStyles}
                                    placeholder="분 선택"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 전송 버튼 */}
            <div style={styles.sendButtonContainer}>
                <button
                    style={styles.sendButton}
                    onClick={isReserveMode ? handleReserveSend : handleSendButtonClick}
                >
                    {isReserveMode ? "예약 전송" : "즉시 전송"}
                </button>
            </div>
        </div>
    );
};

const mobileSelectStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: "44px",
        borderRadius: "8px",
        borderColor: "#ddd",
        fontSize: "14px",
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        maxHeight: 160,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? "#e3f2fd" : "white",
        color: "#333",
        fontSize: "14px",
    }),
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
    logo: {
        width: "64px",
        height: "64px",
        marginBottom: "12px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1a1a1a",
        margin: "0 0 8px 0",
    },
    subtitle: {
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
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1a1a1a",
        margin: "0",
    },
    generateButton: {
        backgroundColor: "#4A90E2",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    textArea: {
        width: "100%",
        height: "200px",
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        fontSize: "14px",
        lineHeight: "1.5",
        resize: "none",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
    },
    contactInfo: {
        margin: "12px 0",
        padding: "8px 12px",
        backgroundColor: "#f5f7fa",
        borderRadius: "6px",
        textAlign: "center",
    },
    contactText: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#555",
    },
    navigationButtons: {
        display: "flex",
        gap: "12px",
        marginTop: "12px",
    },
    navButton: {
        flex: 1,
        padding: "10px 16px",
        backgroundColor: "#4A90E2",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
    },
    navButtonDisabled: {
        backgroundColor: "#ccc",
        cursor: "not-allowed",
    },
    imageButtons: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },
    uploadButton: {
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        padding: "8px",
        borderRadius: "6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    imageBox: {
        width: "100%",
        height: "200px",
        border: "2px dashed #ddd",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "#fafafa",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "6px",
    },
    deleteButton: {
        position: "absolute",
        top: "8px",
        right: "8px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
    restoreButton: {
        position: "absolute",
        top: "8px",
        right: "8px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
    imagePlaceholder: {
        color: "#999",
        fontSize: "14px",
        textAlign: "center",
    },
    hiddenInput: {
        display: "none",
    },
    toggleContainer: {
        display: "flex",
        marginBottom: "16px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #ddd",
    },
    toggleButton: {
        flex: 1,
        padding: "12px 16px",
        border: "none",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    activeToggle: {
        backgroundColor: "#4A90E2",
        color: "white",
    },
    inactiveToggle: {
        backgroundColor: "#f8f9fa",
        color: "#666",
    },
    reserveControls: {
        marginTop: "16px",
    },
    datePicker: {
        width: "100%",
        padding: "12px 16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px",
        backgroundColor: "white",
        cursor: "pointer",
        boxSizing: "border-box",
    },
    datePickerDropdown: {
        position: "absolute",
        top: "100%",
        left: "0",
        right: "0",
        zIndex: 1000,
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        marginTop: "4px",
    },
    timeSelectors: {
        display: "flex",
        gap: "12px",
    },
    timeSelector: {
        flex: 1,
    },
    sendButtonContainer: {
        padding: "0 16px 24px 16px",
    },
    sendButton: {
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
        transition: "all 0.2s",
    },
};

export default MainPageMobile;