import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header"; // Header 컴포넌트 불러오기
import MainPage from "./pages/MainPage";
import MessageGeneration from "./pages/MessageGeneration";
import ImageGeneration from "./pages/ImageGeneration";
import ContactForm from "./pages/ContactForm";
import ChatbotPage from "./pages/ChatbotPage";
import SignUpPage from "./pages/SignUpPage";
import { UserProvider } from "./store/UserContext"
import LoginPage from "./pages/LoginPage";
function App() {
  // 더미 데이터로 로그인 상태와 사용자 이름 설정
  const isLoggedIn = true;
  const userName = "안예찬";

  return (
    <UserProvider>
      <Router>
        <Header
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogout={() => alert("로그아웃 기능은 현재 비활성화 상태입니다.")}
        />
        {/* 고정된 헤더 아래 내용 */}
        <div style={{ marginTop: "60px" }}>
          {" "}
          {/* 고정된 헤더 공간 확보를 위한 여백 추가 */}
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/message-generation" element={<MessageGeneration />} />
            <Route path="/image-generation" element={<ImageGeneration />} />
            <Route path="/contact-form" element={<ContactForm />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
