import { Card, Row, Col, Typography, Divider, Table } from 'antd';

const { Title, Text } = Typography;

export default function CashBookDetail({ record }) {
  if (!record) return null;

  // Chi tiết giao dịch (có thể mở rộng nếu API trả về nhiều dòng)
  const details = [
    {
      id: record.transaction_id,
      description: record.description,
      amount: Number(record.amount),
      payment_method: record.payment_method,
      category: record.category,
    },
  ];

  const columns = [
    { title: 'Diễn giải', dataIndex: 'description', key: 'description' },
    { title: 'Phương thức', dataIndex: 'payment_method', key: 'payment_method' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right', render: (v, r) => <span style={{ color: record.type === 'payment' ? 'red' : 'green', fontWeight: 500 }}>{v.toLocaleString('vi-VN')}</span> },
  ];

  return (
    <Card bordered className="mb-2">
      <Row gutter={[16, 8]}>
        <Col xs={24} md={8}>
          <Text type="secondary">Mã giao dịch</Text>
          <div className="font-medium">{record.transaction_code}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Thời gian</Text>
          <div className="font-medium">{record.created_at ? new Date(record.created_at).toLocaleString('vi-VN') : ''}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Loại giao dịch</Text>
          <div className="font-medium" style={{ color: record.type === 'payment' ? 'red' : 'green' }}>
            {record.type === 'payment' ? 'Chi' : record.type === 'receipt' ? 'Thu' : record.type}
          </div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Phương thức</Text>
          <div className="font-medium">{record.payment_method}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Danh mục</Text>
          <div className="font-medium">{record.category}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Số tiền</Text>
          <div className="font-medium" style={{ color: record.type === 'payment' ? 'red' : 'green' }}>{Number(record.amount).toLocaleString('vi-VN')}</div>
        </Col>
      </Row>
      <Divider />
      <Table columns={columns} dataSource={details} pagination={false} rowKey="id" size="small" />
    </Card>
  );
} 