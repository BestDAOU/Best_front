import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useUser } from "../store/UserContext";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";

const HeaderMobile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/");
    setIsMenuOpen(false); // 메뉴 닫기
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header style={styles.header}>
        {/* 왼쪽: 로고 */}
        <div style={styles.leftSection}>
          <Link to="/main-mobile" style={styles.logoLink} onClick={closeMenu}>
            <img src={logo} alt="Logo" style={styles.logo} />
          </Link>
        </div>

        {/* 가운데: 브랜드 이름 */}
        <h1 style={styles.brand}>BESTDAO</h1>

        {/* 오른쪽: 햄버거 메뉴 또는 사용자 정보 */}
        <div style={styles.rightSection}>
          {user ? (
            <button onClick={toggleMenu} style={styles.menuButton}>
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginButton} onClick={closeMenu}>
                로그인
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 드롭다운 메뉴 */}
      {user && isMenuOpen && (
        <>
          {/* 오버레이 */}
          <div style={styles.overlay} onClick={closeMenu}></div>
          
          {/* 메뉴 */}
          <div style={styles.dropdownMenu}>
            <div style={styles.userInfo}>
              <FaUser size={16} style={styles.userIcon} />
              <span style={styles.userName}>{user.name}님</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <FaSignOutAlt size={16} style={styles.logoutIcon} />
              로그아웃
            </button>
          </div>
        </>
      )}
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: "60px", // 모바일에서는 조금 더 컴팩트하게
    padding: "0 16px", // 모바일에 맞는 패딩
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
  },
  logoLink: {
    textDecoration: "none",
  },
  logo: {
    width: "40px", // 모바일에서는 더 작게
    height: "40px",
  },
  brand: {
    fontSize: "20px", // 모바일에 맞는 크기
    fontWeight: "bold",
    color: "#4A90E2",
    margin: "0",
    flex: 1,
    textAlign: "center",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    minWidth: "40px", // 최소 너비 확보
  },
  menuButton: {
    background: "none",
    border: "none",
    color: "#4A90E2",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  authButtons: {
    display: "flex",
    gap: "8px",
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  overlay: {
    position: "fixed",
    top: "60px", // 헤더 높이만큼
    left: 0,
    width: "100%",
    height: "calc(100vh - 60px)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 999,
  },
  dropdownMenu: {
    position: "fixed",
    top: "60px", // 헤더 바로 아래
    right: "16px",
    width: "200px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1001,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  userIcon: {
    color: "#4A90E2",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#e53e3e",
    cursor: "pointer",
    padding: "8px 0",
    fontSize: "16px",
    fontWeight: "500",
    width: "100%",
    textAlign: "left",
  },
  logoutIcon: {
    color: "#e53e3e",
  },
};

export default HeaderMobile;