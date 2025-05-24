// utils/platformDetector.js
// 모바일 기기 패턴을 함수 외부에서 정의
const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];
  
  export const detectPlatform = () => {
    // User Agent를 통한 모바일 기기 감지
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    // 화면 크기도 함께 고려
    const isMobileScreen = window.innerWidth <= 768;
    const isMobileUserAgent = mobilePatterns.some(pattern => pattern.test(userAgent));
    
    return {
      isMobile: isMobileUserAgent || isMobileScreen,
      isTablet: /iPad/i.test(userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1024),
      isDesktop: !isMobileUserAgent && window.innerWidth > 1024,
      screenWidth: window.innerWidth,
      userAgent: userAgent
    };
  };
  
  // 터치 지원 여부 확인
  export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  
  // 브라우저 정보 가져오기
  export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";
    
    return browser;
  };