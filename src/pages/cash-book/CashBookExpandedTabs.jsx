import { Tabs } from 'antd';
import CashBookDetail from './CashBookDetail';

export default function CashBookExpandedTabs({ record }) {
  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: <CashBookDetail record={record} />,
    },
    // Có thể thêm các tab khác nếu cần
  ];
  return (
    <div className="bg-white p-6 py-4 rounded-md shadow-sm">
      <Tabs items={tabItems} className="mb-6" />
    </div>
  );
} 