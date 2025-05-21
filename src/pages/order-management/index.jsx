import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Tooltip,
  Select,
  Typography,
  DatePicker,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import OrderDetailDrawer from "../../components/drawers/OrderDetailDrawer";
import { useNavigate } from "react-router-dom";
import orderService from "../../service/orderService";
import './index.css'

const { Title } = Typography;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAllOrder();
      setOrdersData(
        response.data.map((order) => ({
          ...order,
          key: order.order_id,
        }))
      );
    } catch (error) {
      useToastNotify("Không thể tải danh sách sản phẩm.", "error");
    }
  };
  const updateOrderStatus = async (orderId, order_status) => {
    const data = { order_status };
    try {
      await orderService.updateOrder(orderId, data);
      message.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders(); // reload lại danh sách
    } catch (error) {
      message.error("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter data based on search text and status
  const filteredData = (ordersData || []).filter(
    (item) =>
      (item.order_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.order_code?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.customer?.toLowerCase().includes(searchText.toLowerCase()))
  );
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // View order details
  const viewOrderDetails = (order) => {
    console.log(order)
    setSelectedOrder(order);
    setDetailDrawerVisible(true);
  };
  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      key: "order_code",
      sorter: (a, b) => a.order_code.localeCompare(b.order_code),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: customer => customer.customer_name,
      sorter: (a, b) => a.customer.customer_name.localeCompare(b.customer.customer_name),
    },
    {
      title: "Ngày giao",
      dataIndex: "order_date",
      key: "order_date",
      sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
      render: (date) => new Date(date).toLocaleDateString("vi-VN"), // hoặc định dạng tùy ý
      responsive: ["md"],
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total) => formatPrice(total),
      sorter: (a, b) => a.total_amount - b.total_amount,
      align: "right",
      responsive: ["md"],
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_amount",
      key: "discount_amount",
      render: (discount) => formatPrice(discount),
      sorter: (a, b) => a.discount_amount - b.discount_amount,
      align: "right",
      responsive: ["lg"],
    },
    {
      title: "Thành tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (final) => formatPrice(final),
      sorter: (a, b) => a.final_amount - b.final_amount,
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      key: "order_status",
      align: "center",
      render: (status, record) => {
        let color;
        switch (status) {
          case "Hoàn tất":
            color = "bg-green-400";
            break;
          case "Đang giao":
            color = "bg-blue-400";
            break;
          case "Đang đóng hàng":
            color = "bg-orange-400";
            break;
          case "Xác nhận":
            color = "bg-sky-400";
            break;
          case "Mới":
            color = "bg-gray-400";
            break;
          case "Huỷ đơn":
          case "Huỷ điều chỉnh":
            color = "bg-red-400";
            break;
          default:
            color = "bg-gray-400";
        }

        const statusOptions = [
          { value: "Mới", label: "Mới" },
          { value: "Xác nhận", label: "Xác nhận" },
          { value: "Đang đóng hàng", label: "Đang đóng hàng" },
          { value: "Đang giao", label: "Đang giao" },
          { value: "Hoàn tất", label: "Hoàn tất" },
          { value: "Huỷ đơn", label: "Huỷ đơn" },
          { value: "Huỷ điều chỉnh", label: "Huỷ điều chỉnh" },
        ];

        // Filter options based on current status
        const availableOptions = statusOptions.filter(option => {
          if (status === "Mới") return ["Xác nhận"].includes(option.value);
          if (status === "Xác nhận") return ["Đang đóng hàng", "Đang giao", "Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          if (status === "Đang đóng hàng") return ["Đang giao", "Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          if (status === "Đang giao") return ["Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          return false;
        });

        return (
          <Space direction="vertical">
            <Select
              size="small"
              style={{
                width: 150,
              }}
              className={`custom-select rounded px-2 py-1 ${color}`}
              placeholder="Chuyển trạng thái"
              options={availableOptions}
              value={status}
              onChange={(value) => updateOrderStatus(record.order_id, value)}
              disabled={status === "Hoàn tất" || status === "Huỷ đơn" || status === "Huỷ điều chỉnh"}
            />
          </Space>
        );
      },
      filters: [
        { text: "Mới", value: "Mới" },
        { text: "Xác nhận", value: "Xác nhận" },
        { text: "Đang đóng hàng", value: "Đang đóng hàng" },
        { text: "Đang giao", value: "Đang giao" },
        { text: "Hoàn tất", value: "Hoàn tất" },
        { text: "Huỷ đơn", value: "Huỷ đơn" },
        { text: "Huỷ điều chỉnh", value: "Huỷ điều chỉnh" },
      ],
      onFilter: (value, record) => record.order_status === value,
    },

    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => viewOrderDetails(record.order_id)}
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/edit-order/${record.order_id}`)}
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              size="small"
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              className="hover:bg-gray-100"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title
          level={2}
          className="text-xl md:text-2xl font-bold m-0 text-gray-800"
        >
          Quản lý đơn hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/create-order')}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Tạo đơn hàng
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: "pt-4",
          }}
          bordered={false}
          size="middle"
          className="custom-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderManagement;
