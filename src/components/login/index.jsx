import { useState, useEffect } from "react"
import { Button, Checkbox, Form, Image, Input, message } from "antd"
import logo from '../../assets/logo-biztrack-2.png';

import {
  UserOutlined,
  LockOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import authService from "../../service/authService";
import useToastNotify from "../../utils/useToastNotify";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../../redux/user/user.slice";
import SessionExpiredModal from "../modals/SessionExpiredModal";
import sessionExpiredService from "../../utils/sessionExpiredService";
// import Link from "next/link"  

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false)
  const navigate = useNavigate()

  const dispatch = useDispatch()

  // Subscribe to session expired events
  useEffect(() => {
    const unsubscribe = sessionExpiredService.subscribe(setSessionExpiredVisible);
    return unsubscribe;
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const loginResponse = await authService.logIn(values);
      console.log("Login values:", values)
      if (loginResponse.success == true) {
        localStorage.setItem('access_token', loginResponse?.accessToken);
        localStorage.setItem('refresh_token', loginResponse?.refreshToken);
        useToastNotify('Đăng nhập thành công !', 'success');

        dispatch(fetchProfile())

        // Optional: Lưu vào localStorage hoặc Context
        // localStorage.setItem('user_info', JSON.stringify(userInfo));

        navigate('/dashboard')
      }
    } catch (error) {
      useToastNotify('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.', 'error');
    } finally {
      setLoading(false)
    }
  }

  const handleSessionExpiredOk = () => {
    setSessionExpiredVisible(false);
    // Không cần xóa token vì đã ở trang login
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center pt-3 sm:px-6 lg:px-8">
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
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Hệ Thống Quản Lý Bán Hàng</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Đăng nhập để truy cập vào hệ thống</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form name="login" className="space-y-6" initialValues={{ remember: true }} onFinish={onFinish} size="large">
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập!",
                },
              ]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Mật khẩu" />
            </Form.Item>

            {/* <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>

                <a href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Quên mật khẩu?
                </a>
              </div>
            </Form.Item> */}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-primary hover:bg-primary/90"
                loading={loading}
              >
                Đăng Nhập
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <button onClick={() => navigate("/register")} className="cursor-pointer text-blue-500 hover:text-blue-500/80 font-medium">
                Đăng ký ngay
              </button>
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

      {/* Session Expired Modal */}
      <SessionExpiredModal 
        visible={sessionExpiredVisible} 
        onOk={handleSessionExpiredOk} 
      />
    </div>
  )
}
