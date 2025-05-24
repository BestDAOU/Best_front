// src/services/KeywordService.js
import axios from "axios";
import { REST_API_BASE_URL } from "../config/apiConfig";
// 서버 API 기본 URL 설정
/**
 * 메시지에서 키워드를 추출하는 서버 API 호출
 * @param {string} message - 키워드를 추출할 메시지
 * @returns {Promise<Array<string>>} - 추출된 키워드 배열
 */
export const extractKeywordsFromServer = async (message) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/keywords/extract`, {
      messageContent: message,
    });

    // ✅ 서버 응답 구조에 맞춰 수정
    const keywords = response.data.result?.keywords || [];

    return keywords;
  } catch (error) {
    console.error(
      "키워드 추출 서비스 오류:",
      error?.response?.data || error.message
    );
    throw new Error("키워드 추출에 실패했습니다.");
  }
};

/**
 * 이미지 생성을 위한 키워드로 이미지 생성 요청
 * @param {string} keyword - 이미지 생성에 사용할 키워드
 * @returns {Promise<string>} - 생성된 이미지의 URL 또는 Base64 문자열
 */
export const generateImageFromServer = async (keyword) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/images/generate`, {
      keyword,
    });

    // 서버에서 생성된 이미지 URL 또는 Base64 문자열 반환
    return response.data.imageUrl;
  } catch (error) {
    console.error("이미지 생성 서비스 오류:", error);
    throw new Error("이미지 생성에 실패했습니다.");
  }
};

export default {
  extractKeywordsFromServer,
  generateImageFromServer,
};
