import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
// import appScreenshot from '../assets/images/app-screenshot.png';

const LandingPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
              우리 서비스에 오신 것을 환영합니다
            </h1>
            <div className="h-1 w-20 bg-blue-500 mb-8 mx-auto lg:mx-0"></div>
            <p className="text-xl text-gray-700 mb-6">
              블로그 효율적인 메시지 플랫폼으로 친구, 가족, 동료들과 연결하세요.
              언제 어디서나 쉽게 메시지를 보내고 받을 수 있습니다.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              안호화된 통신으로 안전하게 대화하고, 파일을 공유하며, 영상 통화까지 한 플랫폼에서 모두 가능합니다.
            </p>
            <button
              className={`px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center mx-auto lg:mx-0 ${isHovered
                ? 'bg-blue-700 text-white transform scale-105'
                : 'bg-blue-600 text-white'
                }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => navigate("/main")}
            >
              메시지 전송하러 가기
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* Hero Image - 앱 시뮬레이션 */}
          <div className="lg:w-1/2">
            <div className="relative">
              {/* 앱 인터페이스 목업 */}
              <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md mx-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4 p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-700">BESTDAOU</div>
                  <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                    👤
                  </div>
                </div>

                {/* 채팅 버블 */}
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-xs">
                      안녕하세요! 오늘 어떻게 지내세요?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-100 p-3 rounded-lg rounded-tr-none max-w-xs">
                      잘 지내고 있어요! 새로운 메시징 앱이 정말 좋네요.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-xs">
                      그렇죠? 인터페이스가 깔끔하고 속도도 빠르고 👍
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-100 p-3 rounded-lg rounded-tr-none max-w-xs">
                      보안 기능도 마음에 들어요! 🔒
                    </div>
                  </div>
                </div>

                {/* 입력 영역 */}
                <div className="mt-4 flex items-center border rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 outline-none text-gray-700"
                    disabled
                  />
                  <button className="text-blue-600 px-2">
                    <span className="text-xl">💬</span>
                  </button>
                </div>
              </div>

              {/* 장식 요소 */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-blue-200 rounded-full opacity-50 -z-10"></div>
              <div className="absolute -top-6 -left-6 h-24 w-24 bg-blue-200 rounded-full opacity-50 -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">주요 기능</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <span className="text-3xl">💬</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">빠른 전송</h3>
            <p className="text-gray-600 text-center">
              실시간으로 메시지가 전송되어 대화의 흐름이 끊기지 않습니다. 순간적인 연결로 언제 어디서나 소통하세요.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <span className="text-3xl">🔒</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">안전한 보안</h3>
            <p className="text-gray-600 text-center">
              엔드투엔드 암호화로 개인정보와 대화 내용을 안전하게 보호합니다. 걱정 없이 자유롭게 대화하세요.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <span className="text-3xl">🌐</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">다양한 기능</h3>
            <p className="text-gray-600 text-center">
              메시지, 파일 공유, 음성 및 영상 통화까지 모든 소통 기능을 제공합니다. 하나의 앱으로 모든 것이 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 이미지 콘텐츠 섹션 */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-blue-700 mb-6">메시지를 넘어서는 소통</h2>
              <p className="text-lg text-gray-700 mb-4">
                실시간으로 메시지가 전송되어 대화의 흐름이 끊기지 않습니다. 순간적인 연결로 언제 어디서나 소통하세요.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                단체 대화방, 일대일 채팅, 멀티미디어 공유까지 모든 기능을 직관적인 인터페이스로 제공합니다.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">✓</div>
                  <span>매우 빠른 속도</span>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">✓</div>
                  <span>무제한 파일 공유</span>
                </div>
              </div>

            </div>

            {/* 이미지 섹션 수정 - 그라데이션과 이미지 크기 조정 */}
            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-xl">
                {/* <img
                  src={appScreenshot}
                  alt="BESTDAOU 앱 스크린샷"
                  className="w-full h-auto"
                /> */}
              </div>
            </div>



          </div>
        </div>
      </div>

      {/* 영상 섹션 */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">앱 사용 방법 알아보기</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            간단한 튜토리얼 영상을 통해 BESTDAOU 앱의 모든 기능을 빠르게 배워보세요.
          </p>

          {/* 영상 플레이어 (실제 구현 시 video 태그 사용) */}
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl bg-blue-900">
            <div className="aspect-w-16 aspect-h-9 flex items-center justify-center p-16">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">▶️</div>
                <p className="text-xl font-semibold">튜토리얼 영상</p>
                <p className="text-sm opacity-75 mt-2">src/assets에 영상 파일을 추가하세요</p>
                <button className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-50 transition">
                  영상 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 후기 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">사용자 후기</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-4">
                👤
              </div>
              <div>
                <p className="font-semibold">김민준</p>
                <p className="text-gray-500 text-sm">디자이너</p>
              </div>
            </div>
            <p className="text-gray-700">
              "이 메시징 앱은 정말 직관적이고 사용하기 쉬워요. 팀 프로젝트에서 의사소통이 훨씬 원활해졌습니다."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-4">
                👤
              </div>
              <div>
                <p className="font-semibold">이서연</p>
                <p className="text-gray-500 text-sm">학생</p>
              </div>
            </div>
            <p className="text-gray-700">
              "해외에 있는 친구들과 연락하기 완벽해요. 영상 통화 품질이 정말 좋고 시차가 있어도 메시지 알림이 잘 와요."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-4">
                👤
              </div>
              <div>
                <p className="font-semibold">박지훈</p>
                <p className="text-gray-500 text-sm">개발자</p>
              </div>
            </div>
            <p className="text-gray-700">
              "보안 기능이 뛰어나고 대용량 파일도 쉽게 공유할 수 있어 업무에 많은 도움이 됩니다. 강력 추천합니다!"
            </p>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">지금 시작하세요</h2>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          친구, 가족, 동료들과 더 나은 방식으로 소통할 준비가 되셨나요? 지금 바로 시작하세요.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/login")}
          >
            로그인
          </button>
          <button
            className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">BESTDAOU</h3>
              <p className="text-blue-200">안전하고 빠른 메시징 플랫폼</p>
            </div>

            <div className="flex space-x-8">
              <div>
                <h4 className="font-semibold mb-3">회사</h4>
                <ul className="space-y-2">
                  <li className="hover:text-blue-300 cursor-pointer">소개</li>
                  <li className="hover:text-blue-300 cursor-pointer">블로그</li>
                  <li className="hover:text-blue-300 cursor-pointer">채용</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">지원</h4>
                <ul className="space-y-2">
                  <li className="hover:text-blue-300 cursor-pointer">FAQ</li>
                  <li className="hover:text-blue-300 cursor-pointer">고객센터</li>
                  <li className="hover:text-blue-300 cursor-pointer">개인정보처리방침</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300">
            <p>© 2025 BESTDAOU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;