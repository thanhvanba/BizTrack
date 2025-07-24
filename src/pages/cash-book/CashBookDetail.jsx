import { Card, Row, Col, Typography, Divider, Table } from 'antd';

const { Title, Text } = Typography;

export default function CashBookDetail({ record }) {
  if (!record) return null;
  // Giả lập chi tiết, thực tế sẽ lấy từ API
  const details = [
    {
      id: 1,
      description: 'Chi tiết 1',
      amount: record.value,
    },
  ];
  const columns = [
    { title: 'Diễn giải', dataIndex: 'description', key: 'description' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right', render: (v) => v.toLocaleString() },
  ];
  return (
    <Card bordered className="mb-2">
      <Row gutter={[16, 8]}>
        <Col xs={24} md={8}>
          <Text type="secondary">Mã phiếu</Text>
          <div className="font-medium">{record.code}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Thời gian</Text>
          <div className="font-medium">{record.time}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Loại thu chi</Text>
          <div className="font-medium">{record.type}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Người nộp/nhận</Text>
          <div className="font-medium">{record.partner}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Giá trị</Text>
          <div className="font-medium" style={{ color: record.value < 0 ? 'red' : 'green' }}>{record.value.toLocaleString()}</div>
        </Col>
      </Row>
      <Divider />
      <Table columns={columns} dataSource={details} pagination={false} rowKey="id" size="small" />
    </Card>
  );
} 