// services/TonesService.js
import axios from "axios";
import { REST_API_BASE_URL } from "../config/apiConfig";

const TONES_API_BASE_URL = `${REST_API_BASE_URL}/tones`;

export const getTonesByMemberId = async (memberId) => {
  try {
    const response = await axios.get(
      `${TONES_API_BASE_URL}/member/${memberId}`
    );

    const tones = response.data.result || response.data || [];

    return tones;
  } catch (error) {
    console.error("톤 목록 조회 오류:", error?.response?.data || error.message);
    throw new Error("톤 목록 조회에 실패했습니다.");
  }
};

export const createTone = async (memberId, toneData) => {
  try {
    const response = await axios.post(
      `${TONES_API_BASE_URL}/member/${memberId}`,
      toneData
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("톤 생성 오류:", error?.response?.data || error.message);
    throw new Error("톤 생성에 실패했습니다.");
  }
};

export const updateTone = async (toneId, toneData) => {
  try {
    const response = await axios.put(
      `${TONES_API_BASE_URL}/${toneId}`,
      toneData
    );

    return response.data.result || response.data;
  } catch (error) {
    console.error("톤 수정 오류:", error?.response?.data || error.message);
    throw new Error("톤 수정에 실패했습니다.");
  }
};

export const deleteTone = async (toneId) => {
  try {
    const response = await axios.delete(`${TONES_API_BASE_URL}/${toneId}`);

    return response.data.result || response.data;
  } catch (error) {
    console.error("톤 삭제 오류:", error?.response?.data || error.message);
    throw new Error("톤 삭제에 실패했습니다.");
  }
};

export const getToneById = async (toneId) => {
  try {
    const response = await axios.get(`${TONES_API_BASE_URL}/${toneId}`);

    return response.data.result || response.data;
  } catch (error) {
    console.error("톤 조회 오류:", error?.response?.data || error.message);
    throw new Error("톤 조회에 실패했습니다.");
  }
};

export const getToneByFriendId = async (friendId) => {
  try {
    const response = await axios.get(
      `${TONES_API_BASE_URL}/friend/${friendId}/all`
    );

    return response.data.tones || response.data;
  } catch (error) {
    console.error(
      "친구 어조 조회 오류:",
      error?.response?.data || error.message
    );
    throw new Error("친구 어조 조회에 실패했습니다.");
  }
};

export const analyzeTone = async (messageContent) => {
  try {
    const response = await axios.post(`${TONES_API_BASE_URL}/analyze`, {
      messageContent,
    });

    return response.data.result || response.data;
  } catch (error) {
    console.error("톤 분석 오류:", error?.response?.data || error.message);
    throw new Error("톤 분석에 실패했습니다.");
  }
};
