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
import searchService from "../../service/searchService";
import { debounce } from "lodash";
import useToastNotify from "../../utils/useToastNotify";
import formatPrice from '../../utils/formatPrice'
import OptionsStatistics from "../../components/OptionsStatistics";
import dayjs from "dayjs";
import OrderStatusTabs from "../../components/order/OrderStatusTabs";
import orderDetailService from "../../service/orderDetailService";
import ExpandedOrderTabs from "../../components/order/ExpandedOrderTabs";

const { Title } = Typography;

const OrderManagement = () => {
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("-1");
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState([]);
  console.log("🚀 ~ OrderManagement ~ ordersData:", ordersData)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const currentDate = dayjs();
  const [selectedOptions, setSelectedOptions] = useState('init');
  const [selectedDate, setSelectedDate] = useState();

  const handleSelectOptions = (value) => {
    if (value !== selectedOptions) {
      setSelectedOptions(value);
      setSelectedDate(value === "range" ? null : currentDate);
    }
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(date);

    if (selectedOptions === "range") {
      console.log("Từ:", dateString[0], "Đến:", dateString[1]);
    } else if (selectedOptions === "quarter") {
      const [year, q] = dateString.split("-");
      const quarter = Number(q.replace("Q", ""));
      console.log("Quý:", quarter, "Năm:", year);
    } else if (selectedOptions === "month") {
      const [year, month] = dateString.split("-");
      console.log("Tháng:", month, "Năm:", year);
    } else {
      console.log(
        selectedOptions === "day"
          ? "Ngày:"
          : selectedOptions === "year"
            ? "Năm:"
            : "",
        dateString
      );
    }
  };

  const handleStatistic = () => {
    console.log("Thống kê theo:", selectedOptions);

    let params = {};

    if (selectedOptions === "range") {
      const [start, end] = selectedDate || [];
      if (start && end) {
        params.startDate = start.format("YYYY-MM-DD");
        params.endDate = end.format("YYYY-MM-DD");
        console.log("Từ ngày:", params.startDate, "đến ngày:", params.endDate);
      }
    } else if (selectedDate) {
      const date = selectedDate;

      const day = date.date();
      const month = date.month() + 1;
      const year = date.year();

      if (selectedOptions === "day") {
        params.day = day;
        params.month = month;
        params.year = year;
        console.log("Ngày:", day, "Tháng:", month, "Năm:", year);
      } else if (selectedOptions === "month") {
        params.month = month;
        params.year = year;
        console.log("Tháng:", month, "Năm:", year);
      } else if (selectedOptions === "quarter") {
        const quarter = Math.ceil((month) / 3);
        params.quarter = quarter;
        params.year = year;
        console.log("Quý:", quarter, "Năm:", year);
      } else if (selectedOptions === "year") {
        params.year = year;
        console.log("Năm:", year);
      }
    }

    // Gọi API
    fetchOrders({ page: 1, limit: pagination.pageSize, params });
  };

  const handleChangeTabs = async (order_status) => {
    setOrderStatus(order_status)
    const params = {};
    if (Number(order_status) !== -1) {
      params.order_status = order_status;
    }
    fetchOrders({
      page: 1,
      limit: pagination.pageSize,
      params,
    });
  };

  const fetchOrders = async ({ page = pagination.current, limit = pagination.pageSize, params = {} } = {}) => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrder({
        page,
        limit,
        ...params,
      });

      setOrdersData(response.data);

      if (response.pagination) {
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Không thể tải danh sách đơn hàng.", "error");
    } finally {
      setLoading(false);
    }
  };

  //HÀM XỬ LÝ CHUYỂN TRANG
  const handleTableChange = (newPagination) => {
    const params = {};
    if (Number(orderStatus) !== -1) {
      params.order_status = orderStatus;
    }
    fetchOrders({
      page: newPagination.current,
      limit: newPagination.pageSize,
      params,
    });
  };
  const handleSearch = debounce(async (value) => {
    if (!value) {
      fetchOrders(); // gọi lại toàn bộ đơn hàng
      return;
    }
    try {
      const response = await searchService.searchOrdersByPhone(value);
      const data = response.data || [];
      setOrdersData(data.map(order => ({ ...order, key: order.order_id })));
    } catch (error) {
      useToastNotify("Không thể tìm đơn hàng theo số điện thoại.", 'error');
    }
  }, 500);

  const handleUpdateOrderStatus = async (orderId, order_status) => {
    const data = { order_status };
    try {
      await orderService.updateOrder(orderId, data);
      message.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders(); // reload lại danh sách

      if (order_status === "Huỷ điều chỉnh") {
        const orderDetail = await orderDetailService.getOrderDetailById(orderId);

        const {
          order_id,
          order_code,
          order_date,
          warehouse_id,
          shipping_address,
          payment_method,
          note,
          shipping_fee,
          order_amount,
          final_amount,
          customer,
          products
        } = orderDetail;

        // config data newtab
        const newTab = {
          key: order_id,
          title: `Đơn hàng điều chỉnh của ${order_code}` || 'Đơn hàng',
          mode: 'create', // hoặc 'edit' nếu cần chỉnh sửa
          formKey: Date.now(),
          order: {
            warehouse_id,
            customer_id: customer.customer_id,
            shipping_address,
            order_date,
            payment_method,
            note: note || '',
            shipping_fee: Number(shipping_fee),
            order_amount: Number(order_amount),
            transfer_amount: Number(final_amount)
          },
          selectedProducts: products.map((p) => ({
            product_id: p.product_id,
            product_name: p.product_name,
            product_retail_price: p.price,
            quantity: p.quantity,
            discount: p.discount,
            total_quantity: 0,           // nếu không có thì mặc định
            available_quantity: 0,
            reserved_quantity: 0
          }))
        };
        // Lưu vào localStorage
        const existingTabs = JSON.parse(localStorage.getItem('orderTabs')) || [];
        const updatedTabs = [...existingTabs, newTab];
        localStorage.setItem('orderTabs', JSON.stringify(updatedTabs));

        const currentActive = parseInt(localStorage.getItem('activeOrderTab')) || 0;
        const currentCount = parseInt(localStorage.getItem('orderTabCount')) || 0;

        localStorage.setItem('activeOrderTab', String(currentActive + 1));
        localStorage.setItem('orderTabCount', String(currentCount + 1));

        // Chuyển sang trang tạo đơn và truyền dữ liệu thông qua state
        navigate("/create-order");
      }
    } catch (error) {
      message.error("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys([])
    } else {
      setExpandedRowKeys([key])
    }
  }

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
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      responsive: ["md"],
    },
    {
      title: "Tổng tiền hàng",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total) => formatPrice(total),
      sorter: (a, b) => a.total_amount - b.total_amount,
      align: "right",
      responsive: ["md"],
    },
    // {
    //   title: "Giảm giá",
    //   dataIndex: "discount_amount",
    //   key: "discount_amount",
    //   render: (discount) => formatPrice(discount),
    //   sorter: (a, b) => a.discount_amount - b.discount_amount,
    //   align: "right",
    //   responsive: ["lg"],
    // },
    {
      title: "Thành tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (final) => formatPrice(final),
      sorter: (a, b) => a.final_amount - b.final_amount,
      align: "right",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    // {
    //   title: "Chỉnh sửa gần nhất",
    //   dataIndex: "updated_at",
    //   key: "updated_at",
    //   sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
    //   render: (date) => new Date(date).toLocaleString("vi-VN"),
    //   align: "right",
    // },
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
            color = "bg-cyan-400";
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
          if (status === "Mới") return ["Xác nhận", "Huỷ đơn"].includes(option.value);
          if (status === "Xác nhận") return ["Đang đóng hàng", "Đang giao", "Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          if (status === "Đang đóng hàng") return ["Đang giao", "Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          if (status === "Đang giao") return ["Hoàn tất", "Huỷ đơn", "Huỷ điều chỉnh"].includes(option.value);
          return false;
        });

        return (
          <Space direction="vertical" onClick={(e) => e.stopPropagation()}>
            <Select
              size="small"
              style={{
                width: 150,
              }}
              className={`custom-select rounded-lg px-2 py-1 ${color}`}
              placeholder="Chuyển trạng thái"
              options={availableOptions}
              value={status}
              onChange={(value) => handleUpdateOrderStatus(record.order_id, value)}
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
          <div className="relative w-full">
            <Input
              placeholder="Tìm kiếm theo số điện thoại khách hàng"
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          <div className="w-full">
            <OptionsStatistics
              selectedOptions={selectedOptions}
              selectedDate={selectedDate}
              onSelectOptions={handleSelectOptions}
              onDateChange={handleDateChange}
              onStatistic={handleStatistic}
            />
          </div>
        </div>
        <OrderStatusTabs onChange={handleChangeTabs} />
        <Table
          loading={loading}
          columns={columns}
          rowKey='order_id'
          dataSource={ordersData}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                <ExpandedOrderTabs record={record} onUpdateOrderStatus={handleUpdateOrderStatus} />
              </div>
            ),
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? [record.order_id] : []);
            },
          }}
          onRow={(record) => ({
            onClick: () => toggleExpand(record.order_id),
            className: "cursor-pointer",
          })}
          rowClassName={(record) =>
            expandedRowKeys.includes(record.order_id)
              ? "border-x-2 border-t-2 border-blue-500 !border-collapse z-10 bg-blue-50 rounded-md shadow-sm"
              : "hover:bg-gray-50 transition-colors"
          }
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có đơn hàng nào" }}
        />
      </Card>
    </div>
  );
};

export default OrderManagement;
