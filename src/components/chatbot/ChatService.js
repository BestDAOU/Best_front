import axios from "axios";

const BASE_URL = "http://localhost:8080"; // 🔁 필요한 경우 Spring 서버 주소로 변경하세요

// GPT-4o를 통해 챗봇 질문에 대한 응답을 받아오는 함수
export const askToGPT = async (message) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/chat/ask`, { message });
        return response.data; // 응답 텍스트 반환
    } catch (error) {
        console.error("챗봇 요청 실패:", error);
        throw error;
    }
};
