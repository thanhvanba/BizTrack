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
import MainRouter from "./routes"

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
    <>
      <MainRouter />
    </>
  )
}

export default App
