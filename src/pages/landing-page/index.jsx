import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Divider, Collapse, Badge } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ASSETS } from '../../config/companyConfig';
import logo from '../../assets/logo-biztrack-bg.png';

// Import showcase images
import dashboardImg from '../../assets/home.png';
import ordersImg from '../../assets/order.png';
import orderDetailImg from '../../assets/order.png';
import inventoryImg from '../../assets/warehouse.png';
import reportsImg from '../../assets/revenue.png';
import customerImg from '../../assets/customer.png';
import supplierImg from '../../assets/supplier.png';
import cashbookImg from '../../assets/cashbook.png';
import statisticsImg from '../../assets/statictis.png';
import financeImg from '../../assets/finance.png';

const { Title, Paragraph, Text } = Typography;

const LandingPage = () => {

  const features = [
    {
      icon: <ShoppingCartOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: 'Quản lý đơn hàng',
      description: 'Theo dõi và quản lý đơn hàng một cách hiệu quả, từ đặt hàng đến giao hàng'
    },
    {
      icon: <UserOutlined style={{ fontSize: '2rem', color: '#52c41a' }} />,
      title: 'Quản lý khách hàng',
      description: 'Lưu trữ thông tin khách hàng, lịch sử mua hàng và công nợ'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '2rem', color: '#fa8c16' }} />,
      title: 'Báo cáo doanh thu',
      description: 'Phân tích doanh thu, lợi nhuận và xu hướng kinh doanh'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '2rem', color: '#722ed1' }} />,
      title: 'Quản lý kho',
      description: 'Kiểm soát tồn kho, nhập xuất hàng hóa và điều chỉnh kho'
    }
  ];

  const benefits = [
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      text: 'Tiết kiệm thời gian quản lý'
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      text: 'Tăng hiệu quả kinh doanh'
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      text: 'Giảm thiểu sai sót'
    },
    {
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      text: 'Báo cáo chi tiết và chính xác'
    }
  ];

  const testimonials = [
    {
      name: 'Anh Minh',
      business: 'Cửa hàng điện tử',
      content: 'BizTrack giúp tôi quản lý cửa hàng hiệu quả hơn rất nhiều. Giao diện dễ sử dụng và tính năng đầy đủ.',
      rating: 5
    },
    {
      name: 'Chị Lan',
      business: 'Shop thời trang',
      content: 'Phần mềm này đã giúp tôi tiết kiệm được rất nhiều thời gian trong việc quản lý kho và đơn hàng.',
      rating: 5
    },
    {
      name: 'Anh Tuấn',
      business: 'Cửa hàng tạp hóa',
      content: 'Báo cáo doanh thu rất chi tiết, giúp tôi đưa ra quyết định kinh doanh chính xác hơn.',
      rating: 5
    }
  ];

  const steps = [
    { step: 'B1', title: 'Khởi tạo dữ liệu', desc: 'Nhập dữ liệu mẫu hoặc import tệp sẵn có' },
    { step: 'B2', title: 'Thiết lập danh mục', desc: 'Tạo sản phẩm, nhà cung cấp, khách hàng, kho' },
    { step: 'B3', title: 'Vận hành bán–nhập', desc: 'Tạo đơn bán, nhập mua, theo dõi tồn' },
    { step: 'B4', title: 'Xem báo cáo', desc: 'Doanh thu, top sản phẩm/khách hàng, tài chính' },
  ];

  const showcaseScreens = [
    {
      title: 'Dashboard',
      description: 'Tổng quan KPI, doanh thu, hoạt động gần đây',
      imageUrl: dashboardImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Thống kê doanh thu', 'Đơn hàng mới nhất', 'Hoạt động gần đây']
    },
    {
      title: 'Danh sách đơn hàng',
      description: 'Quản lý và theo dõi tất cả đơn hàng',
      imageUrl: ordersImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Lọc và tìm kiếm', 'Trạng thái đơn hàng', 'Thao tác nhanh']
    },
    {
      title: 'Chi tiết đơn hàng',
      description: 'Xem và chỉnh sửa thông tin đơn hàng',
      imageUrl: orderDetailImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Thông tin đơn hàng', 'Lịch sử thanh toán', 'Lịch sử trả hàng']
    },
    {
      title: 'Tồn kho theo kho',
      description: 'Kiểm soát tồn kho theo từng kho',
      imageUrl: inventoryImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Tồn kho thực tế', 'Cảnh báo hết hàng', 'Lịch sử nhập xuất', 'Điều chỉnh kho']
    },
    {
      title: 'Báo cáo doanh thu',
      description: 'Phân tích doanh thu và lợi nhuận',
      imageUrl: reportsImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Báo cáo theo thời gian', 'So sánh kỳ', 'Xuất Excel']
    },
    {
      title: 'Quản lý khách hàng',
      description: 'Lưu trữ thông tin và lịch sử khách hàng',
      imageUrl: customerImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Hồ sơ khách hàng', 'Lịch sử mua hàng', 'Công nợ phải thu']
    },
    {
      title: 'Quản lý nhà cung cấp',
      description: 'Theo dõi thông tin và công nợ nhà cung cấp',
      imageUrl: supplierImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Thông tin NCC', 'Công nợ phải trả', 'Lịch sử giao dịch']
    },
    {
      title: 'Sổ quỹ',
      description: 'Ghi nhận thu chi và quản lý dòng tiền',
      imageUrl: cashbookImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Thu chi hàng ngày', 'Báo cáo dòng tiền', 'Cân đối kế toán']
    },
    {
      title: 'Thống kê tổng hợp',
      description: 'Phân tích và báo cáo tổng quan hệ thống',
      imageUrl: statisticsImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Biểu đồ thống kê', 'Báo cáo chi tiết']
    },
    {
      title: 'Quản lý tài chính',
      description: 'Theo dõi và phân tích tình hình tài chính doanh nghiệp',
      imageUrl: financeImg,
      imagePlaceholder: 'Khu vực ảnh minh hoạ (16:9)',
      features: ['Báo cáo tài chính', 'Phân tích lợi nhuận']
    }
  ];

  // Multicolor gradients for lively accents
  const rainbow = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-lime-500',
    'from-rose-500 to-amber-500',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #437aff 0%, #4e95ff 100%)' }}>
      {/* Header (Tailwind) */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur shadow">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="h-[70px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={ASSETS.logo} alt="BizTrack" className="h-[70px]" />
            </div>
            <a href="https://zalo.me/0933268012" className="inline-flex items-center justify-center h-10 rounded-md bg-yellow-400 px-5 font-medium text-black hover:bg-yellow-300 transition">
              0933 268 012
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section (Tailwind) */}
      <div className="relative pt-[100px] pb-20 overflow-hidden">
        {/* Decorative blobs */}
      
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
                Quản lý kinh doanh
                <br />
                <span className="text-yellow-300">thông minh</span>
              </h1>
              <p className="text-white/90 text-lg m-0">
                Phần mềm quản lý kinh doanh toàn diện giúp bạn kiểm soát đơn hàng, khách hàng, kho hàng và báo cáo một cách hiệu quả.
              </p>
              <a href="https://zalo.me/0933268012" className="inline-flex items-center justify-center h-12 rounded-md bg-yellow-400 mt-3 px-6 text-black font-semibold hover:bg-yellow-300 transition">
                Gọi ngay: 0933 268 012
              </a>
            </div>
            <div className="text-center">
              <img src={ASSETS.logo} alt="BizTrack Dashboard" className="bg-white mx-auto max-w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 h-1"></div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
              Tính năng nổi bật
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
              BizTrack cung cấp đầy đủ các công cụ cần thiết để quản lý kinh doanh hiệu quả
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {feature.icon}
                    <Title level={4} style={{ margin: 0 }}>{feature.title}</Title>
                    <Paragraph style={{ color: '#666', margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Stats Stripe */}
      <div style={{ background: '#0f1f3a', padding: '24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[24, 24]}>
            {[{ label: 'Doanh nghiệp đang dùng', value: '200+' }, { label: 'Thời gian triển khai', value: '48 giờ' }, { label: 'Uptime', value: '99.9%' }, { label: 'Hài lòng', value: '4.9/5' }].map((s, i) => (
              <Col xs={12} lg={6} key={i}>
                <Card style={{ background: '#0b142d', borderColor: '#163057', color: 'white', textAlign: 'center', borderRadius: 12 }}>
                  <Title level={2} style={{ color: '#ffd700', margin: 0 }}>{s.value}</Title>
                  <Text style={{ color: '#9db3c7' }}>{s.label}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2} style={{ fontSize: '2.5rem' }}>
                  Tại sao chọn BizTrack?
                </Title>
                <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
                  BizTrack được thiết kế đặc biệt cho các doanh nghiệp vừa và nhỏ,
                  giúp bạn quản lý kinh doanh một cách chuyên nghiệp và hiệu quả.
                </Paragraph>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {benefits.map((benefit, index) => (
                    <Space key={index} size="middle">
                      {benefit.icon}
                      <Text style={{ fontSize: '1.1rem' }}>{benefit.text}</Text>
                    </Space>
                  ))}
                </Space>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={reportsImg}
                  alt="QR Code"
                  className='w-full h-auto rounded-lg'
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Use-cases grid */}
      <div style={{ background: '#f8f9fa', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2}>Các module/màn hình chính</Title>
            <Text type="secondary">Tổng hợp những gì BizTrack đang hỗ trợ vận hành</Text>
          </div>
          <Row gutter={[24, 24]}>
            {[
              { title: 'Dashboard', desc: 'Tổng quan KPI, doanh thu, hoạt động gần đây' },
              { title: 'Đơn hàng', desc: 'Danh sách, tạo/sửa, trạng thái, thanh toán, trả hàng' },
              { title: 'Khách hàng', desc: 'Hồ sơ, lịch sử mua, công nợ phải thu' },
              { title: 'Sản phẩm', desc: 'Danh mục, nhóm, thuộc tính sản phẩm' },
              { title: 'Kho hàng', desc: 'Tồn kho, nhập–xuất, điều chỉnh, thẻ kho' },
              { title: 'Nhà cung cấp', desc: 'Thông tin NCC, công nợ phải trả' },
              { title: 'Nhập mua (PO)', desc: 'Tạo, danh sách, chi tiết phiếu nhập' },
              { title: 'Sổ quỹ', desc: 'Ghi nhận thu/chi, dòng tiền' },
              { title: 'Báo cáo', desc: 'Top sản phẩm/khách hàng, doanh thu, tài chính' },
            ].map((k, i) => (
              <Col xs={12} lg={8} key={i}>
                <Card hoverable style={{ borderRadius: 12 }} className="group hover:ring-2 hover:ring-yellow-300 transition">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 group-hover:scale-125 transition"></span>
                      <Text strong>{k.title}</Text>
                    </div>
                    <Text type="secondary">{k.desc}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Product highlights instead of pricing */}
      {/* <div style={{ background: '#f8f9fa', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2}>Điểm nhấn sản phẩm</Title>
            <Text type="secondary">Tập trung vào giá trị và trải nghiệm người dùng</Text>
          </div>
          <Row gutter={[24, 24]}>
            {[{
              title: 'Thiết lập nhanh', desc: 'Vào dùng ngay trong ngày với dữ liệu mẫu và hướng dẫn rõ ràng.'
            }, {
              title: 'Giao diện thân thiện', desc: 'Tối giản thao tác, phù hợp nhân viên bán hàng và quản lý.'
            }, {
              title: 'Báo cáo theo ngữ cảnh', desc: 'Xem số liệu quan trọng ngay nơi cần, không cần rời màn hình.'
            }].map((b, i) => (
              <Col xs={24} lg={8} key={i}>
                <Card hoverable style={{ borderRadius: 16 }} className="group hover:shadow-xl hover:-translate-y-0.5 transition ease-out">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        {b.title}
                      </span>
                    </Title>
                    <Text type="secondary">{b.desc}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div> */}

      {/* Quick process */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2}>Quy trình sử dụng nhanh</Title>
            <Text type="secondary">Bắt đầu trong vài bước đơn giản</Text>
          </div>
          <Row gutter={[24, 24]} align="middle">
            {steps.map((s, i) => (
              <Col xs={24} lg={6} key={i}>
                <Card
                  style={{ textAlign: 'center', borderRadius: 16 }}
                  className="relative overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rainbow[i % rainbow.length]}`} />
                  <div className="flex flex-col items-center gap-2 pt-4 pb-2">
                    <span className={`inline-flex h-7 px-3 items-center justify-center rounded-full bg-gradient-to-r ${rainbow[i % rainbow.length]} text-white text-sm font-semibold shadow`}>
                      {s.step}
                    </span>
                    <Title level={4} style={{ marginBottom: 0 }}>{s.title}</Title>
                    <Text type="secondary" style={{ display: 'block' }}>{s.desc}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Showcase placeholders for screenshots */}
      <div style={{ background: '#f8f9fa', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2}>Màn hình tiêu biểu</Title>
          </div>
          <Row gutter={[24, 24]}>
            {showcaseScreens.map((item, i) => (
              <Col xs={24} lg={12} key={i}>
                <Card style={{ borderRadius: 16 }} className="hover:shadow-md transition-shadow">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Title level={4} style={{ marginBottom: 8 }}>{item.title}</Title>
                      <Text type="secondary" style={{ fontSize: '14px' }}>{item.description}</Text>
                    </div>
                    <img
                      src={item.imageUrl || '/placeholder-screenshot.png'}
                      alt={item.title}
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        borderRadius: 12,
                        border: '1px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        e.target.style.background = '#0f1f3a';
                        e.target.style.border = '1px dashed #1d2b4a';
                        e.target.style.display = 'flex';
                        e.target.style.alignItems = 'center';
                        e.target.style.justifyContent = 'center';
                        e.target.style.color = '#9db3c7';
                        e.target.textContent = item.imagePlaceholder;
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.features.map((feature, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#666'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} lg={12}>
              <Title level={2}>Câu hỏi thường gặp</Title>
              <Collapse bordered={false} items={[
                { key: '1', label: 'Triển khai mất bao lâu?', children: <Text>Thông thường 24–48 giờ tùy dữ liệu và quy mô.</Text> },
                { key: '2', label: 'Có hỗ trợ nhập dữ liệu cũ?', children: <Text>Có. Chúng tôi hỗ trợ import khách hàng/sản phẩm.</Text> },
                { key: '3', label: 'Dữ liệu có an toàn không?', children: <Text>Hệ thống sao lưu hằng ngày, phân quyền chặt chẽ.</Text> },
              ]} />
            </Col>
            <Col xs={24} lg={12}>
              <Card style={{ borderRadius: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={3} style={{ margin: 0 }}>Nhận tư vấn miễn phí</Title>
                  <Text>Gọi ngay để được hướng dẫn sử dụng và tư vấn triển khai</Text>
                  <Button type="primary" size="large" href="https://zalo.me/0933268012">Gọi: 0933 268 012</Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Testimonials Section */}
      {/* <div style={{ background: 'white', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
              Khách hàng nói gì về BizTrack?
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
              Hàng trăm khách hàng đã tin tưởng và sử dụng BizTrack
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} lg={8} key={index}>
                <Card 
                  style={{ 
                    height: '100%',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                  className="hover:shadow-md transition-shadow"
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarOutlined key={i} style={{ color: '#ffd700', fontSize: '1.2rem' }} />
                      ))}
                    </div>
                    <Paragraph style={{ fontStyle: 'italic', color: '#666' }}>
                      "{testimonial.content}"
                    </Paragraph>
                    <Divider style={{ margin: '10px 0' }} />
                    <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                      <Text strong style={{ fontSize: '1.1rem' }}>{testimonial.name}</Text>
                      <Text type="secondary">{testimonial.business}</Text>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div> */}

      {/* Contact Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 0',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2} style={{ color: 'white', fontSize: '2.5rem' }}>
                  Sẵn sàng bắt đầu?
                </Title>
                <Paragraph style={{ color: 'white', fontSize: '1.2rem' }}>
                  Liên hệ ngay với chúng tôi để được tư vấn miễn phí và trải nghiệm
                  phần mềm quản lý kinh doanh BizTrack.
                </Paragraph>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space size="middle">
                    <PhoneOutlined style={{ fontSize: '1.2rem' }} />
                    <Text style={{ color: 'white', fontSize: '1.1rem' }}>0933 268 012</Text>
                  </Space>
                  <Space size="middle">
                    <MailOutlined style={{ fontSize: '1.2rem' }} />
                    <Text style={{ color: 'white', fontSize: '1.1rem' }}>info@biztrack.vn</Text>
                  </Space>
                  <Space size="middle">
                    <EnvironmentOutlined style={{ fontSize: '1.2rem' }} />
                    <Text style={{ color: 'white', fontSize: '1.1rem' }}>Khu Đô Thị Vạn Phúc</Text>
                  </Space>
                </Space>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div style={{ textAlign: 'center' }}>
                <Card style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px'
                }}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={3} style={{ color: 'white', margin: 0 }}>
                      Liên hệ ngay
                    </Title>
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        height: '60px',
                        fontSize: '1.3rem',
                        background: '#ffd700',
                        borderColor: '#ffd700',
                        color: '#000',
                        borderRadius: '30px'
                      }}
                      href="https://zalo.me/0933268012"
                      block
                    >
                      <PhoneOutlined /> Gọi: 0933 268 012
                    </Button>
                    <Text style={{ color: 'white', fontSize: '1rem' }}>
                      Tư vấn miễn phí 24/7
                    </Text>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1f1f1f', padding: '20px 0', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row className='justify-center'>
            <Col>
              <Text style={{ color: '#999' }}>
                © 2025 BizTrack. Phần mềm quản lý kinh doanh chuyên nghiệp.
              </Text>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
