import React, { useState, useEffect, useRef } from "react";
import { askToGPT } from "./ChatService";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

const ChatbotWindow = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "안녕하세요! 어떤 도움이 필요하신가요?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingFriendParams, setPendingFriendParams] = useState(null); // 누락된 friend 정보 저장
    const [awaitingField, setAwaitingField] = useState(null); // 어떤 필드를 기다리고 있는지
    const [pendingMessageParams, setPendingMessageParams] = useState(null);
    const [awaitingMessageOnly, setAwaitingMessageOnly] = useState(false);
    // ① 채팅 영역 ref
    const bodyRef = useRef(null);

    // ② messages 또는 loading 변경 시 맨 아래로 스크롤
    useEffect(() => {
        if (bodyRef.current) {
            // 부드럽게 스크롤
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            // ✅ 메시지 내용만 기다리는 중이라면
            if (awaitingMessageOnly && pendingMessageParams) {
                const completedParams = {
                    ...pendingMessageParams,
                    message: input,
                };

                const finalResponse = await askToGPT(JSON.stringify({
                    action: "send_message",
                    params: completedParams,
                }));

                setMessages([...newMessages, { sender: "bot", text: finalResponse.response }]);
                setPendingMessageParams(null);
                setAwaitingMessageOnly(false);
                setLoading(false);
                return;
            }

            // ✅ 연락처 필드 입력 흐름
            if (awaitingField && pendingFriendParams) {
                const updatedParams = {
                    ...pendingFriendParams,
                    [awaitingField]: input,
                };

                const required = ["friendName", "friendPhone", "friendEmail", "features", "memos", "groupName", "relationType"];
                const missing = required.filter(field => !updatedParams[field] || updatedParams[field].trim() === "");

                if (missing.length > 0) {
                    setPendingFriendParams(updatedParams);
                    setAwaitingField(missing[0]);

                    const fieldFriendlyNames = {
                        friendName: "이름을 알려주세요 😊",
                        friendPhone: "전화번호를 알려주세요 📱",
                        friendEmail: "이메일 주소를 알려주세요 ✉️",
                        features: "이 친구의 특징은 어떤가요?",
                        memos: "기억해두고 싶은 내용을 말씀해주세요!",
                        groupName: "이 친구는 어떤 그룹에 속하나요?",
                        relationType: "관계 유형을 알려주세요 (예: 친구, 가족 등)",
                    };

                    setMessages([
                        ...newMessages,
                        { sender: "bot", text: fieldFriendlyNames[missing[0]] || `${missing[0]} 정보를 입력해주세요.` },
                    ]);
                } else {
                    const finalResponse = await askToGPT(JSON.stringify({
                        action: "add_friend",
                        params: updatedParams,
                    }));

                    setMessages([
                        ...newMessages,
                        { sender: "bot", text: finalResponse.response },
                    ]);
                    setPendingFriendParams(null);
                    setAwaitingField(null);
                }

                setLoading(false);
                return;
            }

            // ✅ 일반 질문 처리
            const response = await askToGPT(input);

            if (response.action === "missing_fields") {
                if (response.missing.includes("message") && response.params) {
                    // 메시지 누락 시 처리
                    setPendingMessageParams(response.params);
                    setAwaitingMessageOnly(true);
                    setMessages([
                        ...newMessages,
                        { sender: "bot", text: "어떤 메시지를 보내고 싶으신가요? ✉️" },
                    ]);
                } else {
                    // 연락처 필드 누락 시 처리
                    setPendingFriendParams(response.params || {});
                    setAwaitingField(response.missing[0]);

                    setMessages([
                        ...newMessages,
                        { sender: "bot", text: response.message || `${response.missing[0]} 정보가 필요해요.` },
                    ]);
                }
            } else {
                setMessages([...newMessages, { sender: "bot", text: response.response || "처리되었습니다." }]);
            }
        } catch (error) {
            setMessages([
                ...newMessages,
                { sender: "bot", text: "오류가 발생했습니다. 다시 시도해주세요." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div style={styles.window}>
            <div style={styles.header}>
                <strong style={{ fontSize: "16px" }}>ForYou 챗봇</strong>
                <button onClick={onClose} style={styles.closeButton}>
                    <FaTimes />
                </button>
            </div>
            <div style={styles.body} ref={bodyRef}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            ...styles.message,
                            ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
                {loading && <div style={styles.botMessage}>답변 작성 중...</div>}
            </div>
            <div style={styles.footer}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="질문을 입력하세요..."
                    style={styles.input}
                />
                <button onClick={handleSend} style={styles.sendButton}>
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
}; const styles = {
    window: {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "360px",
        height: "500px",
        background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        fontFamily: "'Apple SD Gothic Neo', 'Pretendard', sans-serif",
    },
    header: {
        background: "linear-gradient(to right, #4A90E2, #007BFF)",
        color: "white",
        padding: "14px",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    closeButton: {
        background: "none",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontSize: "18px",
    },
    body: {
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    footer: {
        display: "flex",
        padding: "12px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
    },
    input: {
        flex: 1,
        padding: "10px 14px",
        borderRadius: "24px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "#f3f4f6",
    },
    sendButton: {
        background: "linear-gradient(to right, #4A90E2, #007BFF)",
        color: "white",
        border: "none",
        padding: "10px",
        marginLeft: "8px",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    },
    message: {
        padding: "10px 14px",
        borderRadius: "18px",
        fontSize: "14px",
        maxWidth: "75%",
        wordWrap: "break-word",
        lineHeight: "1.5",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "white",
        color: "#4B2991",
        borderTopRightRadius: "0px",
        border: "1px solid #e5e7eb",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderTopLeftRadius: "0px",
        color: "#374151",
    },
};

export default ChatbotWindow;
