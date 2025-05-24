import axios from "axios";
import { FRIENDS_API_BASE_URL } from "../config/apiConfig";

export const addFriend = (memberId, friend) =>
  axios.post(`${FRIENDS_API_BASE_URL}/member/${memberId}`, friend);

export const getFriendById = (friendId) =>
  axios.get(`${FRIENDS_API_BASE_URL}/${friendId}`);

export const getFriendsByMemberId = (memberId) =>
  axios.get(`${FRIENDS_API_BASE_URL}/member/${memberId}`);

export const updateFriend = (friendId, friend) =>
  axios.patch(`${FRIENDS_API_BASE_URL}/${friendId}`, friend);

export const deleteFriend = (friendId) =>
  axios.delete(`${FRIENDS_API_BASE_URL}/${friendId}`);
