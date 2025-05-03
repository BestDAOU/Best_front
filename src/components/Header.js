//src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useUser } from "../store/UserContext";

const Header = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    setUser(null); // 유저 정보 제거
    alert("로그아웃 되었습니다.");
    navigate("/"); // 홈으로 이동
  };

  return (
    <header style={styles.header}>
      {/* 왼쪽: 로고 */}
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logoLink}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </Link>
      </div>

      {/* 가운데: 브랜드 이름 */}
      <h1 style={styles.brand}>BESTDAOU</h1>

      {/* 오른쪽: 사용자 정보 및 버튼 */}
      <div style={styles.rightSection}>
        {user ? (
          <>
            <span style={styles.userName}>{user.name}님</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.loginButton}>
              로그인
            </Link>
            <Link to="/signup" style={styles.signupButton}>
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

// const styles = {
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     height: "80px",
//     padding: "0 20px",
//     position: "fixed",
//     width: "100%",
//     top: 0,
//     zIndex: 1000,
//     boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
//   },
//   leftSection: {
//     display: "flex",
//     alignItems: "center",
//   },
//   logoLink: {
//     textDecoration: "none",
//   },
//   logo: {
//     width: "60px",
//     height: "60px",
//   },
//   brand: {
//     fontSize: "36px",
//     fontWeight: "bold",
//     color: "#4A90E2",
//     marginLeft: "90px",
//   },
//   rightSection: {
//     display: "flex",
//     alignItems: "center",
//     gap: "15px",
//   },
//   userName: {
//     fontSize: "20px",
//     fontWeight: "500",
//     color: "#333",
//     fontFamily: "'Poppins', 'Noto Sans KR', sans-serif",
//     letterSpacing: "0.8px",
//   },
//   logoutButton: {
//     backgroundColor: "#4A90E2",
//     color: "white",
//     border: "none",
//     borderRadius: "6px",
//     padding: "8px 14px",
//     cursor: "pointer",
//     fontWeight: "bold",
//   },
//   loginButton: {
//     backgroundColor: "#4A90E2",
//     color: "white",
//     padding: "10px 20px",
//     borderRadius: "8px",
//     textDecoration: "none",
//     fontWeight: "bold",
//   },
//   signupButton: {
//     backgroundColor: "#4A90E2",
//     color: "white",
//     padding: "10px 20px",
//     borderRadius: "8px",
//     textDecoration: "none",
//     fontWeight: "bold",
//   },
// };
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: "65px",
    padding: "0 30px", // Increased padding from 20px to 30px
    position: "fixed",
    width: "calc(100% - 60px)", // Adjusted width to account for padding
    top: 0,
    zIndex: 1000,
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
  },
  logoLink: {
    textDecoration: "none",
  },
  logo: {
    width: "60px",
    height: "60px",
  },
  brand: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#4A90E2",
    margin: "0", // Removed left margin
    flexGrow: 1,  // Allow brand to take up available space
    textAlign: "center", // Center text
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    minWidth: "180px", // Ensure enough space for buttons
  },
  userName: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#333",
    fontFamily: "'Poppins', 'Noto Sans KR', sans-serif",
    letterSpacing: "0.8px",
  },
  logoutButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent text wrapping
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent text wrapping
  },
  signupButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent text wrapping
  },
};

export default Header;
