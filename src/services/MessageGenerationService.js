import axios from "axios";

// 백엔드 API 기본 URL (환경 변수에서 가져오거나 하드코딩)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

/**
 * 메시지 생성 관련 API 서비스
 */
class MessageGenerationService {
  /**
   * 입력 텍스트와 선택된 키워드를 기반으로 메시지를 생성
   *
   * @param {string} inputText - 사용자가 입력한 텍스트
   * @param {string[]} selectedKeywords - 선택된 키워드 배열
   * @returns {Promise<string>} - 생성된 메시지
   */
  static async generateMessage(inputText, selectedKeywords) {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/generate`, {
        inputText,
        keywords: selectedKeywords,
      });

      return response.data.result.generatedMessage;
    } catch (error) {
      console.error(
        "메시지 생성 API 오류:",
        error.response ? error.response.data : error.message
      );
      throw new Error("메시지 생성에 실패했습니다. 다시 시도해주세요.");
    }
  }
}

export default MessageGenerationService;
