import { Tabs } from 'antd';
import CashBookDetail from './CashBookDetail';
import { hasPermission } from '../../utils/permissionHelper';
import { useSelector } from 'react-redux';

export default function CashBookExpandedTabs({ record, onEdit, onDelete, onRefresh }) {
  const permissions = useSelector(state => state.permission.permissions.permissions)
  const tabItems = ([
    hasPermission(permissions, 'cashbook.readById') && {
      key: 'info',
      label: 'Thông tin',
      children: <CashBookDetail record={record} onEdit={onEdit} onDelete={onDelete} onRefresh={onRefresh} />,
    },
  ]).filter(Boolean);
  return (
    <div className="bg-white p-2 sm:p-4 lg:p-6 py-2 sm:py-4 rounded-md shadow-sm">
      <Tabs items={tabItems} className="mb-2 sm:mb-4 lg:mb-6" />
    </div>
  );
} 