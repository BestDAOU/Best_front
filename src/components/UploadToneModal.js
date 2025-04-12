import React, { useState } from "react";
import { analyzeTone } from "../services/ToneAnalyzerService";

const UploadToneModal = ({ onClose, onToneGenerated }) => {
    const [step, setStep] = useState(1);
    const [targetName, setTargetName] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileUpload = async (file) => {
        if (!targetName.trim()) {
            alert("이름을 먼저 입력해주세요.");
            return;
        }
        if (!file || file.type !== "text/plain") {
            alert("txt 파일만 업로드 가능합니다.");
            return;
        }

        try {
            const toneData = await analyzeTone(file, targetName);
            onToneGenerated(toneData);
            onClose();
        } catch (error) {
            alert("어조 생성에 실패했습니다.");
            console.error("UploadToneModal API 오류:", error?.response?.data || error.message);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        setSelectedFile(file);
        handleFileUpload(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        handleFileUpload(file);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {step === 1 && (
                    <>
                        <h3 style={styles.stepTitle}>🎙️ 말투 추출 대상 입력</h3>

                        <p style={styles.stepDescription}>
                            텍스트 파일에서 어떤 사람의 말투를 추출할까요?
                        </p>

                        <input
                            type="text"
                            value={targetName}
                            onChange={(e) => setTargetName(e.target.value)}
                            placeholder="예: 안예찬"
                            style={styles.stylishInput}
                        />

                        <div style={styles.buttonRow}>
                            <button
                                style={{
                                    ...styles.primaryButton,
                                    opacity: !targetName.trim() ? 0.5 : 1,
                                    pointerEvents: !targetName.trim() ? "none" : "auto",
                                }}
                                onClick={() => setStep(2)}
                            >
                                다음
                            </button>
                            <button style={styles.subtleCancelButton} onClick={onClose}>
                                취소
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h3 style={styles.title}>.txt 파일을 업로드해주세요</h3>

                        <div
                            style={{
                                ...styles.dropZone,
                                border: dragOver ? "2px dashed #4A90E2" : "2px dashed #ccc",
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <p style={{ color: "#666" }}>
                                이곳에 .txt 파일을 드래그하거나 아래 버튼으로 업로드하세요
                            </p>
                            <input
                                type="file"
                                accept=".txt"
                                style={{ display: "none" }}
                                id="toneFileUpload"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="toneFileUpload" style={styles.uploadButton}>
                                파일 선택
                            </label>
                        </div>

                        <p style={styles.targetHint}>추출 대상: <strong>{targetName}</strong></p>

                        <div style={styles.actions}>
                            <button onClick={() => setStep(1)} style={styles.backButton}>
                                ← 이전
                            </button>
                            <button onClick={onClose} style={styles.cancelButton}>
                                취소
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
    },
    modal: {
        width: "440px",
        minHeight: "300px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    title: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
        width: "100%",
    },
    primaryButton: {
        backgroundColor: "#4A90E2",
        color: "white",
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
    },
    cancelButton: {
        backgroundColor: "#ddd",
        color: "#333",
        padding: "10px",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
    },
    backButton: {
        backgroundColor: "#e0e0e0",
        color: "#333",
        padding: "10px 15px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
    },
    dropZone: {
        border: "2px dashed #ccc",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
    },
    uploadButton: {
        marginTop: "12px",
        display: "inline-block",
        padding: "10px 20px",
        backgroundColor: "#4A90E2",
        color: "white",
        borderRadius: "6px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "14px",
    },
    targetHint: {
        fontSize: "14px",
        textAlign: "center",
        color: "#666",
    },
    actions: {
        display: "flex",
        justifyContent: "space-between",
    },
    stepTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#222",
        marginBottom: "10px",
        textAlign: "center",
    },

    stepDescription: {
        fontSize: "14px",
        color: "#666",
        textAlign: "center",
        marginBottom: "20px",
    },

    stylishInput: {
        padding: "12px 16px",
        fontSize: "15px",
        borderRadius: "10px",
        border: "1.5px solid #ddd",
        width: "100%",
        boxSizing: "border-box",
        outlineColor: "#4A90E2",
        marginBottom: "24px",
        backgroundColor: "#fcfcfc",
    },

    buttonRow: {
        display: "flex",
        justifyContent: "center",
        gap: "14px",
    },

    primaryButton: {
        backgroundColor: "#4A90E2",
        color: "white",
        padding: "12px 26px",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s",
    },

    subtleCancelButton: {
        backgroundColor: "#f0f0f0",
        color: "#555",
        padding: "12px 26px",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },

};

export default UploadToneModal;
