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

    const [mobileView, setMobileView] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

    const currentTab = location.pathname.replace("/", "") || "dashboard";
    const [activeTab, setActiveTab] = useState(currentTab);

    // Handle responsive view
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setMobileView(isMobile);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                    <div className="p-3 md:p-6 transition-all duration-300 animate-fadeIn h-[89vh] overflow-y-auto">
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
