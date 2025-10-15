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
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../redux/user/user.slice';
import authService from '../../service/authService';
import useToastNotify from '../../utils/useToastNotify';
import logo from '../../assets/logo-biztrack.png';
import { fetchPermissionByRole } from '../../redux/permission/permission.slice';
import { hasGroup, hasPermission } from '../../utils/permissionHelper';

export default function Header({ onToggleMobileDrawer, isMobile, setActiveTab, activeTab }) {
  const profileInfo = useSelector(state => state.user.userInfo)
  const permissions = useSelector(state => state.permission.permissions.permissions)
  console.log("🚀 ~ Header ~ permissions:", permissions)

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

  // --- Thêm menuItems từ sidebar ---
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
  const menu = (
    <Menu
      className="rounded-lg shadow-lg"
      items={[
        {
          key: '1',
          label: (
            <div
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md"
              onClick={() => navigate('/profile')}
            >
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
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md">
              <UserOutlined />
              <span>Quản lý người dùng</span>
            </div>
          ),
          onClick: () => navigate('/user-accounts'),
        },
        { type: 'divider' },
        {
          key: '5',
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
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(fetchProfile())
        .unwrap()
        .then((profile) => {
          console.log("🚀 ~ profile:", profile)
          // profile là giá trị return từ fetchProfile (thường là user info)
          const roleId = profile?.data?.role_id;
          if (roleId) {
            dispatch(fetchPermissionByRole(roleId));
          }
        })
        .catch((err) => {
          console.error("Fetch profile failed:", err);
        });
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
