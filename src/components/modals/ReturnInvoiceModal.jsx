import { Modal, Table, Button, Input, DatePicker, Pagination } from "antd";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useToastNotify from "../../utils/useToastNotify";
import orderService from "../../service/orderService";
import formatPrice from "../../utils/formatPrice";
import invoiceService from "../../service/invoiceService";
import LoadingLogo from "../LoadingLogo";

const { RangePicker } = DatePicker;

const ReturnInvoiceModal = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ordersData, setOrdersData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const fetchUnpaidInvoices = async ({ page = pagination.current, limit = pagination.pageSize } = {}) => {
    setLoading(true);
    try {
      const response = await invoiceService.getUnpaidInvoices({
        page,
        limit,
      });

      setOrdersData(
        response?.data.map((order) => ({
          ...order,
          key: order.order_id,
        }))
      );

      if (response.pagination) {
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Không thể tải danh sách đơn hàng chưa thanh toán.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    const params = {};
    fetchUnpaidInvoices({
      page: newPagination.current,
      limit: newPagination.pageSize,
      params,
    });
  };
  useEffect(() => {
    fetchUnpaidInvoices();
  }, [])

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoice_code",
      key: "invoice_code",
      render: (text) => (
        <span className="text-blue-600 cursor-pointer hover:underline">{text}</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "customer_name"],
      key: "customer_name",
    },
    {
      title: "Tổng cộng",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (value) => formatPrice(value),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button type="default" onClick={() => onSelect(record)}>
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Chọn hóa đơn trả hàng"
      open={visible}
      onCancel={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="primary" className="bg-blue-500" onClick={onClose}>
            Trả nhanh
          </Button>
        </div>
      }
      width={1100}
    >
      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="w-1/4 space-y-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-semibold mb-2">Tìm kiếm</p>
            <Input placeholder="Theo mã hóa đơn" prefix={<SearchOutlined />} className="mb-2" />
            <Input placeholder="Theo khách hàng hoặc ĐT" prefix={<SearchOutlined />} className="mb-2" />
            <Input placeholder="Theo Serial/IMEI" prefix={<SearchOutlined />} className="mb-2" />
            <Input placeholder="Theo mã hàng" prefix={<SearchOutlined />} className="mb-2" />
            <Input placeholder="Theo tên hàng" prefix={<SearchOutlined />} />
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-semibold mb-2">Thời gian</p>
            <RangePicker
              format="DD/MM/YYYY"
              className="w-full"
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-3/4">
          <Table
            columns={columns}
            loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
            dataSource={ordersData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
            rowKey="key"
            size="small"
          />
          {/* <div className="flex justify-between mt-4 items-center">
            <span className="text-sm text-gray-600">
              Hiển thị {1 + (currentPage - 1) * 7} - {Math.min(currentPage * 7, data.length)} trên tổng số {data.length} hóa đơn
            </span>
            <Pagination
              current={currentPage}
              total={data.length}
              pageSize={7}
              onChange={(page) => setCurrentPage(page)}
            // showSizeChanger={false}
            />
          </div> */}
        </div>
      </div>
    </Modal>
  );
};

export default ReturnInvoiceModal;
