import React, { useState } from 'react';
import {
  AppstoreOutlined,
  BookOutlined,
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
import { hasGroup, hasPermission } from '../../utils/permissionHelper';
import { useSelector } from 'react-redux';

const { Sider } = Layout
const Sidebar = ({ collapsed, setCollapsed, setActiveTab, activeTab }) => {
  const [openKeys, setOpenKeys] = useState([]);
  const permissions = useSelector(state => state.permission.permissions.permissions)
  console.log("🚀 ~ Header ~ permissions:", permissions)

  const menuItems = [
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
    hasGroup(permissions, 'order') && {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn hàng',
      children: [
        hasPermission(permissions, 'order.read') && { label: 'Danh sách đơn hàng', key: 'orders' },
        hasPermission(permissions, 'order.create') && { label: 'Tạo đơn hàng', key: 'create-order' },
        hasPermission(permissions, 'order.readReturn') && { label: 'Trả hàng', key: 'return-order' },
      ],
    },
    hasGroup(permissions, 'customer') && {
      key: 'customers',
      label: 'Khách hàng',
      icon: <UserOutlined />,
    },
    (hasGroup(permissions, 'inventory') || hasGroup(permissions, 'warehouse')
      || hasGroup(permissions, 'supplier') || hasGroup(permissions, 'purchase_order')
    ) && {
      key: 'inventory',
      icon: <ContainerOutlined />,
      label: 'Quản lý kho',
      children: [
        (hasPermission(permissions, 'warehouse.read') || hasPermission(permissions, 'inventory.read')) && {
          type: 'group',
          label: 'Kho hàng',
          children: [
            hasPermission(permissions, 'warehouse.read') && { key: 'warehouses', label: 'Danh sách kho' },
            hasPermission(permissions, 'inventory.read') && { key: 'inventory', label: 'Kiểm kho' },
          ],
        },
        (hasPermission(permissions, 'supplier.read') || hasPermission(permissions, 'purchase.read')
          || hasPermission(permissions, 'purchase.readReturn')
        ) &&
        {
          type: 'group',
          label: 'Nhập hàng',
          children: [
            hasPermission(permissions, 'supplier.read') && { key: 'suppliers', label: 'Nhà cung cấp' },
            hasPermission(permissions, 'purchase.read') && { key: 'purchase', label: 'Nhập hàng' },
            hasPermission(permissions, 'purchase.readReturn') && { key: 'purchase-return', label: 'Trả hàng nhập' },
          ],
        },
      ],
    },
    (hasGroup(permissions, 'product') || hasGroup(permissions, 'category'))
    && {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
      children: [
        hasPermission(permissions, 'product.read') && { label: 'Danh sách sản phẩm', key: 'products' },
        hasPermission(permissions, 'category.read') && { label: 'Danh mục', key: 'product-category' },
      ],
    },
    hasGroup(permissions, 'cashbook') && {
      key: 'cash-book',
      label: 'Sổ quỹ',
      icon: <DollarOutlined />,
    },
    hasGroup(permissions, 'statictis') && {
      key: 'statictis',
      icon: <BookOutlined />,
      label: 'Báo cáo',
      children: [
        hasPermission(permissions, 'statictis.revenue-report') && { label: 'Doanh thu', key: 'revenue-report' },
        hasPermission(permissions, 'statictis.product-report') && { label: 'Sản phẩm', key: 'product-report' },
        hasPermission(permissions, 'statictis.customer-report') && { label: 'Khách hàng', key: 'customer-report' },
        hasPermission(permissions, 'statictis.supplier-report') && { label: 'Nhà cung cấp', key: 'supplier-report' },
        hasPermission(permissions, 'statictis.finance-report') && { label: 'Tài chính', key: 'finance-report' },
      ],
    },
  ];
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const rootSubmenuKeys = menuItems
    .filter(item => item.children)
    .map(item => item.key);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };
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

        {/* <div className="p-4 border-t-2 border-[#0505050f]">
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
            <LogoutOutlined className="mr-2 h-4 w-4" />
            {collapsed ? '' : 'Đăng xuất'}
          </Button>
        </div> */}
      </div>
    </Sider >
  );
};

export default Sidebar;
