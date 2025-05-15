import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createMember } from "../services/MemberService";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    setEmailError("");
    try {
      const response = await createMember(data);
      alert("회원가입 성공!");
      console.log("가입된 사용자:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패", error);
      if (error.response && error.response.status === 400) {
        setEmailError("이미 사용 중인 이메일입니다.");
      } else {
        alert("회원가입 실패 😢");
      }
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.title}>회원가입</div>
        <form style={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="name" style={styles.label}>
            이름
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: true })}
            placeholder="홍길동"
            style={styles.input}
          />
          {errors.name && <span style={styles.error}>이름은 필수입니다.</span>}

          <label htmlFor="email" style={styles.label}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: true })}
            placeholder="example@email.com"
            style={styles.input}
          />
          {errors.email && (
            <span style={styles.error}>이메일은 필수입니다.</span>
          )}
          {emailError && <span style={styles.error}>{emailError}</span>}

          <label htmlFor="password" style={styles.label}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            placeholder="비밀번호 (6자 이상)"
            style={styles.input}
          />
          {errors.password && (
            <span style={styles.error}>비밀번호는 6자 이상이어야 합니다.</span>
          )}

          <label htmlFor="phone" style={styles.label}>
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone", { required: true })}
            placeholder="010-1234-5678"
            style={styles.input}
          />
          {errors.phone && (
            <span style={styles.error}>전화번호는 필수입니다.</span>
          )}

          <button type="submit" style={styles.button}>
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "50px",
    height: "100vh",
    backgroundColor: "#ffffff",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#fff",
    padding: "30px 10px",
  },
  title: {
    marginBottom: "40px",
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    color: "black",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    marginBottom: "12px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#0b5ed7",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "12px",
    transition: "background-color 0.2s ease",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginBottom: "10px",
  },
};

export default SignUpPage;
