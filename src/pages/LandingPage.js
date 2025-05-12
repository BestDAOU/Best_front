// // src/pages/LandingPage.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './LandingPage.css';
// import appScreenshot from '../assets/images/app-screenshot.png';
// import bestRanding from '../assets/videos/best_randing.mp4';

// // 데이터 파일
// import {
//   hero,
//   features,
//   imageSection,
//   tutorial,
//   testimonials,
//   cta,
// } from '../data/landingContent';

// const LandingPage = () => {
//   const [isHovered, setIsHovered] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
//       {/* Hero Section with Video Background - 순수 비디오 */}
//       <div className="hero-section relative overflow-hidden">
//         <div className="video-background-container">
//           <video
//             className="video-background"
//             autoPlay
//             muted
//             loop
//             playsInline
//             controls={false}
//           >
//             <source src={bestRanding} type="video/mp4" />
//           </video>
//           <div className="video-overlay-modern" />
//         </div>
//         <div className="scroll-indicator">
//           <div className="scroll-arrow" />
//         </div>
//       </div>

//       {/* 히어로 콘텐츠 */}
//       <div className="hero-content-section bg-white py-24">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center">
//             <div className="logo-badge mb-8">{hero.badge}</div>
//             <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
//               {hero.title}
//             </h1>
//             <div className="h-1 w-24 bg-blue-600 mx-auto mb-8" />
//             <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
//               {hero.sub1}
//             </p>
//             <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
//               {hero.sub2}
//             </p>
//             <div className="flex flex-col sm:flex-row gap-6 justify-center">
//               <button
//                 className={`px-10 py-4 text-lg font-semibold rounded-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-lg ${
//                   isHovered ? 'transform scale-105' : ''
//                 }`}
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//                 onClick={() => navigate('/main')}
//               >
//                 메시지 전송하러 가기<span className="ml-2">→</span>
//               </button>
//               <button
//                 className="px-10 py-4 text-lg font-semibold rounded-lg transition-all duration-300 bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
//               >
//                 더 알아보기
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 주요 기능 */}
//       <div className="container mx-auto px-4 py-16">
//         <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">
//           주요 기능
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {features.map(({ icon, title, desc }) => (
//             <div key={title} className="feature-card">
//               <div className="feature-icon">{icon}</div>
//               <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>
//               <p className="text-gray-600 text-center">{desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 이미지 콘텐츠 */}
//       <div className="bg-white py-16">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
//             <div className="md:w-1/2">
//               <h2 className="text-3xl font-bold text-blue-700 mb-6">
//                 {imageSection.title}
//               </h2>
//               <p className="text-lg text-gray-700 mb-4">{imageSection.p1}</p>
//               <p className="text-lg text-gray-700 mb-6">{imageSection.p2}</p>
//               <div className="flex space-x-4">
//                 {imageSection.bullets.map((bullet) => (
//                   <div key={bullet} className="flex items-center">
//                     <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
//                       ✓
//                     </div>
//                     <span>{bullet}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="md:w-1/2 flex justify-center">
//               <img
//                 src={appScreenshot}
//                 alt="BESTDAOU 앱 스크린샷"
//                 className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[420px] h-auto"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 영상 섹션 */}
//       <div className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold text-blue-700 mb-6">
//             {tutorial.title}
//           </h2>
//           <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
//             {tutorial.desc}
//           </p>

//           {/* 영상 플레이어(데모) */}
//           <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl bg-blue-900">
//             <div className="aspect-w-16 aspect-h-9 flex items-center justify-center p-16">
//               <div className="text-center text-white">
//                 <div className="text-6xl mb-4">▶️</div>
//                 <p className="text-xl font-semibold">{tutorial.cta}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 사용자 후기 */}
//       <div className="container mx-auto px-4 py-16">
//         <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">
//           사용자 후기
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {testimonials.map(({ name, role, quote }) => (
//             <div key={name} className="bg-white p-6 rounded-xl shadow">
//               <div className="flex items-center mb-4">
//                 <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center mr-4">
//                   👤
//                 </div>
//                 <div>
//                   <p className="font-semibold">{name}</p>
//                   <p className="text-gray-500 text-sm">{role}</p>
//                 </div>
//               </div>
//               <p className="text-gray-700">{quote}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* CTA */}
//       <div className="container mx-auto px-4 py-16 text-center">
//         <h2 className="text-3xl font-bold text-blue-700 mb-6">{cta.title}</h2>
//         <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
//           {cta.desc}
//         </p>
//         <div className="flex flex-col sm:flex-row justify-center gap-4">
//           <button
//             className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
//             onClick={() => navigate('/login')}
//           >
//             로그인
//           </button>
//           <button
//             className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
//             onClick={() => navigate('/signup')}
//           >
//             회원가입
//           </button>
//         </div>
//       </div>

//       {/* Footer - 기존 코드 유지 */}
//       <footer className="bg-blue-900 text-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="mb-6 md:mb-0">
//               <h3 className="text-2xl font-bold mb-2">BESTDAOU</h3>
//               <p className="text-blue-200">안전하고 빠른 메시징 플랫폼</p>
//             </div>

//             <div className="flex space-x-8">
//               <div>
//                 <h4 className="font-semibold mb-3">회사</h4>
//                 <ul className="space-y-2">
//                   <li className="hover:text-blue-300 cursor-pointer">소개</li>
//                   <li className="hover:text-blue-300 cursor-pointer">블로그</li>
//                   <li className="hover:text-blue-300 cursor-pointer">채용</li>
//                 </ul>
//               </div>

//               <div>
//                 <h4 className="font-semibold mb-3">지원</h4>
//                 <ul className="space-y-2">
//                   <li className="hover:text-blue-300 cursor-pointer">FAQ</li>
//                   <li className="hover:text-blue-300 cursor-pointer">고객센터</li>
//                   <li className="hover:text-blue-300 cursor-pointer">
//                     개인정보처리방침
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300">
//             <p>© 2025 BESTDAOU. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;
// src/pages/LandingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import appScreenshot from '../assets/images/app-screenshot.png';
import bestRanding from '../assets/videos/best_randing.mp4';
import thumbnail from '../assets/images/thumbnail.png';


// 데이터 파일
import {
  hero,
  features,
  imageSection,
  tutorial,
  testimonials,
  cta,
} from '../data/landingContent';

const LandingPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section with Video Background - 반응형 개선 */}
      <div className="hero-section relative overflow-hidden">
        <div className="video-background-container">
          <video
            className="video-background"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          >
            <source src={bestRanding} type="video/mp4" />
          </video>
          <div className="video-overlay-modern" />
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow" />
        </div>
      </div>

      {/* 히어로 콘텐츠 */}
      <div className="hero-content-section bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="logo-badge mb-6 md:mb-8">{hero.badge}</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
              {hero.title}
            </h1>
            <div className="h-1 w-16 md:w-24 bg-blue-600 mx-auto mb-6 md:mb-8" />
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
              {hero.sub1}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 md:mb-12 max-w-2xl mx-auto px-2">
              {hero.sub2}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4">
              <button
                className={`px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-lg ${
                  isHovered ? 'transform scale-105' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => navigate('/main')}
              >
                메시지 전송하러 가기<span className="ml-2">→</span>
              </button>
              <button
                className="px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg transition-all duration-300 bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
              >
                더 알아보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-8 md:mb-12">
          주요 기능
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 className="text-lg md:text-xl font-semibold text-center mb-3 md:mb-4">{title}</h3>
              <p className="text-sm md:text-base text-gray-600 text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 이미지 콘텐츠 */}
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 md:mb-6">
                {imageSection.title}
              </h2>
              <p className="text-base md:text-lg text-gray-700 mb-3 md:mb-4">{imageSection.p1}</p>
              <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6">{imageSection.p2}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                {imageSection.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-center">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                      ✓
                    </div>
                    <span className="text-sm md:text-base">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-1/2 flex justify-center">
              <img
                src={appScreenshot}
                alt="BESTDAO 앱 스크린샷"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[420px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 영상 섹션 */}
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 md:mb-6">
            {tutorial.title}
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto">
            {tutorial.desc}
          </p>

          {/* 영상 플레이어(데모) */}
          {/* <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl bg-blue-900">
            <div className="aspect-w-16 aspect-h-9 flex items-center justify-center p-8 md:p-16">
              <div className="text-center text-white">
                <div className="text-4xl md:text-6xl mb-4">▶️</div>
                <p className="text-lg md:text-xl font-semibold">{tutorial.cta}</p>
              </div>
            </div>
          </div> */}
   {/* 썸네일 + 재생 아이콘 */}
  <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl relative cursor-pointer">
     {/* 16:9 비율 박스 */}
    <div className="aspect-w-16 aspect-h-9 w-full h-full">
      <img
        src={thumbnail}
        alt="튜토리얼 썸네일"
       className="absolute inset-0 w-full h-full object-cover"
      />
     {/* 재생 아이콘 오버레이 */}
      {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/30 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/40">
        <div className="text-4xl md:text-6xl mb-2">▶️</div>
      <p className="text-lg md:text-xl font-semibold drop-shadow">{tutorial.cta}</p>
     </div> */}
    </div>
   </div>




        </div>
      </div>

      {/* 사용자 후기 */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-8 md:mb-12">
          사용자 후기
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map(({ name, role, quote }) => (
            <div key={name} className="bg-white p-4 md:p-6 rounded-xl shadow">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-200 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  👤
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{name}</p>
                  <p className="text-gray-500 text-xs md:text-sm">{role}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm md:text-base">{quote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-12 md:py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 md:mb-6">{cta.title}</h2>
        <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto">
          {cta.desc}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
          <button
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
          <button
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>

      {/* Footer - 반응형 개선 */}
      <footer className="bg-blue-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-6 lg:mb-0 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-2">BESTDAO</h3>
              <p className="text-blue-200 text-sm md:text-base">안전하고 빠른 메시징 플랫폼</p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base">회사</h4>
                <ul className="space-y-2">
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">소개</li>
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">블로그</li>
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">채용</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base">지원</h4>
                <ul className="space-y-2">
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">FAQ</li>
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">고객센터</li>
                  <li className="hover:text-blue-300 cursor-pointer text-xs md:text-sm">
                    개인정보처리방침
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-blue-300">
            <p className="text-xs md:text-sm">© 2025 BESTDAO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;