// components/PlatformRouter.js
import React, { useEffect, useState } from 'react';
import { detectPlatform } from '../utils/platformDetector';

const PlatformRouter = ({ DesktopComponent, MobileComponent, ...props }) => {
  const [platform, setPlatform] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const platformInfo = detectPlatform();
    setPlatform(platformInfo);
    setIsLoading(false);

    // 화면 크기 변경 감지 (리사이징 대응)
    const handleResize = () => {
      const newPlatformInfo = detectPlatform();
      setPlatform(newPlatformInfo);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 모바일이면 MobileComponent, 데스크톱이면 DesktopComponent 렌더링
  return platform?.isMobile ? 
    <MobileComponent {...props} platform={platform} /> : 
    <DesktopComponent {...props} platform={platform} />;
};

export default PlatformRouter;