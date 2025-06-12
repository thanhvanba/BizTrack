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

import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExpandedRowContent from "../../components/warehouse/ExpandedRowContent";

const { Title } = Typography;
const { Option } = Select;

const InventoryManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [inventories, setInventories] = useState([]);
  console.log("🚀 ~ InventoryManagement ~ inventories:", inventories)

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  console.log("🚀 ~ InventoryManagement ~ warehouses:", warehouses)

  const fetchInventories = async (warehouseId) => {
    try {
      const response = warehouseId
        ? await inventoryService.getInventoryByWarehouseId(warehouseId)
        : await inventoryService.getAllInventories();

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
    } catch (error) {
      console.error("Lỗi khi tải danh sách tồn kho:", error);
    }
  };

  const handleWarehouseChange = (warehouseId) => {
    console.log('change')
    fetchInventories(warehouseId);
  };
  useEffect(() => {
    dispatch(fetchWarehouses());
  }, []);

  useEffect(() => {
    if (warehouses.data?.length) {
      fetchInventories();
    }
  }, [warehouses]);

  const filteredData = inventories.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchText.toLowerCase())
  );
  console.log("🚀 ~ InventoryManagement ~ filteredData:", filteredData)

  const getStatusColor = (status) => {
    switch (status) {
      case "Đủ hàng":
        return "success";
      case "Sắp hết":
        return "warning";
      case "Hết hàng":
        return "error";
      default:
        return "default";
    }
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(filteredData.map((item) => item.key))
    } else {
      setSelectedRowKeys([])
    }
  }

  // Handle individual row checkbox
  const handleRowSelect = (key, checked) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, key])
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key))
    }
  }
  // Check if all rows are selected
  const isAllSelected = selectedRowKeys.length === filteredData.length && filteredData.length > 0

  // Check if some rows are selected (for indeterminate state)
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < filteredData.length

  const columns = [
    {
      key: "checkbox",
      title: (
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={isAllSelected}
          ref={(input) => {
            if (input) input.indeterminate = isIndeterminate
          }}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      dataIndex: "checkbox",
      width: 40,
      render: (_, record) => (
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e) => handleRowSelect(record.key, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
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
      sorter: (a, b) => a.product?.product_name.localeCompare(b.product?.product_name),
    },
    // {
    //   title: "Danh mục",
    //   dataIndex: ["product", "category", "category_name"],
    //   key: "category",
    //   filters: categoryFilters,
    //   onFilter: (value, record) =>
    //     record.product?.category?.category_name === value,
    //   render: (text) => (
    //     <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
    //       {text}
    //     </span>
    //   ),
    //   responsive: ["md"],
    // },
    {
      title: "Giá bán",
      dataIndex: ["product", "product_retail_price"],
      key: "price",
      render: (price) => formatPrice(price),
      sorter: (a, b) =>
        Number(a.product?.product_retail_price) -
        Number(b.product?.product_retail_price),
      align: "right",
      responsive: ["lg"],
    },
    {
      title: "Kho",
      dataIndex: ["warehouse", "warehouse_name"],
      key: "location",
      filters:
        warehouses.data?.map((w) => ({
          text: w.warehouse_name,
          value: w.warehouse_name,
        })) || [],
      onFilter: (value, record) =>
        record.warehouse?.warehouse_name === value,
      responsive: ["lg"],
    },
    {
      title: "Số lượng",
      dataIndex: ["quantity"],
      key: "quantity",
      sorter: (a, b) => a.product?.quantity - b.product?.quantity,
      align: "center",
    },
    {
      title: "Khách đặt",
      dataIndex: ["reserved_stock"],
      key: "reserved_stock",
      render: (val) => val ?? 0,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Khả dụng",
      dataIndex: ["available_stock"],
      key: "available_stock",
      sorter: (a, b) =>
        a.product?.available_stock - b.product?.available_stock,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (_, record) => {
        const qty = record.product?.available_stock ?? 0;
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
      filters: [
        { text: "Đủ hàng", value: "Đủ hàng" },
        { text: "Sắp hết", value: "Sắp hết" },
        { text: "Hết hàng", value: "Hết hàng" },
      ],
      onFilter: (value, record) => {
        const qty = record.product?.available_stock ?? 0;
        if (qty > 5 && value === "Đủ hàng") return true;
        if (qty > 0 && qty <= 5 && value === "Sắp hết") return true;
        if (qty <= 0 && value === "Hết hàng") return true;
        return false;
      },
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
        <div className="mb-4 grid grid-cols-3 gap-3 p-4 bg-white rounded-lg shadow-md">
          {/* Ô tìm kiếm */}
          <Input
            placeholder="Tìm kiếm sản phẩm, danh mục, vị trí..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="rounded-lg border-gray-300 focus:border-blue-500 col-span-2"
          />

          {/* Dropdown chọn kho hàng */}
          <Select
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

        {/* Selected items info */}
        {selectedRowKeys.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-center justify-between">
            <span className="text-blue-700">
              Đã chọn {selectedRowKeys.length} / {filteredData.length} mục
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                Thao tác hàng loạt
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                onClick={() => setSelectedRowKeys([])}
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            size: "small",
          }}
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
