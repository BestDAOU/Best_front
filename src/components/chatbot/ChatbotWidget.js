// src/components/chatbot/ChatbotWidget.jsx

import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatbotWindow from "./ChatbotWindow";

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <>
            <div style={styles.floatingButton} onClick={toggleChat}>
                <FaComments size={24} color="white" />
            </div>
            {isOpen && <ChatbotWindow onClose={toggleChat} />}
        </>
    );
};

const styles = {
    floatingButton: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#4A90E2",
        width: "60px",
        height: "60px",
        borderRadius: "30px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
    },
};

export default ChatbotWidget;
