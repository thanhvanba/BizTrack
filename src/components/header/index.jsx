import React from 'react';
import { Dropdown, Menu, Avatar, Button } from 'antd';
import {
  UserOutlined,
  BoxPlotOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import ListNotification from '../ListNotification';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header({ onToggleMobileDrawer, isMobile }) {
  const menu = (
    <Menu
      className="rounded-lg shadow-lg"
      items={[
        {
          key: '1',
          label: (
            <div
              // onClick={}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md"
            >
              <UserOutlined />
              <span>Tài khoản của bạn</span>
            </div>
          ),
        },
        {
          key: '2',
          label: (
            <div
              // onClick={}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md"
            >
              <BoxPlotOutlined />
              <span>Thông tin gói dịch vụ</span>
            </div>
          ),
        },
        {
          key: '3',
          label: (
            <div
              // onClick={handleLogoutApi}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md"
            >
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </div>
          ),
        },
        {
          type: 'divider',
        },
        {
          key: '4',
          label: (
            <div className="px-4 py-2 hover:bg-slate-100 rounded-md cursor-default">
              Điều khoản dịch vụ
            </div>
          ),
        },
        {
          key: '5',
          label: (
            <div className="px-4 py-2 hover:bg-slate-100 rounded-md cursor-default">
              Chính sách bảo mật
            </div>
          ),
        },
      ]}
    />
  );

  const profileInfo = useSelector(state => state.user.userInfo)
  console.log("🚀 ~ Header ~ profileInfo:", profileInfo)

  const navigate = useNavigate()
  return (
    <div className={`flex ${isMobile ? 'justify-between' : 'justify-end'} items-center shadow-lg h-20 px-4`}>
      {isMobile && (
        <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={onToggleMobileDrawer}
        />
      )}

      <div className="flex px-3 items-center">
        {Object.keys(profileInfo).length ?
          <>
            <div>
              {
                !isMobile && <ListNotification />
              }
            </div>
            <div className="relative ml-4">
              <Dropdown overlay={menu} trigger={['hover']} placement="bottomRight">
                <div className="flex items-center cursor-pointer transition-transform duration-150 hover:scale-[1.01]">
                  <div className="ml-3 flex flex-col text-right">
                    <span className="text-sm text-gray-600">Xin chào</span>
                    <span className="text-xl text-cyan-600 font-bold">{profileInfo?.data?.email}</span>
                  </div>
                  <div className="ml-2">
                    <Avatar icon={<UserOutlined />} size={32} />
                  </div>
                </div>
              </Dropdown>
            </div>
          </>

          :
          <div className="flex gap-4">
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
        }
      </div>
    </div>
  );
}
