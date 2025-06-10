import { Button } from "antd";

const CustomerInfoTab = ({ customerData }) => {
  console.log("🚀 ~ CustomerInfoTab ~ customerData:", customerData)
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Tên khách hàng:</p>
          <p>{customerData.customer_name}</p>
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
        <div>
          <p className="font-medium">Trạng thái:</p>
          <p>{customerData.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}</p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button danger icon={<span>🗑️</span>}>
            Xóa
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="primary" icon={<span>✏️</span>}>
            Chỉnh sửa
          </Button>
          <Button icon={<span>🖨️</span>}>
            In tem mã
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoTab;
