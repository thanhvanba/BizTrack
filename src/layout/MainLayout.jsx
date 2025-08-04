import { Layout, ConfigProvider, theme, Drawer } from "antd";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SessionExpiredModal from "../components/modals/SessionExpiredModal";
import sessionExpiredService from "../utils/sessionExpiredService";

const { Content } = Layout;

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Custom hook for mobile detection
    const useMobileDetection = () => {
        const [isMobile, setIsMobile] = useState(false);

        useEffect(() => {
            if (typeof window === 'undefined') return;

            // Use CSS media query for more reliable detection
            const mediaQuery = window.matchMedia('(max-width: 768px)');

            const handleMediaQueryChange = (e) => {
                setIsMobile(e.matches);
            };

            // Set initial value
            handleMediaQueryChange(mediaQuery);

            // Add listener
            mediaQuery.addEventListener('change', handleMediaQueryChange);

            return () => {
                mediaQuery.removeEventListener('change', handleMediaQueryChange);
            };
        }, []);

        return isMobile;
    };

    const mobileView = useMobileDetection();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

    const currentTab = location.pathname.replace("/", "") || "dashboard";
    const [activeTab, setActiveTab] = useState(currentTab);

    // Sync activeTab with route
    useEffect(() => {
        setActiveTab(currentTab);
    }, [currentTab]);

    // Subscribe to session expired events
    useEffect(() => {
        const unsubscribe = sessionExpiredService.subscribe(setSessionExpiredVisible);
        return unsubscribe;
    }, []);

    const handleMenuClick = (key) => {
        navigate(`/${key}`);
        setActiveTab(key);
        if (mobileView) {
            setMobileDrawerOpen(false);
        }
    };

    const toggleMobileDrawer = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const handleSessionExpiredOk = () => {
        setSessionExpiredVisible(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#3b82f6",
                    borderRadius: 8,
                },
            }}
        >
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar chỉ cho mobile */}
                {mobileView && (
                    <Drawer
                        placement="left"
                        onClose={toggleMobileDrawer}
                        open={mobileDrawerOpen}
                        width={240}
                        bodyStyle={{ padding: 0 }}
                        headerStyle={{ display: "none" }}
                        className="sidebar-drawer z-50"
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={handleMenuClick}
                        />
                    </Drawer>
                )}
                {/* Header luôn hiển thị */}
                <div className="bg-white sticky top-0 z-10 h-auto">
                    <Header
                        onToggleMobileDrawer={toggleMobileDrawer}
                        isMobile={mobileView}
                        activeTab={activeTab}
                        setActiveTab={handleMenuClick}
                    />
                </div>
                <Content>
                    <div className="p-2 sm:p-3 md:p-6 transition-all duration-300 animate-fadeIn h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-y-auto">
                        <Outlet context={{}} />
                    </div>
                </Content>
                {/* Session Expired Modal */}
                <SessionExpiredModal
                    visible={sessionExpiredVisible}
                    onOk={handleSessionExpiredOk}
                />
            </div>
        </ConfigProvider>
    );
};

export default MainLayout;
