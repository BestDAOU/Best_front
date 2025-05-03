import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";
import MessageGeneration from "./pages/MessageGeneration";
import ImageGeneration from "./pages/ImageGeneration";
import ContactForm from "./pages/ContactForm";
import ChatbotPage from "./pages/ChatbotPage";
import SignUpPage from "./pages/SignUpPage";
import { UserProvider, useUser } from "./store/UserContext";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser(); // loading 추가
  const location = useLocation();
  // 로딩 중일 때는 아무 것도 보여주지 않음 (또는 스피너 표시 가능)
  if (loading) {
    return <div>로딩 중...</div>;
  }
  // user 객체가 있는지 확인 (로그인 여부 판단)
  if (!user) {
    // 로그인 페이지로 리디렉션하고, 로그인 후 원래 페이지로 돌아올 수 있도록 location 정보 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// App 콘텐츠 컴포넌트 (UserContext 사용을 위해 분리)
const AppContent = () => {
  const { user } = useUser();

  return (
    <>
      <Header
        isLoggedIn={!!user}
        userName={user?.name || ""}
        onLogout={() => alert("로그아웃 기능은 현재 비활성화 상태입니다.")}
      />
      {/* 고정된 헤더 아래 내용 */}
      <div style={{ marginTop: "60px" }}>
        <Routes>
          {/* 공개 라우트 - 로그인 없이 접근 가능 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 보호된 라우트 - 로그인 사용자만 접근 가능 */}
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-generation"
            element={
              <ProtectedRoute>
                <MessageGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-generation"
            element={
              <ProtectedRoute>
                <ImageGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-form/:memberId"
            element={
              <ProtectedRoute>
                <ContactForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />

          {/* 존재하지 않는 경로는 홈으로 리디렉션 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

// 메인 App 컴포넌트
function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;