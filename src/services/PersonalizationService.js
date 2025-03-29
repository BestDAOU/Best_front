import axios from "axios";

// 백엔드 API 기본 URL (환경 변수에서 가져오거나 하드코딩)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

/**
 * 백엔드 서버와 통신하는 서비스
 */
class PersonalizationService {
  /**
   * 텍스트를 지정된 톤으로 변환
   * @param {Object} params - 변환에 필요한 파라미터
   * @param {string} params.text - 변환할 원본 텍스트
   * @param {string} params.instruction - 톤 지시사항
   * @param {string} params.name - 수신자 이름
   * @param {string} params.tag - 수신자 관련 태그
   * @param {string} params.memo - 수신자 관련 메모
   * @param {Array} params.examples - 선택된 톤의 예시들
   * @returns {Promise<string>} - 변환된 텍스트
   */
  static async convertText({
    text,
    name,
    tag,
    memo,
    instruction,
    examplesText,
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/text/convert`, {
        text,
        instruction,
        name,
        tag,
        memo,
        examplesText,
      });

      // 백엔드에서 반환한 변환된 텍스트
      return response.data.convertedText;
    } catch (error) {
      console.error(
        "텍스트 변환 API 오류:",
        error.response ? error.response.data : error.message
      );
      throw new Error("텍스트 변환에 실패했습니다. 다시 시도해주세요.");
    }
  }

  /**
   * 대화를 분석하여 톤 추출 (향후 구현용 플레이스홀더)
   * @param {Object} params - 톤 추출에 필요한 파라미터
   * @param {string} params.content - 대화 내용
   * @param {string} params.name - 수신자 이름
   * @param {string} params.tag - 태그
   * @param {string} params.memo - 메모
   * @returns {Promise<Object>} - 추출된 톤 정보
   */
  static async extractTone({ content, name, tag, memo }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tone/extract`, {
        content,
        name,
        tag,
        memo,
      });

      return response.data;
    } catch (error) {
      console.error(
        "톤 추출 API 오류:",
        error.response ? error.response.data : error.message
      );
      throw new Error("톤 추출에 실패했습니다. 다시 시도해주세요.");
    }
  }
}

export default PersonalizationService;
