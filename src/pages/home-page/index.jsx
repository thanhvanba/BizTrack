import React from 'react';
import { Button, Card, Typography, Space, Row, Col } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShoppingOutlined, ContainerOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logoBizTrack from '../../assets/logo-biztrack-2.png';
import { useSelector } from "react-redux";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
    const navigate = useNavigate();
    const userInfo = useSelector(state => state.user.userInfo);
    const isLoggedIn = !!userInfo?.data?.email || !!localStorage.getItem('access_token');
    console.log("🚀 ~ isLoggedIn:", isLoggedIn)

    const handleLogin = () => {
        navigate('/login');
    };

    const handleQuickLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const features = [
        {
            icon: <ShoppingCartOutlined className="text-2xl text-green-600" />,
            title: "Quản lý đơn hàng",
            description: "Theo dõi và xử lý đơn hàng một cách nhanh chóng và chính xác",
            bgColor: "bg-green-100"
        },
        {
            icon: <ShoppingOutlined className="text-2xl text-blue-600" />,
            title: "Quản lý sản phẩm",
            description: "Quản lý kho hàng, giá cả và thông tin sản phẩm hiệu quả",
            bgColor: "bg-blue-100"
        },
        {
            icon: <ContainerOutlined className="text-2xl text-orange-600" />,
            title: "Quản lý kho",
            description: "Kiểm soát tồn kho, nhập xuất hàng và báo cáo kho hàng",
            bgColor: "bg-orange-100"
        },
        {
            icon: <UserOutlined className="text-2xl text-purple-600" />,
            title: "Quản lý khách hàng",
            description: "Xây dựng và duy trì mối quan hệ khách hàng bền vững",
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-40 h-40 bg-transparent rounded-lg flex items-center justify-center">
                            <img src={logoBizTrack} alt="BizTrack Logo" className="w-40 h-40 object-contain" />
                        </div>
                    </div>
                    <Title level={3} className="text-xl text-gray-600 mb-8">
                        Hệ Thống Quản Lý Bán Hàng Toàn Diện
                    </Title>
                    <Paragraph className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Giải pháp quản lý bán hàng hiện đại giúp doanh nghiệp tối ưu hóa quy trình kinh doanh, quản lý đơn hàng,
                        khách hàng và doanh thu một cách hiệu quả.
                    </Paragraph>
                </div>
                <div className="max-w-md mx-auto mb-8">
                    {isLoggedIn ? (
                        <Button
                            type="primary"
                            size="large"
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                            onClick={() => navigate("/dashboard")}
                        >
                            Vào trang quản lý
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                size="large"
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                                onClick={handleLogin}
                            >
                                Đăng nhập để sử dụng
                            </Button>
                            <div className="text-center pt-4">
                                <Text className="text-sm text-gray-600">
                                    Chưa có tài khoản?{" "}
                                    <Text
                                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                                        onClick={handleRegister}
                                    >
                                        Đăng ký ngay
                                    </Text>
                                </Text>
                            </div>
                        </>
                    )}
                </div>
                {/* <Button
                                size="large"
                                className="w-full h-12 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                                onClick={handleQuickLogin}
                            >
                                Đăng nhập nhanh
                            </Button> */}
                {/* Features Grid */}
                <Row gutter={[24, 24]} className="mb-16">
                    {features.map((feature, index) => (
                        <Col xs={24} md={12} lg={6} key={index}>
                            <Card className="text-center h-full">
                                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                                    {feature.icon}
                                </div>
                                <Title level={4} className="text-lg mb-2">
                                    {feature.title}
                                </Title>
                                <Paragraph className="text-gray-600">
                                    {feature.description}
                                </Paragraph>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Login Buttons */}
                {/* <div className="max-w-md mx-auto">
                    <Card className="p-6">
                        <div className="text-center pb-4">
                            <Title level={2} className="text-2xl mb-2">
                                Bắt đầu sử dụng BizTrack
                            </Title>
                            <Paragraph className="text-gray-600">
                                Chọn phương thức đăng nhập phù hợp với bạn
                            </Paragraph>
                        </div>
                        <Space direction="vertical" size="middle" className="w-full">
                            <Button
                                type="primary"
                                size="large"
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                                onClick={handleLogin}
                            >
                                Đăng nhập với tài khoản
                            </Button>
                            {/* <Button
                                size="large"
                                className="w-full h-12 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                                onClick={handleQuickLogin}
                            >
                                Đăng nhập nhanh
                            </Button> *
                            <div className="text-center pt-4">
                                <Text className="text-sm text-gray-600">
                                    Chưa có tài khoản?{" "}
                                    <Text
                                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                                        onClick={handleRegister}
                                    >
                                        Đăng ký ngay
                                    </Text>
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </div> */}
            </div>
        </div>
    );
}
