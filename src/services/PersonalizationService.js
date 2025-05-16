import axios from "axios";

// 백엔드 API 기본 URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

export const convertText = async ({ originalText, toneId, friendId }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tone-transform`, {
      originalText,
      toneId,
      friendId, // 친구 ID를 요청 본문에 추가
    });

    return response.data.result.transformedText;
  } catch (error) {
    console.error(
      "텍스트 변환 API 오류:",
      error.response ? error.response.data : error.message
    );
    throw new Error("텍스트 변환에 실패했습니다. 다시 시도해주세요.");
  }
};
