import React, { useState } from "react";
import { Card, Button, Switch, Typography, Divider } from "antd";
import { EditOutlined, KeyOutlined, SafetyOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import ProfileEditModal from "../../components/modals/ProfileEditModal";
import userService from "../../service/userService";
import { fetchProfile } from "../../redux/user/user.slice";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [openModal, setOpenModal] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const user = useSelector(state => state.user.userInfo.data) || {};
  const dispatch = useDispatch();
  console.log("🚀 ~ ProfilePage ~ user:", user)

  const handleSave = async (updated) => {
    console.log("Dữ liệu lưu:", updated);
    setOpenModal(false);
    // Gọi API cập nhật thông tin ở đây, ví dụ:
    await userService.updateUser(user.user_id, updated)
    dispatch(fetchProfile());
  };
  return (
    <div className="max-w-5xl mx-auto p-6">
      <Title level={3}>Tài khoản</Title>

      {/* Thông tin người dùng */}
      <Card
        title="Thông tin người dùng"
        extra={
          <Button icon={<EditOutlined />} onClick={() => setOpenModal(true)}>
            Chỉnh sửa
          </Button>
        }
        className="mb-6 rounded-2xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Text type="secondary">Tên hiển thị</Text>
            <p>{user.fullname || <span className="text-black/30">Chưa có</span>}</p>
          </div>
          <div>
            <Text type="secondary">Tên đăng nhập</Text>
            <p>{user.username || <span className="text-black/30">Chưa có</span>}</p>
          </div>
          <div>
            <Text type="secondary">Vai trò</Text>
            <p>{user.role_name || <span className="text-black/30">Chưa có</span>}</p>
          </div>
          <div>
            <Text type="secondary">Điện thoại</Text>
            <p>{user.phone || <span className="text-black/30">Chưa có</span>}</p>
          </div>
          <div>
            <Text type="secondary">Email</Text>
            <p>{user.email || <span className="text-black/30">Chưa có</span>}</p>
          </div>
          <div>
            <Text type="secondary">Sinh nhật</Text>
            <p>{user.birthday || <span className="text-black/30">Chưa có</span>}</p>
          </div>
        </div>
      </Card>

      {/* Đăng nhập và bảo mật */}
      <Card title="Đăng nhập và bảo mật" className="rounded-2xl shadow-sm !mt-3">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyOutlined />
              <Text strong>Mật khẩu</Text>
            </div>
            <Text type="secondary">
              Để bảo mật tài khoản tốt hơn, hãy sử dụng mật khẩu mạnh và thay đổi
              định kỳ 6 tháng/lần.
              <br />
              Hệ thống sẽ tự động đăng xuất tài khoản khỏi tất cả thiết bị trước
              khi đổi mật khẩu thành công.
            </Text>
          </div>
          <Button type="primary">Đổi mật khẩu</Button>
        </div>

        {/* <Divider />

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SafetyOutlined />
              <Text strong>Xác thực 2 lớp cho tài khoản của bạn</Text>
            </div>
            <Text type="secondary">
              Yêu cầu mã xác thực khi bạn đăng nhập trên thiết bị lạ.
            </Text>
          </div>
          <Switch checked={twoFactor} onChange={setTwoFactor} />
        </div> */}
      </Card>

      <ProfileEditModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        user={user}
      />
    </div>
  );
}
