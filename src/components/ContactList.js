//주소록 및 카테고리 전환 컴포넌트
import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserFriends,
} from "react-icons/fa"; // 필요한 아이콘 추가
import PersonalizationModal from "./PersonalizationModal"; // 모달 컴포넌트 임포트
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 사용
import tonesobj from "../data/tones.json"; // JSON 파일 import
import { useSelector } from "react-redux";

const ContactList = ({
  message,
  setMessage,
  convertedTexts,
  setConvertedTexts,
  selectedContacts,
  setSelectedContacts,
}) => {
  const tones = tonesobj;
  const navigate = useNavigate(); // navigate 훅 선언
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태
  const [expandedContactId, setExpandedContactId] = useState(null); // 세부사항이 확장된 연락처 ID
  const [isAllChecked, setIsAllChecked] = useState(false); // 전체 선택 상태를 저장하는 변수
  const [isEditing, setIsEditing] = useState(null); // 수정 모드 상태 저장
  const [editData, setEditData] = useState({ tag: "", memo: "", tone: "" });

  const contactsobj = useSelector((state) => state.contacts); // Redux에서 상태 가져오기
  const [contacts, setContacts] = useState(contactsobj);

  const [activeGroups, setActiveGroups] = useState([]); // 여러 그룹 선택을 위한 배열

  const toggleGroup = (groupName) => {
    const groupContacts = contacts.filter((c) => c.group === groupName);

    const isAlreadySelected = groupContacts.every((gc) =>
      selectedContacts.some((sc) => sc.id === gc.id)
    );

    if (isAlreadySelected) {
      // 선택 해제
      setSelectedContacts((prev) =>
        prev.filter((sc) => sc.group !== groupName)
      );
      // 🔽 여기 추가
      setActiveGroups((prev) => prev.filter((g) => g !== groupName));
    } else {
      // 선택 추가
      setSelectedContacts((prev) => {
        const newContacts = groupContacts.filter(
          (gc) => !prev.some((sc) => sc.id === gc.id)
        );
        return [...prev, ...newContacts];
      });

      setConvertedTexts((prev) => {
        const updated = { ...prev };
        groupContacts.forEach((c) => {
          if (!updated[c.id]) {
            updated[c.id] = message;
          }
        });
        return updated;
      });

      // 🔽 여기 추가
      setActiveGroups((prev) => [...prev, groupName]);
    }
  };

  const filteredContacts =
    activeGroups.length === 0
      ? [] // 아무 그룹도 선택 안 했을 경우 비워줌
      : contacts.filter((contact) => activeGroups.includes(contact.group));

  const generateMessagesForSelectedContacts = () => {
    const texts = selectedContacts.reduce((acc, contact) => {
      acc[contact.id] = convertedTexts[contact.id] || message; // 기존 메시지가 있으면 유지, 없으면 기본 메시지 설정
      return acc;
    }, {});
    setConvertedTexts(texts);
  };

  const openModal = () => {
    if (selectedContacts.length === 0) {
      alert("개인 맞춤화를 위해 하나 이상의 연락처를 선택하세요.");
      return;
    }
    generateMessagesForSelectedContacts();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 체크박스 선택 처리 함수
  const handleCheckboxChange = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId); // 선택된 연락처 찾기

    setSelectedContacts((prevSelected) => {
      const alreadySelected = prevSelected.some(
        (selected) => selected.id === contactId
      );

      if (alreadySelected) {
        // 선택 해제 (convertedTexts는 삭제하지 않음)
        return prevSelected.filter((selected) => selected.id !== contactId);
      } else {
        // 선택 추가
        setConvertedTexts((prevTexts) => ({
          ...prevTexts,
          [contact.id]: prevTexts[contact.id] || message, // 기존 메시지가 없으면 기본 메시지 추가
        }));
        return [...prevSelected, contact];
      }
    });
  };

  // 전체 체크박스 선택/해제 처리 함수
  const handleAllCheckboxChange = () => {
    if (isAllChecked) {
      // 모든 선택 해제
      setSelectedContacts([]);
    } else {
      // 모든 연락처 선택
      const allSelected = contacts.map((contact) => contact);
      setSelectedContacts(allSelected);

      setConvertedTexts((prevTexts) => {
        const newTexts = { ...prevTexts };
        allSelected.forEach((contact) => {
          if (!newTexts[contact.id]) {
            newTexts[contact.id] = message; // 기본 메시지 추가
          }
        });
        return newTexts;
      });
    }
    setIsAllChecked(!isAllChecked); // 상태 반전
  };

  const handleDelete = (id) => {
    const remainingContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(remainingContacts); // 삭제된 연락처 목록 업데이트
    setSelectedContacts((prevSelected) =>
      prevSelected.filter((selected) => selected.id !== id)
    ); // 선택된 목록에서 삭제
  };

  // 세부사항 토글 함수
  const toggleDetails = (id) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };
  // 수정 모드로 전환
  const handleEdit = (contact) => {
    setIsEditing(contact.id);
    setEditData({
      name: contact.name, // 이름 추가
      phone: contact.phone, // 전화번호 추가
      tag: contact.tag,
      memo: contact.memo,
      tone: contact.tone,
    });
  };

  // 수정 완료 후 저장
  const handleSave = (contactId) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId ? { ...contact, ...editData } : contact
    );
    setContacts(updatedContacts);

    // 선택된 연락처도 업데이트
    setSelectedContacts((prevSelected) =>
      prevSelected.map((contact) =>
        contact.id === contactId ? { ...contact, ...editData } : contact
      )
    );

    setIsEditing(null); // 수정 모드 종료
  };

  // input 값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  // 특정 연락처의 어조 선택 함수
  const handleToneSelection = (tone) => {
    setEditData((prevData) => ({ ...prevData, tone: tone }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>주소록</h2>
      </div>

      <div style={styles.sidebarAndMain}>
        {/* 왼쪽 그룹 선택 메뉴 */}
        <div style={styles.sidebar}>
          <h3 style={{ marginBottom: "10px" }}>그룹 선택</h3>
          {[...new Set(contacts.map((c) => c.group))].map((group) => (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              style={
                activeGroups.includes(group)
                  ? styles.activeSidebarButton
                  : styles.sidebarButton
              }
            >
              {group} ({contacts.filter((c) => c.group === group).length})
            </button>
          ))}
        </div>

        {/* 오른쪽 주소록 메인 영역 */}
        <div style={styles.mainContent}>
          <div style={styles.actions}>
            <div style={styles.icons}>
              {/* 전체 선택/해제 체크박스 */}
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={handleAllCheckboxChange} // 전체 선택 함수 호출
                style={{
                  ...styles.checkbox,
                  transform: "scale(1.8)",
                  marginLeft: "-35px",
                }} // 크기 확대
              />
              <span style={styles.selectAllText}>전체 선택</span>
            </div>
            <div style={styles.buttonsContainer}>
              {/* 텍스트 개인 맞춤화 버튼에 onClick 이벤트 추가 */}
              <button style={styles.personalizeButton} onClick={openModal}>
                텍스트 개인 맞춤화
              </button>
              {/* 연락처 추가 버튼 */}
              <button
                style={styles.personalizeButton}
                onClick={() => navigate("/contact-form")}
              >
                <span style={styles.plusIcon}>+</span> &nbsp;연락처 추가
              </button>
            </div>
          </div>
          {/* 모달 컴포넌트 호출 */}
          {isModalOpen && (
            <PersonalizationModal
              selectedContacts={selectedContacts} // 이미 객체 배열 형태
              closeModal={closeModal}
              convertedTexts={convertedTexts}
              setConvertedTexts={setConvertedTexts} // 수신자별 메시지를 업데이트
              onComplete={() => setIsModalOpen(false)} // 완료 후 모달 닫기
              //추가
              setContacts={setContacts} // 추가
              message={message}
              //
            />
          )}

          <div style={styles.contactContainer}>
            <div style={styles.contactListContainer}>
              <div style={styles.contactHeaderRow}>
                <span style={styles.headerItem}>
                  <FaUser /> 이름
                </span>
                <span style={styles.headerItem}>
                  <FaUserFriends /> 관계
                </span>
                <span style={{ ...styles.headerItem, marginLeft: "70px" }}>
                  <FaEnvelope /> 이메일
                </span>
                <span style={{ ...styles.headerItem, marginLeft: "113px" }}>
                  <FaPhone /> 전화번호
                </span>
              </div>
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      ...styles.contactItem, // 행 색상 교차
                    }}
                  >
                    <div style={styles.contactInfo}>
                      {/* <input type="checkbox" style={styles.checkbox} /> */}
                      <input
                        type="checkbox"
                        checked={selectedContacts.some(
                          (selected) => selected.id === contact.id
                        )}
                        onChange={() => handleCheckboxChange(contact.id)}
                        style={styles.checkbox}
                      />
                      <span style={styles.name}>{contact.name}</span>
                      <span style={styles.nickname}>{contact.nickname}</span>
                      <span style={styles.email}>{contact.email}</span>
                      <span style={styles.phone}>{contact.phone}</span>

                      <button
                        onClick={() => toggleDetails(contact.id)}
                        style={
                          expandedContactId === contact.id
                            ? styles.detailsButtonActive
                            : styles.detailsButton
                        }
                      >
                        {expandedContactId === contact.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                      <br></br>
                      {/* 휴지통 버튼 */}
                      <button
                        onClick={() => handleDelete(contact.id)}
                        style={styles.deleteButton}
                      >
                        <FaTrash style={{ ...styles.icon }} />
                      </button>
                    </div>

                    {/* 세부사항 펼쳐지는 부분 */}
                    {expandedContactId === contact.id && (
                      <div style={styles.detailsContainer}>
                        <div style={styles.detailsHeader}>
                          {isEditing === contact.id ? (
                            <button
                              style={styles.saveButton}
                              onClick={() => handleSave(contact.id)}
                            >
                              저장
                            </button>
                          ) : (
                            <button
                              style={styles.saveButton}
                              onClick={() => handleEdit(contact)}
                            >
                              수정
                            </button>
                          )}
                          <button style={styles.sendRecordButton}>
                            발송 기록
                          </button>
                        </div>
                        {isEditing === contact.id ? (
                          <>
                            <p>
                              <strong>이름:</strong>{" "}
                              <input
                                name="name"
                                value={editData.name}
                                onChange={handleInputChange}
                                style={styles.editInput}
                              />
                            </p>
                            <p>
                              <strong>전화번호:</strong>{" "}
                              <input
                                name="phone"
                                value={editData.phone}
                                onChange={handleInputChange}
                                style={styles.editInput}
                              />
                            </p>
                            <p>
                              <strong>특징:</strong>{" "}
                              <input
                                name="tag"
                                value={editData.tag}
                                onChange={handleInputChange}
                                style={styles.editInput}
                              />
                            </p>
                            <p>
                              <strong>메모:</strong>{" "}
                              <input
                                name="memo"
                                value={editData.memo}
                                onChange={handleInputChange}
                                style={styles.editInput}
                              />
                            </p>
                            <p>
                              <strong>어조 선택:</strong>
                            </p>
                            <div style={styles.toneButtons}>
                              {tones.map((tone) => (
                                <button
                                  key={tone.label}
                                  onClick={() =>
                                    handleToneSelection(tone.label)
                                  }
                                  style={{
                                    ...styles.toneButton,
                                    backgroundColor:
                                      editData.tone === tone.label
                                        ? "#007bff"
                                        : "#ccc",
                                    color:
                                      editData.tone === tone.label
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  {tone.label}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              <strong>특징:</strong> {contact.tag}
                            </p>
                            <p>
                              <strong>메모:</strong> {contact.memo}
                            </p>
                            <p>
                              <strong>어조:</strong> {contact.tone}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={styles.noData}>데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  contactContainer: {
    display: "flex",
    justifyContent: "center", // 가로 가운데 정렬
    backgroundColor: "white", // 배경색 추가 (선택)
  },

  container: {
    padding: "20px",
    width: "1200px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "10px",
  },
  tabs: {
    display: "flex",
    padding: "10px",
    borderBottom: "1px solid #4A90E2",
    marginBottom: "10px",
    justifyContent: "center",
  },
  tab: {
    padding: "10px 20px",
    border: "1px solid #4A90E2", // 테두리 추가
    background: "none",
    cursor: "pointer",
    color: "#333",
    borderRadius: "5px", // 둥근 테두리
    margin: "0 5px", // 버튼 간격 추가
  },
  activeTab: {
    padding: "10px 20px",
    border: "1px solid #4A90E2", // 테두리 유지
    background: "#E6F4FF", // 활성화된 배경색 추가
    fontWeight: "bold",
    color: "#007bff",
    borderRadius: "5px",
    margin: "0 5px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  icons: {
    marginLeft: "160px",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    color: "#808080",
    fontSize: "20px",
    marginLeft: "10px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
  },
  buttonsContainer: {
    marginRight: "80px",
    display: "flex",
    gap: "10px",
  },
  personalizeButton: {
    backgroundColor: "#0086BF",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  plusIcon: {
    fontSize: "18px",
    marginRight: "5px",
  },
  contactListContainer: {
    border: "1px solid #4A90E2",
    borderRadius: "8px",
    padding: "10px",
    width: "950px",
    backgroundColor: "#ffffff",
  },
  contactHeaderRow: {
    display: "flex",
    alignItems: "center",
    padding: "5px 0",
    marginLeft: "25px",
    borderBottom: "1px solid #4A90E2",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#4A90E2",
  },
  headerItem: {
    marginLeft: "53px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    width: "100px",
  },
  contactItem: {
    padding: "15px",
    borderBottom: "1px solid #ccc",
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "50px",
    justifyContent: "space-between", // 각 열 사이를 일정 간격 유지
  },
  profileImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  name: {
    width: "100px",
  },
  nickname: {
    width: "100px",
  },
  email: {
    width: "200px",
  },
  phone: {
    width: "150px",
  },
  detailsButton: {
    backgroundColor: "#ffffff",
    color: "#007bff",
    border: "1px solid #007bff",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  detailsButtonActive: {
    backgroundColor: "#007bff",
    color: "white",
    border: "1px solid #007bff",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  detailsContainer: {
    backgroundColor: "#e9f5ff",
    padding: "10px",
    border: "1px solid #007bff",
    borderRadius: "8px",
    marginTop: "10px",
  },
  detailsHeader: {
    display: "flex",
    marginBottom: "10px",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  sendRecordButton: {
    backgroundColor: "#0086BF",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
  },
  checkbox: {
    marginRight: "10px",
    transform: "scale(1.5)",
  },
  toneButton: {
    padding: "8px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
  selectAllText: {
    color: "black",
  },
  editInput: {
    width: "100%", // 가로 100%로 확장
    maxWidth: "700px", // 최대 너비 제한
    padding: "10px", // 내부 여백 추가
    borderRadius: "8px", // 둥근 테두리
    border: "1px solid #4A90E2", // 연한 파란색 테두리
    fontSize: "16px", // 글씨 크기 조정
    marginBottom: "10px", // 입력 필드 간 간격 추가
    outline: "none", // 포커스 시 외곽선 제거
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // 약간의 그림자 추가
    transition: "border-color 0.3s, box-shadow 0.3s", // 부드러운 효과
  },
  editInputFocus: {
    borderColor: "#007bff", // 포커스 시 테두리 색 변경
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.2)", // 포커스 시 그림자 강조
  },
  sidebarAndMain: {
    display: "flex",
    flexDirection: "row",
  },

  sidebar: {
    width: "180px",
    padding: "10px",
    borderRight: "1px solid #ccc",
    marginRight: "20px",
  },

  sidebarButton: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    marginBottom: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #d0d7de",
    borderRadius: "8px",
    textAlign: "left",
    cursor: "pointer",
    color: "#333",
    fontSize: "15px",
    fontWeight: "500",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
  },
  activeSidebarButton: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    marginBottom: "12px",
    backgroundColor: "#e6f0ff",
    border: "2px solid #007bff",
    borderRadius: "8px",
    textAlign: "left",
    cursor: "pointer",
    color: "#007bff",
    fontWeight: "600",
    boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",
    transition: "all 0.2s ease-in-out",
  },
  mainContent: {
    flex: 1,
  },
};

export default ContactList;
