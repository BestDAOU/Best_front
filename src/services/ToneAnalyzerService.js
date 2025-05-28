// services/ToneAnalyzerService.js
import axios from "axios";
import { ToneAnalyzer_API_BASE_URL } from "../config/apiConfig";

/**
 * 말투 분석 요청
 * @param {File} file - 업로드된 .txt 파일
 * @param {string} userName - 말투를 분석할 사용자 이름
 * @returns {Promise<Object>} - toneRule 객체 (label, instruction, examples 등)
 */
export const analyzeTone = async (file, targetName, friendId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userName", targetName); // 백엔드에 맞춰 userName으로 보냄
  formData.append("friendId", friendId); // friendId 추가

  const response = await axios.post(ToneAnalyzer_API_BASE_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.savedTones;
};
