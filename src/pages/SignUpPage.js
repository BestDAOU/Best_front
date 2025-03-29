import React from "react";
import { useForm } from "react-hook-form";
import { createMember } from "../services/MemberService";

function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await createMember(data);
      alert("회원가입 성공!");
      console.log("가입된 사용자:", response.data);
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입 실패 😢");
    }
  };

  return (
    <div className="signup-wrapper">
      <style>{`
        /* 전체 배경 색 적용 */
        .signup-wrapper {
          min-height: 100vh;
          background-color: #f9f9f9;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .signup-container {
          width: 100%;
          max-width: 500px;
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
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .signup-form span {
          color: red;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .signup-form button {
          background-color: #4A90E2;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .signup-form button:hover {
          background-color: #115293;
        }
      `}</style>

      <div className="signup-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          <label>이름</label>
          <input
            type="text"
            {...register("name", { required: true })}
            placeholder="홍길동"
          />
          {errors.name && <span>이름은 필수입니다.</span>}

          <label>이메일</label>
          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="example@email.com"
          />
          {errors.email && <span>이메일은 필수입니다.</span>}

          <label>비밀번호</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            placeholder="비밀번호 (6자 이상)"
          />
          {errors.password && <span>비밀번호는 6자 이상이어야 합니다.</span>}

          <label>전화번호</label>
          <input
            type="tel"
            {...register("phone", { required: true })}
            placeholder="010-1234-5678"
          />
          {errors.phone && <span>전화번호는 필수입니다.</span>}

          <button type="submit">가입하기</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
