import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import inventoryService from "../../service/inventoryService";
import productService from "../../service/productService";

import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const InventoryManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [inventories, setInventories] = useState([]);
  console.log("🚀 ~ InventoryManagement ~ inventories:", inventories)
  const [products, setProducts] = useState([]);

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const warehouses = useSelector((state) => state.warehouse.warehouses);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Không thể tải danh sách sản phẩm.");
    }
  };

  const fetchInventories = async () => {
    try {
      const response = await inventoryService.getAllInventories();
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
          available_stock: available_stock,
          reserved_stock: item.product?.reserved_stock,
          quantity: item.product?.quantity,
        };
      });
      console.log("🚀 ~ enrichedData ~ enrichedData:", enrichedData)
      setInventories(enrichedData);
    } catch (error) {
      console.error("Không thể tải danh sách tồn kho.");
    }
  };

  useEffect(() => {
    dispatch(fetchWarehouses());
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length && warehouses.data?.length) {
      fetchInventories();
    }
  }, [products, warehouses]);

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
  const categoryFilters = Array.from(
    new Set(products.map((p) => p.category_name))
  )
    .filter(Boolean)
    .map((cat) => ({ text: cat, value: cat }));

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: categoryFilters,
      onFilter: (value, record) => record.category === value,
      render: (text) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {text}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      responsive: ["lg"],
      filters: warehouses.data?.map(w => ({
        text: w.warehouse_name,
        value: w.warehouse_name
      })) || [],
      onFilter: (value, record) => record.location === value,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      align: "center",
    },
    {
      title: "Khả dụng",
      dataIndex: "available_stock",
      key: "available_stock",
      sorter: (a, b) => a.available_stock - b.available_stock,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        return <Tag color={getStatusColor(status)}>{status}</Tag>;
      },
      filters: [
        { text: "Đủ hàng", value: "Đủ hàng" },
        { text: "Sắp hết", value: "Sắp hết" },
        { text: "Hết hàng", value: "Hết hàng" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

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
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm, danh mục, vị trí..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="rounded-lg"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            size: "small",
          }}
          scroll={{ x: "max-content" }}
          rowClassName="hover:bg-gray-50"
          locale={{ emptyText: "Không có sản phẩm nào" }}
        />
      </Card>
    </div >
  );
};

export default InventoryManagement;
