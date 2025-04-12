import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUser } from "../store/UserContext";
import { loginMember } from "../services/MemberService"; // ✅ loginMember 함수 import

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const { setUser } = useUser();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await loginMember(data); // ✅ loginMember 함수 사용
      const userInfo = response.data;

      setUser(userInfo); // 전역 상태에 저장
      localStorage.setItem("memberId", userInfo.id); // 또는 userInfo.memberId
      alert("로그인 성공!");
      navigate("/"); // 메인으로 이동
    } catch (err) {
      console.error("로그인 실패", err);
      alert("이메일 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="signup-wrapper">
      <style>{`
        .signup-wrapper {
          min-height: 100vh;
          background-color: #f9f9f9;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .signup-container {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .signup-form {
          display: flex;
          flex-direction: column;
        }

        .signup-form label {
          margin-bottom: 6px;
          font-weight: bold;
        }

        .signup-form input {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .signup-form button {
          background-color: #4A90E2;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .signup-form button:hover {
          background-color: #115293;
        }
      `}</style>

      <div className="signup-container">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          <label>이메일</label>
          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="이메일 입력"
          />

          <label>비밀번호</label>
          <input
            type="password"
            {...register("password", { required: true })}
            placeholder="비밀번호 입력"
          />

          <button type="submit">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
