import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">우리 서비스에 오신 것을 환영합니다</h1>
          <div className="h-1 w-20 bg-indigo-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 mb-6">
            빠르고 효율적인 메시징 플랫폼으로 친구, 가족, 동료들과 연결하세요.
            언제 어디서나 쉽게 메시지를 보내고 받을 수 있습니다.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            암호화된 통신으로 안전하게 대화하고, 파일을 공유하며, 영상 통화까지 한 플랫폼에서 모두 가능합니다.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            className={`px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 ${
              isHovered 
                ? 'bg-indigo-700 text-white transform scale-105' 
                : 'bg-indigo-600 text-white'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate("/main")}
          >
            메시지 전송하러 가기
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">빠른 전송</h3>
            <p className="text-gray-600">실시간으로 메시지가 전송되어 대화의 흐름이 끊기지 않습니다.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">안전한 보안</h3>
            <p className="text-gray-600">엔드투엔드 암호화로 개인정보와 대화 내용을 안전하게 보호합니다.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">다양한 기능</h3>
            <p className="text-gray-600">메시지, 파일 공유, 음성 및 영상 통화까지 모든 소통 기능을 제공합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;