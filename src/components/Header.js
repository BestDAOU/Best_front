import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useUser } from "../store/UserContext";

const Header = () => {
  const { user } = useUser();

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <Link to="/" style={styles.logoLink}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </Link>
      </div>

      <h1 style={styles.brand}>BESTDAOU</h1>

      <div style={styles.rightSection}>
        {user?.name ? (
          <span style={styles.userName}>{user.name}님</span>
        ) : (
          <>
            <Link to="/login" style={styles.signupButton}>
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

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: "80px",
    padding: "0 20px",
    position: "fixed",
    width: "100%",
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
    marginLeft: "90px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userName: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#333",
  },
  signupButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Header;
