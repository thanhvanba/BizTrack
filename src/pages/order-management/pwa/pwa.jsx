// PwaOrderManagement.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Select,
  Typography,
  DatePicker,
  List,
  Badge,
  Drawer,
  FloatButton,
  Popover,
  Skeleton,
  Divider,
  Empty,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  CalendarOutlined,
  DownOutlined,
  EyeOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

import { debounce } from "lodash";
import dayjs from "dayjs";
import OrderFilterDrawer from "./OrderFilterDrawer";
import OrderDetailSheet from "./OrderDetailSheet";
import orderService from "../../../service/orderService";
import searchService from "../../../service/searchService";
import useToastNotify from "../../../utils/useToastNotify";
import formatPrice from "../../../utils/formatPrice";
import LoadingLogo from "../../../components/LoadingLogo";

const { Title, Text } = Typography;

const PwaOrderManagement = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Data states
  const [ordersData, setOrdersData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({});

  // UI states
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailSheetVisible, setDetailSheetVisible] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState(false);

  // Status colors
  const statusColors = {
    Mới: "blue",
    "Xác nhận": "cyan",
    "Đang đóng hàng": "orange",
    "Đang giao": "purple",
    "Hoàn tất": "green",
    "Huỷ đơn": "red",
  };

  // Status icons
  const statusIcons = {
    Mới: <ClockCircleOutlined />,
    "Xác nhận": <CheckCircleOutlined />,
    "Đang đóng hàng": <ShoppingOutlined />,
    "Đang giao": <ClockCircleOutlined />,
    "Hoàn tất": <CheckCircleOutlined />,
    "Huỷ đơn": <CloseCircleOutlined />,
  };

  // Fetch orders with debounce
  const fetchOrders = async (params = {}) => {
    if (pullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await orderService.getAllOrder({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params,
      });

      setOrdersData(response.data);

      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          current: response.pagination.currentPage,
          total: response.pagination.total,
        }));
      }
    } catch (error) {
      useToastNotify("Không thể tải danh sách đơn hàng.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPullToRefresh(false);
    }
  };

  // Search with debounce
  const fetchSearch = useMemo(
    () =>
      debounce(async (value) => {
        if (!value) {
          fetchOrders(filters);
          return;
        }

        setLoading(true);
        try {
          const response = await searchService.searchOrders(
            value,
            1,
            pagination.pageSize,
          );
          setOrdersData(response.data || []);
          if (response.pagination) {
            setPagination((prev) => ({
              ...prev,
              current: 1,
              total: response.pagination.total,
            }));
          }
        } catch {
          useToastNotify("Không thể tìm kiếm.", "error");
        } finally {
          setLoading(false);
        }
      }, 500),
    [filters, pagination.pageSize],
  );

  // Handle search input
  const handleSearch = (value) => {
    setSearchText(value);
    setOrderStatus("-1"); // Reset to "all" (numeric key)
    fetchSearch(value);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setOrderStatus(status);
    setSearchText("");

    let newFilters = {};

    if (status !== "all") {
      newFilters = { order_status: status }; // ← Reset filters, chỉ giữ order_status
    }
    // Nếu "all", newFilters = {} (reset tất cả)

    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 })); // ← Reset về trang 1
    fetchOrders(newFilters);
  };

  // Handle date filter
  const handleDateFilter = (date) => {
    setSelectedDate(date);
    setOrderStatus("-1"); // Reset to "all" (numeric key)
    setSearchText(""); // Reset search
    
    if (date) {
      const newFilters = {
        day: date.date(),
        month: date.month() + 1,
        year: date.year(),
      };
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchOrders(newFilters);
    } else {
      setFilters({});
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchOrders({});
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setOrderStatus("-1"); // Reset to "all" (numeric key)
    setSelectedDate(null);
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders({});
  };

  // Load more (infinite scroll)
  const loadMore = () => {
    if (
      !loading &&
      pagination.current * pagination.pageSize < pagination.total
    ) {
      const nextPage = pagination.current + 1;
      setPagination((prev) => ({ ...prev, current: nextPage }));

      let params = { ...filters };

      // Thêm order_status nếu không phải "-1" (all)
      if (orderStatus !== "-1") {
        params.order_status = orderStatus;
      }

      orderService
        .getAllOrder({
          page: nextPage,
          limit: pagination.pageSize,
          ...params,
        })
        .then((response) => {
          setOrdersData((prev) => [...prev, ...response.data]);
          if (response.pagination) {
            setPagination((prev) => ({
              ...prev,
              total: response.pagination.total,
            }));
          }
        })
        .catch(() => {
          useToastNotify("Không thể tải thêm đơn hàng.", "error");
        });
    }
  };

  // Handle pull to refresh
  const handleRefresh = () => {
    setPullToRefresh(true);
    fetchOrders(filters);
  };

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setDetailSheetVisible(true);
  };

  // Handle create order
  const handleCreateOrder = () => {
    navigate("/create-order");
  };

  // Status filter chips (numeric keys aligned với web version)
  const statusFilters = [
    { key: "-1", label: "Tất cả", count: pagination.total },
    { key: "0", label: "Mới", color: "blue" },
    { key: "1", label: "Xác nhận", color: "cyan" },
    { key: "2", label: "Đóng hàng", color: "orange" },
    { key: "3", label: "Đang giao", color: "purple" },
    { key: "4", label: "Hoàn tất", color: "green" },
  ];

  // Initial load
  useEffect(() => {
    fetchOrders({});
  }, []);

  return (
    <div className="pwa-order-management">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
              className="flex-1 rounded-xl bg-gray-50 border-0 shadow-sm"
            />
            <Button
              type="text"
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              className="text-gray-600"
              size="large"
            />
          </div>
        </div>

        {/* Quick Status Filter */}
        <div className="px-3 pb-2 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 min-w-max">
            {statusFilters.map((filter) => (
              <Button
                key={filter.key}
                size="small"
                shape="round"
                onClick={() => handleStatusFilter(filter.key)}
                className={`whitespace-nowrap ${
                  orderStatus === filter.key
                    ? `bg-${filter.color || "blue"}-100 text-${filter.color || "blue"}-600 border-${filter.color || "blue"}-300`
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {filter.label}
                {filter.count && filter.key === "-1" && (
                  <Badge count={filter.count} style={{ marginLeft: 4 }} />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-3">
        {loading && !refreshing && ordersData.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        ) : ordersData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có đơn hàng nào"
            className="py-8"
          >
            <Button type="primary" onClick={handleCreateOrder}>
              Tạo đơn hàng đầu tiên
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={ordersData}
            renderItem={(order) => (
              <Card
                className="mb-3 border-0 shadow-sm active:scale-[0.99] transition-transform rounded-xl"
                onClick={() => handleOrderClick(order)}
                hoverable={false}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong className="text-base">
                          #{order.order_code}
                        </Text>
                        <Tag
                          icon={statusIcons[order.order_status]}
                          color={statusColors[order.order_status]}
                          className="m-0"
                        >
                          {order.order_status}
                        </Tag>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserOutlined />
                        <span>
                          {order.customer?.customer_name || "Khách lẻ"}
                        </span>
                        {order.customer?.phone && (
                          <>
                            <Divider type="vertical" />
                            <PhoneOutlined />
                            <span>{order.customer.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show action menu
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Text type="secondary" className="text-xs">
                        Ngày tạo
                      </Text>
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        <Text className="text-sm">
                          {dayjs(order.created_at).format("DD/MM/YYYY")}
                        </Text>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Text type="secondary" className="text-xs">
                        Ngày giao
                      </Text>
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        <Text className="text-sm">
                          {order.order_date
                            ? dayjs(order.order_date).format("DD/MM/YYYY")
                            : "Chưa có"}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <Text type="secondary" className="text-xs">
                        Thành tiền
                      </Text>
                      <div>
                        <Text strong className="text-lg text-blue-600">
                          {formatPrice(order.final_amount || 0)}
                        </Text>
                      </div>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.order_id}`);
                      }}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            loadMore={
              !loading &&
              pagination.current * pagination.pageSize < pagination.total ? (
                <div className="text-center py-4">
                  <Button type="link" onClick={loadMore}>
                    Tải thêm
                  </Button>
                </div>
              ) : null
            }
          />
        )}
      </div>

      {/* Filter Drawer */}
      <OrderFilterDrawer
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        filters={filters}
        selectedDate={selectedDate}
        onDateChange={handleDateFilter}
        onClearFilters={clearFilters}
      />

      {/* Order Detail Bottom Sheet */}
      <OrderDetailSheet
        visible={detailSheetVisible}
        order={selectedOrder}
        onClose={() => setDetailSheetVisible(false)}
        onUpdateOrder={() => {
          setDetailSheetVisible(false);
          fetchOrders(filters);
        }}
      />

      {/* Create Order FAB */}
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreateOrder}
        tooltip="Tạo đơn mới"
        style={{ right: 16, bottom: 80 }}
      />

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-16 left-0 right-0 flex justify-center z-20">
          <div className="bg-white shadow-md rounded-full px-4 py-2">
            <LoadingLogo size={20} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PwaOrderManagement;
