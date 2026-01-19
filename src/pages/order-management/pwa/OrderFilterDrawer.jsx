// OrderFilterDrawer.jsx
import { Drawer, DatePicker, Select, Button, Space } from "antd";
import { ClearOutlined } from "@ant-design/icons";

export default function OrderFilterDrawer({
  visible,
  onClose,
  filters,
  onDateChange,
  onClearFilters,
}) {
  return (
    <>
      <Drawer
        title="Lọc đơn hàng"
        placement="bottom"
        height="70vh"
        open={visible}
        onClose={onClose}
        className="rounded-t-2xl"
      >
        <div className="space-y-4">
          <DatePicker.RangePicker
            style={{ width: "100%" }}
            onChange={onDateChange}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          {/* Thêm các filter khác */}
          <Space className="w-full" direction="vertical">
            <Button type="primary" block onClick={onClose}>
              Áp dụng
            </Button>
            <Button block onClick={onClearFilters} icon={<ClearOutlined />}>
              Xóa bộ lọc
            </Button>
          </Space>
        </div>
      </Drawer>
    </>
  );
}
