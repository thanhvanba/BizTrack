import React from 'react';
import { Dropdown, Menu, Avatar } from 'antd';
import {
  UserOutlined,
  BoxPlotOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import ListNotification from '../ListNotification';

export default function Header() {
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

  return (
    <div className="flex justify-end items-center shadow-lg h-20 px-4">
      <div className="flex px-3 items-center">
        <div>
          <ListNotification />
        </div>
        <div className="relative ml-4">
          <Dropdown overlay={menu} trigger={['hover']} placement="bottomRight">
            <div className="flex items-center cursor-pointer transition-transform duration-150 hover:scale-[1.01]">
              <div className="ml-3 flex flex-col text-right">
                <span className="text-sm text-gray-600">Xin chào</span>
                <span className="text-xl text-cyan-600 font-bold">Sonder Van</span>
              </div>
              <div className="ml-2">
                <Avatar icon={<UserOutlined />} size={32} />
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
