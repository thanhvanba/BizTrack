import React, { useState } from 'react';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Image, Layout, Menu } from 'antd';
import logo from '../../assets/logo-biztrack.png';
import authService from '../../service/authService';

const menuItems = [
  { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
  { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
    children: [
      {
        label: "Danh sách sản phẩm",
        key: "products",
      },
      {
        label: "Danh mục",
        key: "product-category",
      },
    ],
  },

  {
    key: 'revenue',
    label: 'Doanh Thu',
    icon: <DollarOutlined />,
    // children: [
    //   { key: 'revenue-monthly', label: 'Tháng này' },
    //   { key: 'revenue-quarterly', label: 'Theo quý' },
    // ],
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    icon: <UserOutlined />,
    // children: [
    //   { key: 'customer-list', label: 'Danh sách KH' },
    //   { key: 'customer-feedback', label: 'Phản hồi' },
    // ],
  },
  { key: 'inventory', icon: <ContainerOutlined />, label: 'Quản lý kho' },
];
const { Sider } = Layout
const Sidebar = ({ collapsed, setCollapsed, setActiveTab, activeTab }) => {
  ;
  const [openKeys, setOpenKeys] = useState([]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    const rootSubmenuKeys = ['revenue', 'customers'];
    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };
  console.log("🚀 ~ Sidebar ~ collapsed:", collapsed)

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    await authService.logOut({ refreshToken });
  }
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      className="shadow-lg border-r border-gray-100 z-20"
      style={{
        background: "white",
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div className={`flex flex-col h-screen`}>
        <div className="flex items-center justify-between transition-all duration-300 min-h-20 px-4 py-[10px]">
          {!collapsed && (
            <Image width={140} preview={false} src={logo} alt="Logo" />
          )}
          {collapsed !== undefined && < Button type="primary" onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          }
        </div>

        <Menu
          className="flex-auto"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[activeTab]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={({ key }) => setActiveTab(key)}
          items={menuItems}
        />

        <div className="p-4 border-t-2 border-[#0505050f]">
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
            <LogoutOutlined className="mr-2 h-4 w-4" />
            {collapsed ? '' : 'Đăng xuất'}
          </Button>
        </div>
      </div>
    </Sider >
  );
};

export default Sidebar;
