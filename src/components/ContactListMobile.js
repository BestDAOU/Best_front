// ContactListMobile.js - 모바일 전용 연락처 리스트 (톤 상태관리 분리)
import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserFriends,
  FaPlus,
  FaEdit,
  FaSave,
  FaHistory,
} from "react-icons/fa";
// import PersonalizationModal from "./PersonalizationModal";
import PersonalizationModalMobile from "./PersonalizationModalMobile"; // ✅ 모바일 모달로 변경
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFriendsByMemberId, deleteFriend } from "../services/FriendsService";
import { getToneByFriendId } from "../services/ToneService"; // 톤 서비스 추가

const ContactListMobile = ({
  message,
  convertedTexts,
  setConvertedTexts,
  selectedContacts,
  setSelectedContacts,
  memberId,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    tag: "",
    memo: "",
    selectedToneId: null,
  });

  const [contacts, setContacts] = useState([]);
  const [activeGroups, setActiveGroups] = useState([]);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  // 톤 상태관리 추가
  const [tones, setTones] = useState([]);
  const [tonesLoading, setTonesLoading] = useState(false);

  // 연락처 목록 가져오기 (톤 정보 제거)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await getFriendsByMemberId(memberId);
        console.log("📦 모바일 - 불러온 contacts:", response.data);

        const mappedContacts = response.data.map((item) => ({
          id: item.id,
          name: item.friendName,
          relationType: item.relationType,
          phone: item.friendPhone,
          email: item.friendEmail,
          tag: item.features,
          memo: item.memos,
          group: item.groupName || "기본",
          selectedToneId: item.selectedToneId || 13,
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

  // 선택된 톤 ID로 톤 이름 찾기 헬퍼 함수
  const getToneNameById = (toneId) => {
    if (!tones || !Array.isArray(tones) || tones.length === 0) {
      return "";
    }
    const tone = tones.find((t) => t.id === toneId);
    return tone ? tone.name : "";
  };

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
      const allSelected = filteredContacts.map((contact) => contact);
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

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 연락처를 삭제하시겠습니까?")) return;
    try {
      await deleteFriend(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSelectedContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const toggleDetails = async (id) => {
    const isExpanding = expandedContactId !== id;
    setExpandedContactId(isExpanding ? id : null);

    // 상세보기를 펼칠 때 해당 친구의 어조 목록 가져오기
    if (isExpanding) {
      try {
        setTonesLoading(true);
        const friendTones = await getToneByFriendId(id);
        console.log(`📦 모바일 - ${id}번 친구 어조 목록:`, friendTones);

        setTones(Array.isArray(friendTones) ? friendTones : []);
      } catch (error) {
        console.error("친구 어조 불러오기 오류:", error);
        setTones([]);
      } finally {
        setTonesLoading(false);
      }
    } else {
      // 세부사항을 닫을 때 tones 초기화
      setTones([]);
    }
  };

  const handleEdit = (contact) => {
    setIsEditing(contact.id);
    setEditData({
      name: contact.name,
      phone: contact.phone,
      tag: contact.tag,
      memo: contact.memo,
      selectedToneId: contact.selectedToneId,
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

  const handleToneSelection = (toneId, toneName) => {
    setEditData((prevData) => ({
      ...prevData,
      selectedToneId: toneId,
    }));
  };

  const groupCounts = contacts.reduce((acc, contact) => {
    acc[contact.group] = (acc[contact.group] || 0) + 1;
    return acc;
  }, {});

  const uniqueGroups = [...new Set(contacts.map((c) => c.group))];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>주소록</h2>
      </div>

      {/* 컨트롤 영역 */}
      <div style={styles.controlSection}>
        {/* 그룹 선택 드롭다운 */}
        <div style={styles.groupSelector}>
          <button
            style={styles.groupDropdownButton}
            onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
          >
            <span>
              그룹 선택 {activeGroups.length > 0 && `(${activeGroups.length})`}
            </span>
            {isGroupDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {isGroupDropdownOpen && (
            <div style={styles.groupDropdown}>
              {uniqueGroups.map((group) => (
                <label key={group} style={styles.groupOption}>
                  <input
                    type="checkbox"
                    checked={activeGroups.includes(group)}
                    onChange={() => toggleGroup(group)}
                    style={styles.groupCheckbox}
                  />
                  <span>
                    {group} ({groupCounts[group]})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 전체 선택 */}
        <div style={styles.selectAllSection}>
          <label style={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={handleAllCheckboxChange}
              style={styles.selectAllCheckbox}
            />
            <span>전체 선택</span>
          </label>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div style={styles.actionButtons}>
        <button style={styles.personalizeButton} onClick={openModal}>
          텍스트 개인 맞춤화
        </button>
        <button
          style={styles.addContactButton}
          onClick={() => navigate(`/contact-form/${memberId}`)}
        >
          <FaPlus size={14} />
          <span style={styles.buttonText}>연락처 추가</span>
        </button>
      </div>

      {/* 선택된 연락처 카운터 */}
      {selectedContacts.length > 0 && (
        <div style={styles.selectedCounter}>
          {selectedContacts.length}명 선택됨
        </div>
      )}

      {/* 연락처 리스트 */}
      <div style={styles.contactsList}>
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} style={styles.contactCard}>
              {/* 연락처 기본 정보 */}
              <div style={styles.contactHeader}>
                <input
                  type="checkbox"
                  checked={selectedContacts.some(
                    (selected) => selected.id === contact.id
                  )}
                  onChange={() => handleCheckboxChange(contact.id)}
                  style={styles.contactCheckbox}
                />

                <div style={styles.contactMainInfo}>
                  <div style={styles.contactName}>
                    <FaUser size={12} />
                    <span>{contact.name}</span>
                  </div>
                  <div style={styles.contactRelation}>
                    <FaUserFriends size={12} />
                    <span>{contact.relationType}</span>
                  </div>
                </div>

                <div style={styles.contactActions}>
                  <button
                    style={styles.detailsToggle}
                    onClick={() => toggleDetails(contact.id)}
                    disabled={tonesLoading && expandedContactId !== contact.id}
                  >
                    {tonesLoading && expandedContactId === contact.id ? (
                      "로딩..."
                    ) : expandedContactId === contact.id ? (
                      <FaChevronUp size={14} />
                    ) : (
                      <FaChevronDown size={14} />
                    )}
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(contact.id)}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* 연락처 상세 정보 */}
              <div style={styles.contactDetails}>
                <div style={styles.contactInfo}>
                  <FaPhone size={12} />
                  <span>{contact.phone}</span>
                </div>
                <div style={styles.contactInfo}>
                  <FaEnvelope size={12} />
                  <span>{contact.email}</span>
                </div>
              </div>

              {/* 확장된 세부사항 */}
              {expandedContactId === contact.id && (
                <div style={styles.expandedDetails}>
                  <div style={styles.detailsActions}>
                    {isEditing === contact.id ? (
                      <button
                        style={styles.saveButton}
                        onClick={() => handleSave(contact.id)}
                      >
                        <FaSave size={12} />
                        <span>저장</span>
                      </button>
                    ) : (
                      <button
                        style={styles.editButton}
                        onClick={() => handleEdit(contact)}
                      >
                        <FaEdit size={12} />
                        <span>수정</span>
                      </button>
                    )}
                    <button style={styles.historyButton}>
                      <FaHistory size={12} />
                      <span>발송 기록</span>
                    </button>
                  </div>

                  {isEditing === contact.id ? (
                    <div style={styles.editForm}>
                      <div style={styles.editField}>
                        <label>이름:</label>
                        <input
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label>전화번호:</label>
                        <input
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label>특징:</label>
                        <input
                          name="tag"
                          value={editData.tag}
                          onChange={handleInputChange}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label>메모:</label>
                        <textarea
                          name="memo"
                          value={editData.memo}
                          onChange={handleInputChange}
                          style={styles.editTextarea}
                          rows={3}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label>어조 선택:</label>
                        <div style={styles.toneButtons}>
                          {tonesLoading ? (
                            <div style={styles.loadingText}>
                              어조 목록을 불러오는 중...
                            </div>
                          ) : tones.length > 0 ? (
                            tones.map((tone) => (
                              <button
                                key={tone.id}
                                onClick={() =>
                                  handleToneSelection(tone.id, tone.name)
                                }
                                style={{
                                  ...styles.toneButton,
                                  backgroundColor:
                                    editData.selectedToneId === tone.id
                                      ? "#4A90E2"
                                      : "#f0f0f0",
                                  color:
                                    editData.selectedToneId === tone.id
                                      ? "white"
                                      : "#333",
                                }}
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
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.displayInfo}>
                      <div style={styles.infoRow}>
                        <strong>특징:</strong> <span>{contact.tag}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <strong>메모:</strong> <span>{contact.memo}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <strong>어조:</strong>
                        {contact.selectedToneId ? (
                          <span style={styles.toneTag}>
                            {getToneNameById(contact.selectedToneId) ||
                              "어조 정보 없음"}
                          </span>
                        ) : (
                          <span style={{ color: "#999" }}>
                            어조가 설정되지 않음
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={styles.noContacts}>선택한 그룹에 연락처가 없습니다.</div>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <PersonalizationModalMobile
          selectedContacts={selectedContacts}
          closeModal={closeModal}
          convertedTexts={convertedTexts}
          setConvertedTexts={setConvertedTexts}
          onComplete={() => setIsModalOpen(false)}
          setContacts={setContacts}
          message={message}
        />
      )}
    </div>
  );
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
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
  },
  controlSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  groupSelector: {
    position: "relative",
    marginBottom: "16px",
  },
  groupDropdownButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  groupDropdown: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    marginTop: "4px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  groupOption: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
  },
  groupCheckbox: {
    marginRight: "12px",
    transform: "scale(1.2)",
  },
  selectAllSection: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: "16px",
  },
  selectAllLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  selectAllCheckbox: {
    marginRight: "12px",
    transform: "scale(1.2)",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  personalizeButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  addContactButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonText: {
    fontSize: "14px",
  },
  selectedCounter: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "8px 16px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
  },
  contactsList: {
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
    alignItems: "center",
    marginBottom: "12px",
  },
  contactCheckbox: {
    marginRight: "12px",
    transform: "scale(1.2)",
  },
  contactMainInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  contactName: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  contactRelation: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#666",
  },
  contactActions: {
    display: "flex",
    gap: "8px",
  },
  detailsToggle: {
    padding: "8px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#666",
  },
  deleteButton: {
    padding: "8px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#e53e3e",
  },
  contactDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingLeft: "24px",
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#666",
  },
  expandedDetails: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f0f0f0",
  },
  detailsActions: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  saveButton: {
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  editButton: {
    padding: "8px 12px",
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  historyButton: {
    padding: "8px 12px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  editField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  editInput: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  editTextarea: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "8px",
  },
  toneButton: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s",
  },
  loadingText: {
    padding: "10px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    fontSize: "12px",
  },
  noTonesText: {
    padding: "10px",
    textAlign: "center",
    color: "#999",
    fontSize: "12px",
  },
  displayInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoRow: {
    fontSize: "14px",
    color: "#333",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  toneTag: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  noContacts: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
    fontSize: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
};

export default ContactListMobile;
