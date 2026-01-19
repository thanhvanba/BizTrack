import { useEffect, useState } from "react";

// src/hooks/useResponsive.ts
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPwa, setIsPwa] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkPwa = () => {
      // Check screen size trước (ưu tiên responsive design)
      const isSmallScreen = window.innerWidth <= 768;
      
      // PWA standalone mode (nếu đã install như native app)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isInstalled = navigator.standalone === true;
      
      // Nếu small screen hoặc PWA mode → dùng PwaLayout
      setIsPwa(isSmallScreen || isStandalone || isInstalled);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      checkPwa(); // Gọi lại khi resize
    };

    checkPwa();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isPwa };
};
