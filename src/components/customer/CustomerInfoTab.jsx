import { Button } from "antd";

const CustomerInfoTab = ({ setEditModalVisible, setDeleteModalVisible, setSelectedCustomer, customerData }) => {
  console.log("🚀 ~ CustomerInfoTab ~ customerData:", customerData)
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-end space-x-2 col-span-2">
          <p>Tên khách hàng:</p>
          <p className="font-medium text-2xl">{customerData.customer_name}</p>
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
          <p className="font-medium">Tổng số đơn hàng:</p>
          <p>{customerData.total_orders}</p>
        </div>
        <div>
          <p className="font-medium">Tổng chi tiêu:</p>
          <p>{customerData.total_expenditure?.toLocaleString()}₫</p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
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
      </div>
    </div>
  );
};

export default CustomerInfoTab;
