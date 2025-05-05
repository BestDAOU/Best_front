// ContactList.js - 좌우 레이아웃 (왼쪽 그룹 선택, 오른쪽 연락처 목록)

import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserFriends,
} from "react-icons/fa";
import PersonalizationModal from "./PersonalizationModal";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFriendsByMemberId } from "../services/FriendsService"; // ✅ DB API 호출

const ContactList = ({
  message,
  convertedTexts,
  setConvertedTexts,
  selectedContacts,
  setSelectedContacts,
  memberId, // ✅ 이걸 꼭 전달해야 함
}) => {
  // 상태 관련 코드는 변경 없음
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editData, setEditData] = useState({
    tag: "",
    memo: "",
    tone: "",
    selectedToneId: null,
  });

  const contactsobj = useSelector((state) => state.contacts); // Redux에서 상태 가져오기
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await getFriendsByMemberId(memberId);
        console.log("📦 불러온 contacts:", response.data);
        const mappedContacts = response.data.map((item) => ({
          id: item.id,
          name: item.friendName,
          phone: item.friendPhone,
          email: item.friendEmail,
          tag: item.features, // features → tag
          tone: item.selectedToneId
            ? item.tonesInfo.find((t) => t.id === item.selectedToneId)?.name ||
              ""
            : "",
          memo: item.memos,
          group: item.groupName || "기본", // group 필드 없을 경우 대비
          tonesInfo: item.tonesInfo || [], // tonesInfo 추가
          selectedToneId: item.selectedToneId || null, // selectedToneId 추가
        }));
        setContacts(mappedContacts);
      } catch (error) {
        console.error("연락처 불러오기 오류:", error);
      }
    };

    if (memberId) {
      fetchContacts();
    }
  }, [memberId]);

  const [activeGroups, setActiveGroups] = useState([]);

  const [isPersonalizeHovered, setIsPersonalizeHovered] = useState(false);
  const [isAddContactHovered, setIsAddContactHovered] = useState(false);

  // 함수들은 변경 없음
  const toggleGroup = (groupName) => {
    if (activeGroups.includes(groupName)) {
      setActiveGroups((prev) => prev.filter((g) => g !== groupName));
      setSelectedContacts((prev) =>
        prev.filter((sc) => sc.group !== groupName)
      );
    } else {
      setActiveGroups((prev) => [...prev, groupName]);
    }
  };

  const filteredContacts =
    activeGroups.length === 0
      ? contacts
      : contacts.filter((contact) => activeGroups.includes(contact.group));

  const generateMessagesForSelectedContacts = () => {
    const texts = selectedContacts.reduce((acc, contact) => {
      acc[contact.id] = convertedTexts[contact.id] || message;
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

  const handleCheckboxChange = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);

    setSelectedContacts((prevSelected) => {
      const alreadySelected = prevSelected.some(
        (selected) => selected.id === contactId
      );

      if (alreadySelected) {
        return prevSelected.filter((selected) => selected.id !== contactId);
      } else {
        setConvertedTexts((prevTexts) => ({
          ...prevTexts,
          [contact.id]: prevTexts[contact.id] || message,
        }));
        return [...prevSelected, contact];
      }
    });
  };

  const handleAllCheckboxChange = () => {
    if (isAllChecked) {
      setSelectedContacts([]);
    } else {
      const allSelected = contacts.map((contact) => contact);
      setSelectedContacts(allSelected);

      setConvertedTexts((prevTexts) => {
        const newTexts = { ...prevTexts };
        allSelected.forEach((contact) => {
          if (!newTexts[contact.id]) {
            newTexts[contact.id] = message;
          }
        });
        return newTexts;
      });
    }
    setIsAllChecked(!isAllChecked);
  };

  const handleDelete = (id) => {
    const remainingContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(remainingContacts);
    setSelectedContacts((prevSelected) =>
      prevSelected.filter((selected) => selected.id !== id)
    );
  };

  const toggleDetails = (id) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };

  const handleEdit = (contact) => {
    setIsEditing(contact.id);
    setEditData({
      name: contact.name,
      phone: contact.phone,
      tag: contact.tag,
      memo: contact.memo,
      tone: contact.tone,
      selectedToneId: contact.selectedToneId, // selectedToneId 추가
    });
  };

  const handleSave = (contactId) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId ? { ...contact, ...editData } : contact
    );
    setContacts(updatedContacts);

    setSelectedContacts((prevSelected) =>
      prevSelected.map((contact) =>
        contact.id === contactId ? { ...contact, ...editData } : contact
      )
    );

    setIsEditing(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  // 수정: tone 선택시 selectedToneId도 함께 업데이트
  const handleToneSelection = (toneId, toneName) => {
    setEditData((prevData) => ({
      ...prevData,
      tone: toneName,
      selectedToneId: toneId,
    }));
  };

  // 여기서부터 JSX 반환 부분이 바뀝니다
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>주소록</h2>
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div style={styles.horizontalLayout}>
        {/* 왼쪽 그룹 선택 섹션 */}
        <div style={styles.leftSection}>
          <h3 style={styles.sectionTitle}>그룹 선택</h3>
          <div style={styles.groupButtonsList}>
            {[...new Set(contacts.map((c) => c.group))].map((group) => (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                style={
                  activeGroups.includes(group)
                    ? styles.activeGroupButton
                    : styles.groupButton
                }
              >
                {group} ({contacts.filter((c) => c.group === group).length})
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽 연락처 목록 섹션 */}
        <div style={styles.rightSection}>
          <div style={styles.contactListHeader}>
            <div style={styles.icons}>
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={handleAllCheckboxChange}
                style={{
                  ...styles.checkbox,
                  transform: "scale(1.8)",
                  marginRight: "10px",
                }}
              />
              <span style={styles.selectAllText}>전체 선택</span>
            </div>
            <div style={styles.buttonsContainer}>
              <button
                style={
                  isPersonalizeHovered
                    ? {
                        ...styles.personalizeButton,
                        ...styles.personalizeButtonHover,
                      }
                    : styles.personalizeButton
                }
                onClick={openModal}
                onMouseEnter={() => setIsPersonalizeHovered(true)}
                onMouseLeave={() => setIsPersonalizeHovered(false)}
              >
                텍스트 개인 맞춤화
              </button>

              <button
                style={
                  isAddContactHovered
                    ? {
                        ...styles.personalizeButton,
                        ...styles.personalizeButtonHover,
                      }
                    : styles.personalizeButton
                }
                onClick={() => navigate(`/contact-form/${memberId}`)}
                onMouseEnter={() => setIsAddContactHovered(true)}
                onMouseLeave={() => setIsAddContactHovered(false)}
              >
                <span style={styles.plusIcon}>+</span> &nbsp;연락처 추가
              </button>
            </div>
          </div>

          {isModalOpen && (
            <PersonalizationModal
              selectedContacts={selectedContacts}
              closeModal={closeModal}
              convertedTexts={convertedTexts}
              setConvertedTexts={setConvertedTexts}
              onComplete={() => setIsModalOpen(false)}
              setContacts={setContacts}
              message={message}
              //
            />
          )}

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

            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    ...styles.contactItem,
                  }}
                >
                  <div style={styles.contactInfo}>
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

                    <div style={styles.actionButtons}>
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
                      <button
                        onClick={() => handleDelete(contact.id)}
                        style={styles.deleteButton}
                      >
                        <FaTrash style={{ ...styles.icon }} />
                      </button>
                    </div>
                  </div>

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
                            {/* 해당 연락처의 tonesInfo 사용 */}
                            {contact.tonesInfo &&
                              contact.tonesInfo.map((tone) => (
                                <button
                                  key={tone.id}
                                  onClick={() =>
                                    handleToneSelection(tone.id, tone.name)
                                  }
                                  style={{
                                    ...styles.toneButton,
                                    backgroundColor:
                                      editData.selectedToneId === tone.id
                                        ? "#007bff"
                                        : "#ccc",
                                    color:
                                      editData.selectedToneId === tone.id
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  {tone.name}
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
                            <strong>어조:</strong>{" "}
                            {contact.selectedToneId && (
                              <span
                                style={{
                                  ...styles.toneTag,
                                  display: "inline-block",
                                }}
                              >
                                {contact.tonesInfo.find(
                                  (t) => t.id === contact.selectedToneId
                                )?.name || ""}
                              </span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.noData}>선택한 그룹에 연락처가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // 기본 컨테이너
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
    // backgroundColor: "#F9FAFB",
    padding: "0px",
    overflow: "hidden", // 추가: 내부 요소가 넘치지 않도록
  },

  // 헤더 스타일
  header: {
    marginBottom: "20px",
    borderBottom: "2px solid #4A90E2",
    paddingBottom: "10px",
    textAlign: "center", // 텍스트 중앙 정렬 추가
  },

  // 좌우 레이아웃 컨테이너
  horizontalLayout: {
    display: "flex",
    width: "100%",
    gap: "20px",
    boxSizing: "border-box",
    flexWrap: "nowrap", // 추가: 줄바꿈 방지
  },

  // 왼쪽 섹션 (그룹 선택)
  leftSection: {
    width: "230px",
    flexShrink: 0, // 압축되지 않도록
    backgroundColor: "#F0F4FA", // 연한 파란색 배경
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
    position: "sticky",
    top: "20px",
  },

  sectionTitle: {
    marginBottom: "15px",
    color: "#2C5282", // 좀 더 진한 파란색으로 변경
    fontWeight: "600",
    fontSize: "16px",
    borderBottom: "2px solid #4A90E2", // 하단 경계선 추가
    paddingBottom: "8px", // 하단 패딩 추가
  },

  // 그룹 버튼 리스트 (세로 형태)
  groupButtonsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  groupButton: {
    padding: "10px 15px",
    backgroundColor: "white", // 버튼 배경은 흰색으로 유지
    border: "1px solid #d0d7de",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    textAlign: "left",
    width: "100%", // 너비 100%로 설정
  },

  activeGroupButton: {
    padding: "10px 15px",
    backgroundColor: "#e6f0ff",
    border: "2px solid #007bff",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#007bff",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)",
    transition: "all 0.2s ease-in-out",
    textAlign: "left",
  },

  // 필요하다면 rightSection 패딩도 추가로 조정
  rightSection: {
    flex: "1",
    minWidth: "0",
    padding: "20px 0", // 좌우 패딩 제거
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  // contactListHeader도 수정하여 버튼 컨테이너가 완전히 오른쪽에 붙지 않도록 함
  contactListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    width: "100%", // 너비 100% 명시적 지정
    boxSizing: "border-box", // 박스 사이징 추가
  },

  // 연락처 목록 컨테이너
  contactListContainer: {
    border: "1px solid #4A90E2",
    borderRadius: "8px",
    padding: "10px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    overflowX: "auto", // 추가: 필요시 가로 스크롤 가능하도록
    height: "700px", // 고정 높이 설정
  },

  // 1. 전체 선택 체크박스와 텍스트를 왼쪽에서 띄우기 위한 수정
  icons: {
    display: "flex",
    alignItems: "center",
    marginLeft: "15px", // 왼쪽에서 15px 띄움
  },

  checkbox: {
    marginRight: "10px",
    transform: "scale(1.5)",
  },

  selectAllText: {
    color: "black",
    fontSize: "15px",
  },

  // 주소록 헤더 행
  contactHeaderRow: {
    display: "flex",
    alignItems: "center",
    padding: "5px 0",
    marginLeft: "25px",
    borderBottom: "1px solid #4A90E2",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#4A90E2",
    minWidth: "700px", // 최소 너비 설정
  },

  headerItem: {
    marginLeft: "53px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    width: "100px",
  },

  // 2. 연락처 추가 버튼 등을 오른쪽에서 띄우기 위한 수정
  buttonsContainer: {
    display: "flex",
    gap: "10px",
    marginRight: "15px", // 오른쪽에서 15px 띄움
  },

  personalizeButton: {
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
    display: "flex",
    alignItems: "center",
  },

  personalizeButtonHover: {
    background: "#007BFF",
    transform: "scale(1.05)",
    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)",
  },

  plusIcon: {
    fontSize: "18px",
    marginRight: "5px",
  },

  // 연락처 항목
  contactItem: {
    padding: "15px",
    borderBottom: "1px solid #ccc",
  },

  // 연락처 정보
  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "30px", // 간격 줄임
    justifyContent: "space-between",
    flexWrap: "nowrap", // 줄바꿈 방지
    minWidth: "700px", // 최소 너비 설정
    maxWidth: "100%", // 최대 너비 제한
  },

  // 연락처 정보
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

  // 액션 버튼 (세부정보, 삭제)
  actionButtons: {
    display: "flex",
    gap: "10px",
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

  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },

  icon: {
    color: "#808080",
    fontSize: "20px",
    cursor: "pointer",
  },

  // 세부 정보 컨테이너
  detailsContainer: {
    backgroundColor: "#e9f5ff",
    padding: "15px",
    border: "1px solid #007bff",
    borderRadius: "8px",
    marginTop: "10px",
  },

  detailsHeader: {
    display: "flex",
    marginBottom: "15px",
  },

  saveButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },

  sendRecordButton: {
    backgroundColor: "#0086BF",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  // 편집 입력 필드
  editInput: {
    width: "100%",
    maxWidth: "700px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #4A90E2",
    fontSize: "16px",
    marginBottom: "10px",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },

  // 톤 버튼
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },

  toneButton: {
    padding: "8px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },

  // 데이터 없음 메시지
  noData: {
    textAlign: "center",
    padding: "30px",
    color: "#888",
    fontSize: "16px",
    height: "500px", // 컨테이너 패딩 고려해서 계산
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default ContactList;
