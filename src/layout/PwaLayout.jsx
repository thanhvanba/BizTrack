import { Layout, ConfigProvider, theme, Drawer, FloatButton } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SessionExpiredModal from "../components/modals/SessionExpiredModal";
import sessionExpiredService from "../utils/sessionExpiredService";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Content } = Layout;

const PwaLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile detection hook - đơn giản hơn
  const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const checkMobile = () => {
        // Check both screen size và user agent
        const isSmallScreen = window.innerWidth <= 768;
        const isTouchDevice = "ontouchstart" in window;
        setIsMobile(isSmallScreen || isTouchDevice);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
  };

  const isMobile = useMobileDetection();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const currentTab = location.pathname.split("/")[1] || "dashboard";
  const [activeTab, setActiveTab] = useState(currentTab);

  // Sync activeTab with route
  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  // Subscribe to session expired events
  useEffect(() => {
    const unsubscribe = sessionExpiredService.subscribe(
      setSessionExpiredVisible,
    );
    return unsubscribe;
  }, []);

  const handleMenuClick = (key) => {
    navigate(`/${key}`);
    setActiveTab(key);
    setMobileDrawerOpen(false);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleSessionExpiredOk = () => {
    setSessionExpiredVisible(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // PWA navigation items - ưu tiên tính năng chính
  const navItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Tổng quan" },
    { key: "orders", icon: <ShoppingCartOutlined />, label: "Đơn hàng" },
    { key: "products", icon: <AppstoreOutlined />, label: "Sản phẩm" },
    // { key: "reports", icon: <BarChartOutlined />, label: "Báo cáo" },
    // { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 12, // Larger radius cho mobile
          fontSize: 14,
        },
        components: {
          Layout: {
            headerBg: "#ffffff",
            bodyBg: "#f8fafc",
          },
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      <div className="min-h-screen bg-gray-50 safe-area">
        {/* Sticky Header cho PWA */}
        <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-200 safe-area-top">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo/Brand - nhỏ gọn */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileDrawer}
                className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
                aria-label="Menu"
              >
                <MenuOutlined className="text-lg" />
              </button>
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {navItems.find((item) => item.key === activeTab)?.label ||
                  "POS"}
              </h1>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg bg-gray-100 active:bg-gray-200"
                aria-label="Search"
              >
                <SearchOutlined />
              </button>
              <button
                className="p-2 rounded-lg bg-gray-100 active:bg-gray-200 relative"
                aria-label="Notifications"
              >
                <BellOutlined />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Quick tabs cho màn hình nhỏ */}
          {/* <div className="px-4 pb-2 overflow-x-auto hide-scrollbar">
            <div className="flex space-x-2 min-w-max">
              {navItems.slice(0, 4).map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === item.key
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-1.5 text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div> */}
        </header>

        {/* Mobile Navigation Drawer */}
        <Drawer
          placement="left"
          onClose={toggleMobileDrawer}
          open={mobileDrawerOpen}
          width={280}
          bodyStyle={{ padding: 0 }}
          headerStyle={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
          }}
          title={
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">POS</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">POS System</h3>
                <p className="text-xs text-gray-500">Mobile Version</p>
              </div>
            </div>
          }
          className="pwa-drawer"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                    activeTab === item.key
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.key && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* User profile ở bottom của drawer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {localStorage.getItem("username") || "User"}
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                  className="p-2 text-gray-500 hover:text-red-500"
                >
                  <span className="text-sm">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </Drawer>

        {/* Main Content - tối ưu cho mobile */}
        <main className="min-h-[calc(100vh-7rem)] safe-area-bottom">
          <div className="p-3 md:p-4 transition-all duration-300 animate-fadeIn">
            <Outlet context={{ isMobile }} />
          </div>
        </main>

        {/* Bottom Navigation cho PWA (giống native app) */}
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 safe-area-bottom z-30 shadow-lg">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={`flex flex-col items-center justify-center py-1 px-2 flex-1 transition-all ${
                  activeTab === item.key ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`text-xl mb-1 p-2 rounded-lg ${
                    activeTab === item.key ? "bg-blue-50" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Quick Action Float Button */}
        <FloatButton.Group
          shape="circle"
          style={{ right: 16, bottom: 80 }}
          trigger="hover"
          icon={<PlusOutlined />}
        >
          <FloatButton
            icon={<ShoppingCartOutlined />}
            tooltip="Tạo đơn mới"
            onClick={() => navigate("/orders/create")}
          />
          <FloatButton
            icon={<AppstoreOutlined />}
            tooltip="Thêm sản phẩm"
            onClick={() => navigate("/products/create")}
          />
        </FloatButton.Group>

        {/* Session Expired Modal */}
        <SessionExpiredModal
          visible={sessionExpiredVisible}
          onOk={handleSessionExpiredOk}
        />
      </div>

      {/* Thêm CSS cho PWA optimization */}
      <style jsx>{`
        .safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Tăng kích thước tap target cho mobile */
        button,
        [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }

        /* Smooth transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
      `}</style>
    </ConfigProvider>
  );
};

// Thêm icon PlusOutlined nếu chưa có
const PlusOutlined = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 1V15M1 8H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default PwaLayout;
