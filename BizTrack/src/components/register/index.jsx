import { useState } from "react"
import { Button, Form, Image, Input, message } from "antd"
import logo from '../../../public/logo-biztrack-2.png';

import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  UserSwitchOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
// import Link from "next/link"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const onFinish = async (values) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Register values:", values)
      message.success("Đăng ký tài khoản thành công!")

      // Redirect to login page after successful registration
      window.location.href = "/"
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div
        onClick={() => navigate('/')}
        className="flex gap-2 font-bold   text-blue-500 hover:text-blue-500/80 cursor-pointer"
      >
        <LeftOutlined />
        <span>Quay lại  </span>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image width={100} preview={false} src={logo} alt="Logo" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Đăng Ký Tài Khoản</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tạo tài khoản mới để truy cập vào hệ thống quản lý bán hàng
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form name="register" className="space-y-6" onFinish={onFinish} size="large" scrollToFirstError>
            <Form.Item
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên!",
                },
              ]}
            >
              <Input prefix={<UserSwitchOutlined className="site-form-item-icon" />} placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập!",
                },
                {
                  min: 4,
                  message: "Tên đăng nhập phải có ít nhất 4 ký tự!",
                },
              ]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-primary hover:bg-primary/90"
                loading={loading}
              >
                Đăng Ký
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                Đăng nhập ngay
              </a>
            </div>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Các chức năng hệ thống</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Quản lý đơn hàng
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Quản lý sản phẩm
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Quản lý kho
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Quản lý khách hàng
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Quản lý doanh thu
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
