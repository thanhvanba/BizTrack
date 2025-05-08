"use client"

import { useState, useEffect } from "react"
import { Layout, ConfigProvider, theme, Drawer } from "antd"
import { MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined } from "@ant-design/icons"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/dashboard"
import InventoryManagement from "./pages/inventory-management"
import RevenueTracking from "./pages/revenue-tracking"
import ProductManagement from "./pages/product-management"
import CustomerManagement from "./pages/customer-management"
// import StockTracking from "./pages/StockTracking"
import OrderManagement from "./pages/order-management"
import "./index.css"
import Header from "./components/header"

const { Content } = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileView, setMobileView] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "inventory":
        return <InventoryManagement />
      case "revenue":
        return <RevenueTracking />
      case "products":
        return <ProductManagement />
      case "customers":
        return <CustomerManagement />
      // case "stock":
      //   return <StockTracking />
      case "orders":
        return <OrderManagement />
      default:
        return <Dashboard />
    }
  }

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen)
  }

  const handleMenuClick = (key) => {
    setActiveTab(key)
    if (mobileView) {
      setMobileDrawerOpen(false)
    }
  }

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
      <Layout className="min-h-screen bg-gray-50">
        <>
          {/* Desktop Sidebar */}
          {!mobileView && <Sidebar collapsed={collapsed} activeTab={activeTab} setActiveTab={handleMenuClick} />}
          {/* 
          {/* Mobile Drawer Sidebar 
          {mobileView && (
            <Drawer
              placement="left"
              onClose={toggleMobileDrawer}
              open={mobileDrawerOpen}
              width={280}
              bodyStyle={{ padding: 0 }}
              headerStyle={{ display: "none" }}
              className="sidebar-drawer"
            >
              <Sidebar activeTab={activeTab} setActiveTab={handleMenuClick} collapsed={false} />
            </Drawer>
          )} */}

        </>
        <Layout className="relative">
          <div className="bg-white sticky top-0 z-10 h-auto">
            <Header />
          </div>
          <Content className="p-3 md:p-6">
            <div className="p-3 md:p-6 transition-all duration-300 animate-fadeIn">
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
