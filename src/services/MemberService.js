import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/members";

// 1. 회원 생성
export const createMember = (member) => axios.post(REST_API_BASE_URL, member);

// 2. 회원 단건 조회
export const getMemberById = (id) => axios.get(`${REST_API_BASE_URL}/${id}`);

// 3. 회원 수정
export const updateMember = (id, updatedMember) =>
  axios.patch(`${REST_API_BASE_URL}/${id}`, updatedMember);

// 4. 회원 삭제
export const deleteMember = (id) =>
  axios.delete(`${REST_API_BASE_URL}/${id}`);

// 5. 전체 회원 조회
export const getAllMembers = () => axios.get(REST_API_BASE_URL);

// ✅ 6. 로그인
export const loginMember = (loginData) =>
    axios.post(`${REST_API_BASE_URL}/login`, loginData);