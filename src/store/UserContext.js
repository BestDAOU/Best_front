import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 새로고침 직후 로딩 플래그

  useEffect(() => {
    const savedId = localStorage.getItem("memberId");
    const savedName = localStorage.getItem("memberName"); // ✅ 이름도 복원
    if (savedId && savedName) {
      setUser({ id: savedId, name: savedName }); // ✅ user 객체 재구성
    }

    setLoading(false); // 복원 로직 끝난 후 loading false
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
