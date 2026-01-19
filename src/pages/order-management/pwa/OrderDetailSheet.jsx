// OrderDetailSheet.jsx
import { Drawer, Descriptions, Button, Tag, Space, Typography } from "antd";
import formatPrice from "../../../utils/formatPrice";

export default function OrderDetailSheet({ visible, order, onClose, onUpdateOrder }) {
  return (
   <>
     <Drawer
    placement="bottom"
    height="85vh"
    open={visible}
    onClose={onClose}
    title={`Đơn hàng #${order?.order_code}`}
    className="rounded-t-2xl"
    extra={
      <Button type="primary" size="small">
        In đơn
      </Button>
    }
  >
    {order && (
      <div className="space-y-4">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Khách hàng">
            {order.customer?.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {order.customer?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Thành tiền">
            <Typography.Text strong>
              {formatPrice(order.final_amount)}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>
        {/* Thêm chi tiết sản phẩm */}
      </div>
    )}
  </Drawer>
   </>
  )
}
