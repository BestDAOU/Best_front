import axios from "axios";
import { MESSAGES_API_BASE_URL } from "../config/apiConfig";

export const sendMessage = (message) =>
  axios.post(MESSAGES_API_BASE_URL, message);

export const getMessageById = (messageId) =>
  axios.get(`${MESSAGES_API_BASE_URL}/${messageId}`);

export const getMessagesByMemberId = (memberId) =>
  axios.get(`${MESSAGES_API_BASE_URL}/member/${memberId}`);

export const getMessagesByFriendId = (friendId) =>
  axios.get(`${MESSAGES_API_BASE_URL}/friend/${friendId}`);

export const getMessagesByMemberIdAndFriendId = (memberId, friendId) =>
  axios.get(`${MESSAGES_API_BASE_URL}/member/${memberId}/friend/${friendId}`);

export const deleteMessage = (messageId) =>
  axios.delete(`${MESSAGES_API_BASE_URL}/${messageId}`);
