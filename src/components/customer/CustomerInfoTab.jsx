import { Button } from "antd";
import formatPrice from "../../utils/formatPrice";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissionHelper";

const CustomerInfoTab = ({ setEditModalVisible, setDeleteModalVisible, setSelectedCustomer, customerData }) => {
  const permissions = useSelector(state => state.permission.permissions.permissions)
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2 col-span-2">
          <p>Tên khách hàng:</p>
          <p className="font-medium text-lg">{customerData.customer_name}</p>
        </div>
        <div>
          <p className="font-medium">Số điện thoại:</p>
          <p>{customerData.phone}</p>
        </div>
        <div>
          <p className="font-medium">Email:</p>
          <p>{customerData.email || "Chưa có"}</p>
        </div>
        <div>
          <p className="font-medium">Địa chỉ:</p>
          <p>{customerData.address || "Chưa có"}</p>
        </div>
        <div>
          <p className="font-medium">Tổng số đơn hàng:</p>
          <p>{customerData.total_orders}</p>
        </div>
        <div>
          <p className="font-medium">Tổng chi tiêu:</p>
          <p>{formatPrice(customerData.total_expenditure)}</p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        {hasPermission(permissions, 'customer.delete') &&
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedCustomer(customerData)
                setDeleteModalVisible(true)
              }}
              danger icon={<span>🗑️</span>}
            >
              Xóa
            </Button>
          </div>
        }
        {hasPermission(permissions, 'customer.update') &&
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedCustomer(customerData)
                setEditModalVisible(true)
              }}
              type="primary" icon={<span>✏️</span>}
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      </div>
    </div>
  );
};

export default CustomerInfoTab;
