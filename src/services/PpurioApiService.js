//src/services/PpurioApiService.js
import axios from "axios";
import { PPURIO_API_BASE_URL } from "../config/apiConfig";

// Function to send multiple SMS messages
export const sendMessages = (messages) => {
  console.log("Sending2323 data to backend:", messages); // 확인용 로그
  return axios.post(`${PPURIO_API_BASE_URL}/send`, messages);
};
