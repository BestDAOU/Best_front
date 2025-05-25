import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addContact } from "../store/contactsSlice";
import { useNavigate } from "react-router-dom";
import tones from "../data/tones.json";
import { addFriend, getFriendsByMemberId } from "../services/FriendsService";
import { useParams } from "react-router-dom";
import { 
  FaPlus, 
  FaTrash, 
  FaChevronDown, 
  FaChevronUp, 
  FaTimes,
  FaArrowLeft,
  FaCheck
} from "react-icons/fa";

const ContactFormMobile = () => {
  const { memberId } = useParams();
  const [contactList, setContactList] = useState([]);
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    nickname: "",
    email: "",
    memo: "",
    tag: "",
    group: "찐친",
    relationType: "",
    selectedToneId: 13,
  });

  const [phoneError, setPhoneError] = useState("");
  const [expandedContacts, setExpandedContacts] = useState({});
  const [currentStep, setCurrentStep] = useState("form"); // "form" 또는 "list"
  const dispatch = useDispatch();
  const navigate = useNavigate();

    // 페이지 로드 시 스크롤을 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
 // 탭 변경 시에도 스크롤을 맨 위로 이동
 useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // 연락처 상세 정보 토글
  const toggleExpandContact = (index) => {
    setExpandedContacts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 폼 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phonePattern = /^010\d{8}$/;
      if (value && !phonePattern.test(value)) {
        setPhoneError("올바른 형식: 01012345678");
      } else {
        setPhoneError("");
      }
    }
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  // 어조 선택 핸들러
  const handleToneChange = (tone) => {
    setContact((prev) => ({ ...prev, tone }));
  };

  // 연락처 추가
  const handleAddContact = () => {
    if (!contact.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!contact.phone) {
      setPhoneError("전화번호를 입력해주세요.");
      return;
    }

    if (phoneError) {
      alert("전화번호 형식을 확인해주세요.");
      return;
    }

    setContactList((prevList) => [...prevList, contact]);
    setContact({
      memberId: memberId,
      name: "",
      phone: "",
      nickname: "",
      email: "",
      memo: "",
      tag: "",
      group: "찐친",
      selectedToneId: 13,
    });
    
    alert("연락처가 추가되었습니다!");
  };

  // 연락처 삭제
  const handleDeleteContact = (index) => {
    if (window.confirm("이 연락처를 삭제하시겠습니까?")) {
      setContactList((prevList) => prevList.filter((_, i) => i !== index));
    }
  };

  // 확인 버튼 핸들러
  const handleConfirm = async () => {
    if (contactList.length === 0) {
      alert("추가된 연락처가 없습니다.");
      return;
    }

    try {
      for (const contact of contactList) {
        let relationTypeValue = "FRIEND";

        if (contact.nickname && contact.nickname.includes("가족")) {
          relationTypeValue = "FAMILY";
        } else if (contact.nickname && contact.nickname.includes("동료")) {
          relationTypeValue = "COLLEAGUE";
        }

        const payload = {
          id: 1,
          friendName: contact.name,
          friendPhone: contact.phone,
          friendEmail: contact.email || "",
          features: contact.tag || "",
          memos: contact.memo || "",
          tones: contact.tone || "일반",
          tones_prompt: "{\"label\":\"친근한 말투\",\"instruction\":\"상대방과 친밀한 관계를 나타내는 말투로 말하세요.\",\"examples\":[\"안녕, 잘 지냈어?\"]}",
          groupName: contact.group || "기본",
          relationType: contact.relationType || "",
          member_id: parseInt(memberId),
          selectedToneId: 13,
        };

        console.log("서버에 전송하는 데이터:", JSON.stringify(payload, null, 2));

        try {
          const response = await addFriend(memberId, payload);
          console.log("서버 응답:", response.data);
        } catch (error) {
          console.error("API 오류 세부 정보:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            payload
          });
          throw error;
        }
      }

      alert("연락처가 성공적으로 저장되었습니다!");
      navigate("/main-mobile");
    } catch (error) {
      console.error("연락처 저장 오류:", error);

      if (error.response?.data?.message) {
        alert(`연락처 저장에 실패했습니다: ${error.response.data.message}`);
      } else {
        alert("연락처 저장에 실패했습니다. 서버 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate("/main-mobile")}>
          <FaArrowLeft size={16} />
        </button>
        <h1 style={styles.title}>연락처 추가</h1>
        <div style={styles.placeholder}></div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(currentStep === "form" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setCurrentStep("form")}
        >
          <FaPlus size={14} />
          <span>추가</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(currentStep === "list" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setCurrentStep("list")}
        >
          <span>목록 ({contactList.length})</span>
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div style={styles.content}>
        {currentStep === "form" ? (
          /* 연락처 추가 폼 */
          <div style={styles.formSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>이름 *</label>
              <input
                type="text"
                name="name"
                placeholder="이름을 입력하세요"
                value={contact.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>전화번호 *</label>
              <input
                type="text"
                name="phone"
                placeholder="01012345678"
                value={contact.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(phoneError ? styles.inputError : {}),
                }}
                required
              />
              {phoneError && <p style={styles.errorMessage}>{phoneError}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>관계</label>
              <input
                type="text"
                name="relationType"
                placeholder="친구, 가족, 동료 등"
                value={contact.relationType}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>이메일</label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={contact.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>특징</label>
              <input
                type="text"
                name="tag"
                placeholder="성격, 취미, 특이사항 등"
                value={contact.tag}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>메모</label>
              <textarea
                name="memo"
                placeholder="기억하고 싶은 내용을 입력하세요"
                value={contact.memo}
                onChange={handleChange}
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>어조 선택</label>
              <div style={styles.toneButtons}>
                {tones.map((tone) => (
                  <button
                    key={tone.label}
                    type="button"
                    onClick={() => handleToneChange(tone.label)}
                    style={{
                      ...styles.toneButton,
                      backgroundColor: contact.tone === tone.label ? "#4A90E2" : "#f8f9fa",
                      color: contact.tone === tone.label ? "white" : "#333",
                      borderColor: contact.tone === tone.label ? "#4A90E2" : "#ddd",
                    }}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <button style={styles.addButton} onClick={handleAddContact}>
              <FaPlus size={16} />
              <span>연락처 추가</span>
            </button>
          </div>
        ) : (
          /* 연락처 목록 */
          <div style={styles.listSection}>
            {contactList.length > 0 ? (
              contactList.map((contact, index) => (
                <div key={index} style={styles.contactCard}>
                  <div style={styles.contactHeader}>
                    <div style={styles.contactMainInfo}>
                      <span style={styles.contactName}>{contact.name}</span>
                      <span style={styles.contactPhone}>{contact.phone}</span>
                    </div>
                    <div style={styles.contactActions}>
                      <button
                        style={styles.expandButton}
                        onClick={() => toggleExpandContact(index)}
                      >
                        {expandedContacts[index] ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteContact(index)}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {expandedContacts[index] && (
                    <div style={styles.contactDetails}>
                      {contact.relationType && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>관계:</span>
                          <span style={styles.detailValue}>{contact.relationType}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>이메일:</span>
                          <span style={styles.detailValue}>{contact.email}</span>
                        </div>
                      )}
                      {contact.tag && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>특징:</span>
                          <span style={styles.detailValue}>{contact.tag}</span>
                        </div>
                      )}
                      {contact.memo && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>메모:</span>
                          <span style={styles.detailValue}>{contact.memo}</span>
                        </div>
                      )}
                      {contact.tone && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>어조:</span>
                          <span style={styles.toneTag}>{contact.tone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>아직 추가된 연락처가 없습니다.</p>
                <button
                  style={styles.goToFormButton}
                  onClick={() => setCurrentStep("form")}
                >
                  연락처 추가하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div style={styles.bottomActions}>
        <button style={styles.cancelButton} onClick={() => navigate("/main-mobile")}>
          취소
        </button>
        <button 
          style={{
            ...styles.confirmButton,
            ...(contactList.length === 0 ? styles.confirmButtonDisabled : {}),
          }} 
          onClick={handleConfirm}
          disabled={contactList.length === 0}
        >
          <FaCheck size={14} />
          <span>저장 ({contactList.length})</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "white",
    borderBottom: "1px solid #f0f0f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  },
  backButton: {
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
  tabContainer: {
    display: "flex",
    backgroundColor: "white",
    borderBottom: "1px solid #f0f0f0",
  },
  tab: {
    flex: 1,
    padding: "16px 12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  activeTab: {
    color: "#4A90E2",
    borderBottom: "2px solid #4A90E2",
    backgroundColor: "#f8f9fa",
  },
  inactiveTab: {
    color: "#666",
    borderBottom: "2px solid transparent",
  },
  content: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "#e53e3e",
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.5",
  },
  errorMessage: {
    color: "#e53e3e",
    fontSize: "12px",
    marginTop: "4px",
    margin: 0,
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  toneButton: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    background: "white",
  },
  addButton: {
    padding: "16px 20px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    transition: "background-color 0.2s",
  },
  listSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #f0f0f0",
  },
  contactHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactMainInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  contactName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  contactPhone: {
    fontSize: "14px",
    color: "#666",
  },
  contactActions: {
    display: "flex",
    gap: "8px",
  },
  expandButton: {
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
  deleteButton: {
    padding: "8px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#e53e3e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactDetails: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailItem: {
    display: "flex",
    gap: "8px",
    fontSize: "14px",
  },
  detailLabel: {
    fontWeight: "500",
    color: "#333",
    minWidth: "60px",
  },
  detailValue: {
    color: "#666",
    flex: 1,
    wordBreak: "break-word",
  },
  toneTag: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  emptyText: {
    color: "#999",
    fontSize: "16px",
    marginBottom: "20px",
  },
  goToFormButton: {
    padding: "12px 24px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  bottomActions: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "white",
    borderTop: "1px solid #f0f0f0",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
  },
  cancelButton: {
    flex: 1,
    padding: "16px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },
  confirmButton: {
    flex: 2,
    padding: "16px 20px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

export default ContactFormMobile;