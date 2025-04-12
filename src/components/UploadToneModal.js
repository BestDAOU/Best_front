// components/UploadToneModal.js
import React, { useState } from "react";
import { analyzeTone } from "../services/ToneAnalyzerService";

const UploadToneModal = ({ onClose, onToneGenerated }) => {
    const [dragOver, setDragOver] = useState(false);
    const [targetName, setTargetName] = useState("");

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];

        if (!targetName.trim()) {
            alert("대상 이름을 입력해주세요.");
            return;
        }

        if (file && file.type === "text/plain") {
            try {
                const toneData = await analyzeTone(file, targetName);
                onToneGenerated(toneData); // toneData = { label, instruction, examples }
                onClose();
            } catch (error) {
                alert("어조 생성에 실패했습니다.");
                console.error("UploadToneModal API 오류:", error?.response?.data || error.message);
            }
        } else {
            alert("txt 파일만 업로드 가능합니다.");
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div
                style={{
                    ...modalStyles.container,
                    border: dragOver ? "3px dashed #4A90E2" : "2px dashed #aaa",
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={(e) => e.stopPropagation()}
            >
                <p style={modalStyles.title}>어조 추출용 .txt 파일을 올려주세요</p>

                <input
                    type="text"
                    placeholder="타겟 이름을 입력하세요 (예: 안예찬)"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    style={modalStyles.input}
                />

                <p style={modalStyles.dragHint}>(이곳에 .txt 파일을 드래그하세요)</p>
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
    },
    container: {
        width: "420px",
        minHeight: "240px",
        backgroundColor: "white",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
        gap: "15px",
    },
    title: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#333",
    },
    input: {
        padding: "10px",
        width: "90%",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontSize: "14px",
    },
    dragHint: {
        fontSize: "12px",
        color: "#999",
    },
};

export default UploadToneModal;
