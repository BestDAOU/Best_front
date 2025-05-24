import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUser } from "../store/UserContext";
import { loginMember } from "../services/MemberService";
import { detectPlatform } from '../utils/platformDetector';

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const { setUser } = useUser();
  const navigate = useNavigate();

  // const onSubmit = async (data) => {
  //   try {
  //     const response = await loginMember(data);
  //     const userInfo = response.data;

  //     setUser(userInfo);
  //     localStorage.setItem("memberId", userInfo.id);
  //     localStorage.setItem("memberName", userInfo.name);
  //     alert("로그인 성공!");
  //     navigate("/main", { replace: true });
  //   } catch (err) {
  //     alert("이메일 또는 비밀번호를 확인하세요.");
  //   }
  // };
  const onSubmit = async (data) => {
    try {
      const response = await loginMember(data);
      const userInfo = response.data;
      
      setUser(userInfo);
      localStorage.setItem("memberId", userInfo.id);
      localStorage.setItem("memberName", userInfo.name);
      alert("로그인 성공!");
      
      // 플랫폼 감지 후 적절한 페이지로 이동
      const platform = detectPlatform();
      
      if (platform.isMobile) {
        navigate("/main-mobile", { replace: true });
      } else {
        navigate("/main", { replace: true });
      }
    } catch (err) {
      alert("이메일 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>로그인</h2>
        <form style={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="email" style={styles.label}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="이메일 입력"
            {...register("email", { required: true })}
            style={styles.input}
          />

          <label htmlFor="password" style={styles.label}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호 입력"
            {...register("password", { required: true })}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            로그인
          </button>
        </form>

        <div style={styles.linkRow}>
          <span style={styles.signupText}>
            아직 회원이 아니신가요?
            <span style={styles.link} onClick={() => navigate("/signup")}>
              회원가입
            </span>
          </span>

          <span
            style={styles.secondaryLink}
            onClick={() => navigate("/find-account")}
          >
            아이디/비밀번호 찾기
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "100px",
    height: "100vh",
    backgroundColor: "#ffffff",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    backgroundColor: "#fff",
    padding: "20px 0px",
  },
  title: {
    marginBottom: "25px",
    textAlign: "center",
    fontSize: "30px",
    fontWeight: "bold",
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
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#0b5ed7", // 기존보다 더 짙은 파란색
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "12px", // 👈 비밀번호 input과 간격 벌림
    marginBottom: "5px",
  },
  linkRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
    padding: "0 5px",
    fontSize: "12px",
  },

  signupText: {
    color: "#555",
    fontWeight: "normal",
  },

  link: {
    color: "#1A73E8",
    fontWeight: "500",
    textDecoration: "none",
    marginLeft: "5px",
    cursor: "pointer",
  },

  secondaryLink: {
    color: "#888", // 회색 계열
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: "normal",
  },
};
export default LoginPage;
