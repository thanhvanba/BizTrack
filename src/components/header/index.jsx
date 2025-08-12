import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Avatar, Button, Image } from 'antd';
import {
  UserOutlined,
  BoxPlotOutlined,
  LogoutOutlined,
  MenuOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  DollarOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BookOutlined,
} from '@ant-design/icons';
import ListNotification from '../ListNotification';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../redux/user/user.slice';
import authService from '../../service/authService';
import useToastNotify from '../../utils/useToastNotify';
import logo from '../../assets/logo-biztrack.png';

// --- Thêm menuItems từ sidebar ---
const menuItems = [
  { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
  {
    key: 'orders',
    icon: <ShoppingCartOutlined />,
    label: 'Đơn hàng',
    children: [
      { label: 'Danh sách đơn hàng', key: 'orders' },
      { label: 'Tạo đơn hàng', key: 'create-order' },
      { label: 'Trả hàng', key: 'return-order' },
    ],
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    icon: <UserOutlined />,
  },
  {
    key: 'inventory',
    icon: <ContainerOutlined />,
    label: 'Quản lý kho',
    children: [
      {
        type: 'group',
        label: 'Kho hàng',
        children: [
          { key: 'warehouses', label: 'Danh sách kho' },
          { key: 'inventory', label: 'Kiểm kho' },
        ],
      },
      {
        type: 'group',
        label: 'Nhập hàng',
        children: [
          { key: 'suppliers', label: 'Nhà cung cấp' },
          { key: 'purchase', label: 'Nhập hàng' },
          { key: 'purchase-return', label: 'Trả hàng nhập' },
        ],
      },
    ],
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
    children: [
      { label: 'Danh sách sản phẩm', key: 'products' },
      { label: 'Danh mục', key: 'product-category' },
    ],
  },
  {
    key: 'cash-book',
    label: 'Sổ quỹ',
    icon: <DollarOutlined />,
  },
  {
    key: 'statictis',
    icon: <BookOutlined />,
    label: 'Báo cáo',
    children: [
      { label: 'Doanh thu', key: 'revenue-report' },
      { label: 'Sản phẩm', key: 'product-report' },
      { label: 'Khách hàng', key: 'customer-report' },
      { label: 'Nhà cung cấp', key: 'supplier-report' },
      { label: 'Tài chính', key: 'finance-report' },
    ],
  },
];

export default function Header({ onToggleMobileDrawer, isMobile, setActiveTab, activeTab }) {
  const dispatch = useDispatch()
  // --- State cho openKeys nếu có submenu ---
  const [openKeys, setOpenKeys] = useState([]);

  const handleMenuClick = ({ key }) => {
    setActiveTab && setActiveTab(key);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await authService.logOut({ refreshToken });
      useToastNotify("Đăng xuất thành công", "success");
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } catch (error) {
      useToastNotify("Đăng xuất thất bại", "error");
    }
  }

  const profileInfo = useSelector(state => state.user.userInfo)
  const menu = (
    <Menu
      className="rounded-lg shadow-lg"
      items={[
        {
          key: '1',
          label: (
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md">
              <UserOutlined className='text-3xl' />
              <div>
                <div className="text-base">Tên: <span className='text-cyan-600 font-bold'>{profileInfo?.data?.username}</span></div>
                <div className="text-cyan-600 font-bold">{profileInfo?.data?.email}</div>
              </div>
            </div>

          ),
        },

        { type: 'divider' },
        {
          key: '2',
          label: (
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md">
              <BoxPlotOutlined />
              <span>Thông tin gói dịch vụ</span>
            </div>
          ),
        },
        {
          key: '3',
          label: (
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md">
              <BoxPlotOutlined />
              <button onClick={() => navigate("/register")}>
                Đăng ký tài khoản mới
              </button>
            </div>
          ),
        },
        {
          key: '4',
          label: (
            <div onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md">
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </div>
          ),
        },
        // { type: 'divider' },
        // {
        //   key: '4',
        //   label: (
        //     <div className="px-4 py-2 hover:bg-slate-100 rounded-md cursor-default">
        //       Điều khoản dịch vụ
        //     </div>
        //   ),
        // },
        // {
        //   key: '5',
        //   label: (
        //     <div className="px-4 py-2 hover:bg-slate-100 rounded-md cursor-default">
        //       Chính sách bảo mật
        //     </div>
        //   ),
        // },
      ]}
    />
  );
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);


  const navigate = useNavigate()
  return (
    <div className="w-full shadow-lg bg-white">
      <div className="flex items-center w-full px-4 h-20 justify-between">

        {isMobile && (
          <Button
            icon={<MenuOutlined />}
            type="text"
            onClick={onToggleMobileDrawer}
          />
        )}
        {/* Logo */}
        <div className="flex items-center mr-6">
          <Image width={140} preview={false} src={logo} alt="Logo" />
        </div>
        {/* Tab menu (desktop) */}
        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            items={menuItems}
            className="flex-1 border-none min-w-0 items-center mx-auto"
          />
        )}
        {/* Notification & Account */}
        <div className="flex items-center gap-4">
          {!isMobile && <ListNotification />}
          {Object.keys(profileInfo).length ? (
            <div className="flex items-center gap-2">
              {/* <span className="text-sm text-gray-600">Xin chào</span>
              <span className="text-xl text-cyan-600 font-bold">{profileInfo?.data?.email}</span> */}
              <Dropdown overlay={menu} trigger={['hover']} placement="bottomRight">
                <Avatar icon={<UserOutlined />} size={42} className="cursor-pointer" />
              </Dropdown>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="primary"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
              <Button
                type="default"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
