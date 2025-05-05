import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addContact } from "../store/contactsSlice";
import { useNavigate } from "react-router-dom";
import tones from "../data/tones.json"; // tones.json import
import { addFriend, getFriendsByMemberId } from "../services/FriendsService";
import { useParams } from "react-router-dom";

const ContactForm = () => {
  const { memberId } = useParams();
  const [contactList, setContactList] = useState([]);
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    nickname: "", // 닉네임 추가
    email: "", // 이메일 추가
    memo: "", // 메모 추가
    tag: "",
    tone: tones[0].label, // 기본값 설정,
    group: "찐친", // 기본값 설정
    profile: "https://via.placeholder.com/40", // 기본 이미지
  });

  const [phoneError, setPhoneError] = useState("");
  const [expandedTags, setExpandedTags] = useState({});
  const [expandedMemos, setExpandedMemos] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await getFriendsByMemberId(memberId);
        const serverContacts = response.data.map((friend) => ({
          name: friend.friendName,
          phone: friend.friendPhone,
          email: friend.friendEmail,
          tag: friend.features,
          memo: friend.memos,
          tone: friend.tones,
          group: friend.groupName,
          nickname: friend.relationType,
          profile: "https://via.placeholder.com/40",
        }));
        setContactList(serverContacts);
      } catch (error) {
        console.error("서버에서 연락처를 불러오는 중 오류 발생:", error);
      }
    };

    fetchContacts();
  }, [memberId]);


  // 특징 더보기/접기 토글
  const toggleExpandTag = (index) => {
    setExpandedTags((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 기억 더보기/접기 토글
  const toggleExpandMemo = (index) => {
    setExpandedMemos((prev) => ({
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
    if (!contact.phone) {
      setPhoneError("전화번호를 입력해주세요.");
      return;
    }

    if (phoneError) {
      alert("전화번호 형식을 확인해주세요.");
      return;
    }

    setContactList((prevList) => [...prevList, contact]); // 로컬 상태에 추가
    setContact({
      memberId: memberId,
      name: "",
      phone: "",
      nickname: "",
      email: "",
      memo: "",
      tag: "",
      tone: tones[0].label,
      group: "찐친",
      profile: "https://via.placeholder.com/40",
    });
  };
  // 연락처 삭제 함수 추가
  const handleDeleteContact = (index) => {
    setContactList((prevList) => prevList.filter((_, i) => i !== index)); // 선택한 인덱스 제외
  };

  // 확인 버튼 핸들러: Redux에 저장 후 메인 페이지로 이동
  const handleConfirm = async () => {
    if (contactList.length === 0) {
      alert("추가된 연락처가 없습니다.");
      return;
    }
  
    try {
      for (const contact of contactList) {
        // RelationType을 백엔드에서 허용하는 값으로 매핑
        let relationTypeValue = "FRIEND"; // 기본값으로 'FRIEND' 사용
        
        // 관계에 따른 RelationType 매핑 (이 부분은 백엔드의 열거형 값에 따라 조정 필요)
        if (contact.nickname && contact.nickname.includes("가족")) {
          relationTypeValue = "FAMILY";
        } else if (contact.nickname && contact.nickname.includes("동료")) {
          relationTypeValue = "COLLEAGUE"; 
        }
        
        // FriendsDto에 맞게 페이로드 구성
        const payload = {
          id: 1, // 서버에서 자동 생성되므로 임시로 1로 설정
          friendName: contact.name,
          friendPhone: contact.phone,
          friendEmail: contact.email || "",
          features: contact.tag || "",
          memos: contact.memo || "",
          tones: contact.tone || "일반",
          tones_prompt: "{\"label\":\"친근한 말투\",\"instruction\":\"상대방과 친밀한 관계를 나타내는 말투로 말하세요.\",\"examples\":[\"안녕, 잘 지냈어?\"]}",
          groupName: contact.group || "기본",
          relationType: relationTypeValue,
          member_id: parseInt(memberId) // 이 필드가 반드시 포함되어야 함
        };
  
        console.log("서버에 전송하는 데이터:", JSON.stringify(payload, null, 2));
        console.log("멤버 ID:", memberId);
        
        try {
          // 실제 전송되는 데이터를 확인하기 위한 디버깅 코드
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
      navigate("/main");
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
      {/* 왼쪽: 연락처 추가 폼 */}
      <div style={styles.formContainer}>
        <h2 style={styles.title}>연락처 추가</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddContact();
          }}
          style={styles.contactForm}
        >
          <label>이름:</label>
          <input
            type="text"
            name="name"
            placeholder="이름 입력"
            value={contact.name}
            onChange={handleChange}
            style={styles.input}
          />
          <label>번호:</label>
          <input
            type="text"
            name="phone"
            placeholder="전화번호 입력 (예: 01012345678)"
            value={contact.phone}
            onChange={handleChange}
            style={styles.input}
          />
          {phoneError && <p style={styles.errorMessage}>{phoneError}</p>}
          <label>관계:</label>
          <input
            type="text"
            name="nickname"
            placeholder="닉네임 입력"
            value={contact.nickname}
            onChange={handleChange}
            style={styles.input}
          />
          <label>이메일:</label>
          <input
            type="email"
            name="email"
            placeholder="이메일 입력"
            value={contact.email}
            onChange={handleChange}
            style={styles.input}
          />
          <label>특징:</label>
          <input
            type="text"
            name="tag"
            placeholder="특징 입력"
            value={contact.tag}
            onChange={handleChange}
            style={styles.input}
          />
          <label>메모:</label>
          <textarea
            name="memo"
            placeholder="메모 입력"
            value={contact.memo}
            onChange={handleChange}
            style={{ ...styles.input, height: "80px" }}
          />
          <label>어조 선택:</label>
          <div style={styles.toneButtons}>
            {tones.map((tone) => (
              <button
                key={tone.label}
                type="button"
                onClick={() => handleToneChange(tone.label)}
                style={{
                  ...styles.toneButton,
                  backgroundColor:
                    contact.tone === tone.label ? "#1976d2" : "#ccc",
                  color: contact.tone === tone.label ? "white" : "black",
                }}
              >
                {tone.label}
              </button>
            ))}
          </div>
          <button type="submit" style={styles.button}>
            추가
          </button>
        </form>
      </div>

      {/* 오른쪽: 추가된 연락처 테이블 */}
      <div style={styles.tableContainer}>
        <h2 style={styles.title}>추가된 연락처</h2>
        <div style={styles.contactList}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "80px" }}>이름</th>
                <th style={{ ...styles.th, width: "125px" }}>번호</th>
                <th style={{ ...styles.th, width: "120px" }}>특징</th>
                <th style={{ ...styles.th, width: "220px" }}>기억</th>
                <th style={{ ...styles.th, width: "100px" }}>어조</th>
                <th style={{ ...styles.th, width: "80px" }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {contactList.length > 0 ? (
                contactList.map((contact, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{contact.name}</td>
                    <td style={styles.td}>{contact.phone}</td>
                    <td style={styles.td}>
                      {/* 특징 더보기/접기 */}
                      <span
                        style={
                          expandedTags[index]
                            ? styles.fullText
                            : styles.truncatedText
                        }
                      >
                        {contact.tag}
                      </span>
                      {contact.tag && contact.tag.length > 20 && (
                        <button
                          style={styles.moreButton}
                          onClick={() => toggleExpandTag(index)}
                        >
                          {expandedTags[index] ? "접기" : "더보기"}
                        </button>
                      )}
                    </td>
                    <td style={styles.td}>
                      {/* 기억 더보기/접기 */}
                      <span
                        style={
                          expandedMemos[index]
                            ? styles.fullText
                            : styles.truncatedText
                        }
                      >
                        {contact.memo}
                      </span>
                      {contact.memo && contact.memo.length > 30 && (
                        <button
                          style={styles.moreButton}
                          onClick={() => toggleExpandMemo(index)}
                        >
                          {expandedMemos[index] ? "접기" : "더보기"}
                        </button>
                      )}
                    </td>
                    <td style={styles.td}>{contact.tone}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteContact(index)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.td}>
                    아직 추가된 연락처가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.buttonContainer}>
        {/* 취소 버튼 */}
        <button
          style={styles.cancelButton}
          onClick={() => navigate("/")} // 메인 페이지로 이동
        >
          취소
        </button>

        {/* 확인 버튼 */}
        <button style={styles.confirmButton} onClick={handleConfirm}>
          확인
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "80%",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  formContainer: {
    flex: 1.4,
    marginRight: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tableContainer: {
    flex: 3,
    position: "relative",
  },
  title: {
    textAlign: "center",
    color: "#000",
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    padding: "15px",
    fontSize: "18px",
    border: "1px solid #bbdefb",
    borderRadius: "8px",
    backgroundColor: "white",
    transition: "border-color 0.3s",
  },
  button: {
    backgroundColor: "#1e88e5",
    color: "white",
    padding: "15px",
    fontSize: "18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  toneButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  },
  errorMessage: {
    color: "red",
    fontSize: "14px",
    marginTop: "-15px",
    marginBottom: "10px",
  },
  contactList: {
    maxHeight: "900px",
    overflowY: "scroll",
    borderRadius: "8px",
    border: "1px solid #ccc",
    padding: "0",
    margin: "0",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "960px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderSpacing: "0",
  },
  thead: {
    textAlign: "center", // 텍스트 가운데 정렬
  },
  th: {
    backgroundColor: "#1976d2",
    color: "white",
    padding: "12px",
    fontSize: "18px",
    textAlign: "center", // 각 열 헤더 가운데 정렬
    position: "sticky",
    top: "0",
    zIndex: 1,
  },
  td: {
    fontSize: "16px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #bbdefb",
    wordBreak: "break-word",
  },
  truncatedText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "150px", // 줄임표 적용할 최대 너비
    display: "inline-block",
    verticalAlign: "middle",
  },
  fullText: {
    whiteSpace: "normal", // 텍스트 전체 표시
  },
  moreButton: {
    marginLeft: "10px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#ef5350", // 삭제 버튼 색상
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontSize: "14px",
  },

  buttonContainer: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    display: "flex",
    justifyContent: "flex-end", // 버튼을 오른쪽 정렬
    gap: "10px", // 버튼 간격 추가
  },

  cancelButton: {
    backgroundColor: "#f0f0f0", // 밝은 회색 배경
    color: "#333", // 텍스트 색상
    padding: "15px 30px",
    fontSize: "16px",
    border: "1px solid #ccc", // 경계선 추가
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.1)", // 그림자를 약간 약하게
    transition: "background-color 0.3s, transform 0.2s",
    ":hover": {
      backgroundColor: "#e0e0e0", // 더 어두운 회색으로 변경
    },
    ":active": {
      transform: "scale(0.95)", // 클릭 시 살짝 눌리는 효과
    },
  },

  confirmButton: {
    backgroundColor: "#4caf50", // 녹색 배경
    color: "white", // 텍스트 색상
    padding: "15px 30px", // 크기를 취소 버튼과 동일하게 설정
    fontSize: "16px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.15)",
    transition: "background-color 0.3s, transform 0.2s",
    ":hover": {
      backgroundColor: "#45a049", // 더 어두운 녹색으로 변경
    },
    ":active": {
      transform: "scale(0.95)", // 클릭 시 살짝 눌리는 효과
    },
  },
};

export default ContactForm;
