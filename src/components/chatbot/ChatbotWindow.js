import React, { useState } from "react";
import { askToGPT } from "./ChatService";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

const ChatbotWindow = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "안녕하세요! 어떤 도움이 필요하신가요?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await askToGPT(input);
            setMessages([...newMessages, { sender: "bot", text: response.response }]);
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
                <strong style={{ fontSize: "16px" }}>🤖 PicMessage 챗봇</strong>
                <button onClick={onClose} style={styles.closeButton}>
                    <FaTimes />
                </button>
            </div>
            <div style={styles.body}>
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
};

const styles = {
    window: {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "360px",
        height: "500px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        fontFamily: "'Segoe UI', sans-serif",
    },
    header: {
        backgroundColor: "#4A90E2",
        color: "white",
        padding: "14px",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
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
        backgroundColor: "#fdfdfd",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    footer: {
        display: "flex",
        padding: "12px",
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#fafafa",
    },
    input: {
        flex: 1,
        padding: "10px 14px",
        borderRadius: "24px",
        border: "1px solid #ccc",
        fontSize: "14px",
        outline: "none",
    },
    sendButton: {
        backgroundColor: "#4A90E2",
        color: "white",
        border: "none",
        padding: "10px 14px",
        marginLeft: "8px",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    message: {
        padding: "10px 14px",
        borderRadius: "16px",
        fontSize: "14px",
        maxWidth: "75%",
        wordWrap: "break-word",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#f0f0f0",
        borderTopRightRadius: "0px",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f0f0",
        borderTopLeftRadius: "0px",
    },
};

export default ChatbotWindow;
