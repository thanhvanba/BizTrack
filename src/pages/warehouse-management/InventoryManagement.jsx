import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  Image,
  Tabs,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import formatPrice from '../../utils/formatPrice'
import inventoryService from "../../service/inventoryService";
import productService from "../../service/productService";
import { debounce } from "lodash";
import searchService from "../../service/searchService";

import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExpandedRowContent from "../../components/warehouse/ExpandedRowContent";
import LoadingLogo from "../../components/LoadingLogo";

const { Title } = Typography;
const { Option } = Select;

const InventoryManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  console.log("🚀 ~ InventoryManagement ~ inventories:", inventories)

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  console.log("🚀 ~ InventoryManagement ~ warehouses:", warehouses)

  const fetchInventories = async (warehouseId, page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const response = warehouseId
        ? await inventoryService.getInventoryByWarehouseId(warehouseId, { page, limit: pageSize })
        : await inventoryService.getAllInventories({ page, limit: pageSize });

      const enrichedData = response.data.map((item) => {
        const available_stock = item.product?.available_stock;

        let status = "Sắp hết";
        if (available_stock > 5) status = "Đủ hàng";
        else if (available_stock <= 0) status = "Hết hàng";

        return {
          ...item,
          key: item.inventory_id,
          name: item.product?.product_name || "Không rõ",
          category: item.product?.category?.category_name || "Không rõ",
          location: item.warehouse?.warehouse_name || "Không rõ",
          status,
          available_stock: item.product?.available_stock || item?.product?.available_quantity,
          reserved_stock: item.product?.reserved_stock || item?.product?.reserved_quantity,
          quantity: item.product?.quantity || item?.product?.total_quantity,
        };
      });

      console.log("🚀 ~ enrichedData:", enrichedData);
      setInventories(enrichedData);
      // Cập nhật pagination nếu có
      if (response.pagination) {
        setPagination({
          current: response.pagination.currentPage || response.pagination.page,
          pageSize: response.pagination.pageSize, // Đúng key pageSize
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tồn kho:", error);
    } finally {
      setLoading(false)
    }

  };

  const handleWarehouseChange = (warehouseId) => {
    setSelectedWarehouseId(warehouseId);
    fetchInventories(warehouseId, 1, pagination.pageSize);
    setPagination((prev) => ({ ...prev, current: 1 })); // reset về trang 1 khi đổi kho
  };

  // Debounced search handler
  const handleSearch = debounce(async (value, page = 1, pageSize = 5) => {
    if (!value) {
      setIsSearching(false);
      setSearchText("");
      fetchInventories(selectedWarehouseId, 1, pagination.pageSize);
      return;
    }
    setIsSearching(true);
    setSearchText(value);
    setLoading(true);
    try {
      const response = await searchService.searchInventory(value, page, pageSize);
      const enrichedData = response.data.map((item) => {
        const available_stock = item.product?.available_stock;
        let status = "Sắp hết";
        if (available_stock > 5) status = "Đủ hàng";
        else if (available_stock <= 0) status = "Hết hàng";
        return {
          ...item,
          key: item.inventory_id,
          name: item.product?.product_name || "Không rõ",
          category: item.product?.category?.category_name || "Không rõ",
          location: item.warehouse?.warehouse_name || "Không rõ",
          status,
          available_stock: item.product?.available_stock || item?.product?.available_quantity,
          reserved_stock: item.product?.reserved_stock || item?.product?.reserved_quantity,
          quantity: item.product?.quantity || item?.product?.total_quantity,
        };
      });
      setInventories(enrichedData);
      if (response.pagination) {
        setSearchPagination({
          current: response.pagination.currentPage || response.pagination.page,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      setInventories([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    if (isSearching) {
      handleSearch(searchText, current, pageSize);
      setSearchPagination((prev) => ({ ...prev, current, pageSize }));
    } else {
      setPagination((prev) => ({ ...prev, current, pageSize }));
      fetchInventories(selectedWarehouseId, current, pageSize);
    }
  };

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, []);

  useEffect(() => {
    if (warehouses.data?.length) {
      fetchInventories();
    } else {
      setLoading(false); // Thêm dòng này để dừng loading nếu không có warehouse
    }
  }, [warehouses]);

  const filteredData = inventories.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchText.toLowerCase())
  );
  console.log("🚀 ~ InventoryManagement ~ filteredData:", filteredData)

  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: ["product", "product_name"],
      key: "product_name",
      render: (text, record) => (
        <div className="flex items-center">
          <Image
            src={record.product.product_image || "/placeholder.svg"}
            alt={text}
            width={30}
            height={30}
            className="object-cover rounded"
            preview={false}
          />
          <div className="ml-3">
            <div className="font-medium">{text}</div>
            <div className="text-gray-500 text-xs">{record.product?.product_barcode}</div>
            <div className="text-gray-500 text-xs">{record.product?.sku}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["product", "category", "category_name"],
      key: "category",
      render: (text) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {text}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: "Kho",
      dataIndex: ["warehouse", "warehouse_name"],
      key: "location",
      responsive: ["lg"],
    },
    {
      title: "Giá bán",
      dataIndex: ["product", "product_retail_price"],
      key: "price",
      align: "right",
      render: (price) => formatPrice(price),
      responsive: ["lg"],
    },
    {
      title: "Giá vốn",
      dataIndex: ["product", "cost_price"],
      key: "cost_price",
      align: "right",
      render: (cost_price) => formatPrice(cost_price),
      responsive: ["lg"],
    },
    {
      title: "Số lượng",
      dataIndex: ["quantity"],
      key: "quantity",
      align: "right",
    },
    {
      title: "Khách đặt",
      dataIndex: ["reserved_stock"],
      key: "reserved_stock",
      render: (val) => val ?? 0,
      align: "right",
      responsive: ["lg"],
    },
    {
      title: "Khả dụng",
      dataIndex: ["available_stock"],
      key: "available_stock",
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (_, record) => {
        const qty = record.product?.available_stock || record.product?.available_quantity || 0;
        let text = "Hết hàng";
        let color = "red";
        if (qty > 5) {
          text = "Đủ hàng";
          color = "green";
        } else if (qty > 0) {
          text = "Sắp hết";
          color = "orange";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
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
  ];


  const toggleExpand = (key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys([])
    } else {
      setExpandedRowKeys([key])
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title
          level={2}
          className="text-xl md:text-2xl font-bold m-0 text-gray-800"
        >
          Quản lý tồn kho
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/purchase?tab=form')}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all"
        >
          Nhập thêm sản phẩm
        </Button>
      </div>

      <Card className="rounded-xl shadow-md" bodyStyle={{ padding: "16px" }}>
        <div className="mb-4 grid grid-cols-3 gap-3 bg-white rounded-lg">
          {/* Ô tìm kiếm */}
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="rounded-lg border-gray-300 focus:border-blue-500 col-span-2"
          />

          {/* Dropdown chọn kho hàng */}
          <Select
            defaultValue=""
            placeholder="Chọn kho hàng"
            onChange={handleWarehouseChange}
            className="rounded-lg w-full border-gray-300 focus:border-blue-500"
          >
            <Option key="all" value="">
              📦 Tất cả kho hàng
            </Option>
            {warehouses?.data?.map((warehouse) => (
              <Option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                🏢 {warehouse.warehouse_name}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
          columns={columns}
          dataSource={inventories}
          pagination={{
            current: isSearching ? searchPagination.current : pagination.current,
            pageSize: isSearching ? searchPagination.pageSize : pagination.pageSize,
            total: isSearching ? searchPagination.total : pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          onChange={handleTableChange}
          // size="small"
          expandable={{
            expandedRowRender: (record) => (
              <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                <ExpandedRowContent record={record} />
              </div>
            ),
            expandedRowKeys: expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([record.key])
              } else {
                setExpandedRowKeys([])
              }
            },
          }}
          onRow={(record) => ({
            onClick: () => {
              toggleExpand(record.key)
            },
            className: "cursor-pointer",
          })}
          scroll={{ x: "max-content" }}
          rowClassName={(record) => {
            return expandedRowKeys.includes(record.key)
              ? "border-x-2 border-t-2 border-blue-500 bg-blue-50 rounded-md shadow-sm"
              : "hover:bg-gray-50";
          }}
          locale={{ emptyText: "Không có sản phẩm nào" }}
        />
      </Card>
    </div >
  );
};

export default InventoryManagement;
