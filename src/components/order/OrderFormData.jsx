import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Table,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import CustomerModal from "../../components/modals/CustomerModal";
import customerService from "../../service/customerService";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import inventoryService from "../../service/inventoryService";
import orderService from "../../service/orderService";
import ShippingAddressForm from "../../components/ShippingAddressForm";
import orderDetailService from "../../service/orderDetailService";
import dayjs from "dayjs";
import calculateRefund from "../../utils/calculateRefund";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

const OrderFormData = ({
  mode = "create",
  order: orderProp,
  selectedProducts: selectedProductsProps,
  onSave,
  onChange,
}) => {
  const { orderId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderEligibility, setOrderEligibility] = useState(null);
  console.log("🚀 ~ OrderFormData ~ orderEligibility:", orderEligibility);

  const [form] = Form.useForm();
  const [returnOrderData, setReturnOrderData] = useState({
    customer_id: "",
    order_id: "",
    type: "customer_return",
    shipping_fee: "",
    order_amount: "",
    note: "Không có ghi chú",
    return_details: [],
  });

  const [loading, setLoading] = useState(mode === "edit");
  const [formLoading, setFormLoading] = useState(false);

  const dispatch = useDispatch();
  const warehouses = useSelector(
    (state) => state.warehouse.warehouses.data || []
  );
  const { mobileView, collapsed } = useOutletContext();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [discountTypes, setDiscountTypes] = useState({});

  const [selectedProducts, setSelectedProducts] = useState(
    selectedProductsProps || []
  );
  const [shippingFee, setShippingFee] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [orderDetailSummary, setOrderDetailSummary] = useState(null);
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Chỉ gọi fetchWarehouses nếu chưa có trong store
  useEffect(() => {
    fetchCustomers();
    dispatch(fetchWarehouses());

    if (mode !== "create" && orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Call api
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAllCustomers();
      if (res && res.data) {
        setCustomers(res.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchInventoryByWarehouseId = async (warehouseId) => {
    const res = await inventoryService.getInventoryByWarehouseId(warehouseId);
    if (res && res.data) {
      setProducts(res.data);
    }
  };
  const handleCreateCustomer = async (data) => {
    try {
      const res = await customerService.createCustomer(data);
      setCustomers([...customers, res?.data]);
      setCreateModalVisible(false);
      // useToastNotify(
      //     `Khách hàng "${data.customer_name}" đã được thêm thành công!`,
      //     "success"
      // );
    } catch (error) {
      // useToastNotify("Thêm khách hàng không thành công.", "error");
    }
  };
  // Sử dụng cho edit và return order
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const resOrderEligibility = await orderService.checkOrderEligibility(
        orderId
      );

      if (resOrderEligibility && resOrderEligibility.data) {
        setOrderEligibility(resOrderEligibility.data);
      }
      const orderRes = await orderDetailService.getOrderDetailById(orderId);
      // const orderDetailSummary = await orderDetailService.getOrderDetailSummaryById(orderId);
      // console.log("🚀 ~ fetchOrderDetails ~ orderDetailSummary:", orderDetailSummary)
      if (orderRes) {
        setOrder(orderRes);

        // Format order details for selected products
        const formattedProducts = orderRes.products.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: item.product_name,
          product_retail_price: Number(item.price),
          discount: item.discountAmount || item.discount || 0,
        }));

        {
          mode === "return" &&
            setReturnOrderData({
              ...returnOrderData,
              customer_id: orderRes.customer.customer_id,
              order_id: orderId,
              type: "customer_return",
              order_amount: Number(form?.getFieldValue("order_amount")) || 0,
            });
        }
        setSelectedProducts(formattedProducts);
        setShippingFee(orderRes.shipping_fee || 0);
        setOrderDiscount(orderRes.order_amount || 0);
        setTransferAmount(orderRes.amount_paid || 0);

        // Set form values
        form.setFieldsValue({
          customer_id: orderRes.customer.customer_id,
          order_date: dayjs(orderRes.order_date),
          shipping_fee: orderRes.shipping_fee ?? 0,
          order_amount: orderRes.order_amount ?? 0,
          amount_paid: orderRes.amount_paid ?? 0,
          payment_method: orderRes.payment_method,
          note: orderRes.note,
          warehouse_id: orderRes.warehouse_id,
          shipping_address: orderRes.shipping_address,
        });

        // Fetch products for the warehouse
        fetchInventoryByWarehouseId(orderRes.warehouse_id);
      }
      const orderReturn = await orderService.getReturns({ order_id: orderId });
      setOrderDetailSummary(orderReturn);
      console.log("🚀 ~ fetchOrderDetails ~ orderReturn:", orderReturn);
    } catch (error) {
      // useToastNotify("Không thể tải thông tin đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrderReturn = async () => {
    const data = {
      ...returnOrderData,
      note: returnOrderData.note?.trim() || "Không có ghi chú",
      return_details: orderEligibility?.products
        .filter((item) => item.quantity_return > 0)
        .map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity_return,
          discount: item.discount,
          refund_amount: item.product_return_price ?? item.product_retail_price,
        })),
    };
    try {
      await orderService.createReturn(data);
      navigate("/return-order");
    } catch (error) {
      console.error("Lỗi tạo đơn trả hàng:", error);
    }
  };

  // Sử dụng cho tạo nhiều đơn hàng
  useEffect(() => {
    if (orderProp) {
      form.setFieldsValue({
        customer_id: orderProp?.customer_id,
        order_date: dayjs(orderProp?.order_date),
        shipping_fee: orderProp?.shipping_fee ?? 0,
        order_amount: orderProp?.order_amount ?? 0,
        amount_paid: orderProp?.amount_paid ?? 0,
        payment_method: orderProp?.payment_method,
        note: orderProp?.note,
        warehouse_id: orderProp?.warehouse_id,
        shipping_address: orderProp?.shipping_address,
      });
    }
  }, [orderProp]);

  useEffect(() => {
    fetchInventoryByWarehouseId(orderProp?.warehouse_id);
  }, [orderProp?.warehouse_id]);

  //   useEffect(() => {
  //     if (!order || !orderEligibility?.products) return;
  //     let productPriceMap = {};
  //     let productDiscountMap = {};
  //     for (const p of order?.products || []) {
  //       productPriceMap[p.product_id] = p.price;
  //       productDiscountMap[p.product_id] = p.discount || 0;
  //     }
  //     const refund = calculateRefund(
  //       order,
  //       orderEligibility.products,
  //       productPriceMap,
  //       productDiscountMap,
  //       orderDetailSummary
  //     );
  //     setRefundAmount(refund);
  //   }, [order, orderEligibility?.products, orderDetailSummary]);

  useEffect(() => {
    if (!order || !orderEligibility?.products) return;

    let productPriceMap = {};
    let productDiscountMap = {};

    for (const p of order?.products || []) {
      productPriceMap[p.product_id] = p.price;
      productDiscountMap[p.product_id] = p.discount || 0;
    }

    // Tính tổng số tiền đã hoàn trước đó
    const totalRefundedSoFar =
      orderDetailSummary?.data
        ?.filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + r.total_refund, 0) || 0;

    const refund = calculateRefund(
      order,
      orderEligibility.products,
      totalRefundedSoFar
    );
    setRefundAmount(refund);
  }, [order, orderEligibility?.products, orderDetailSummary]);

  console.log("🚀 ~ OrderFormData ~ refundAmount:", refundAmount)


  const handleValuesChange = (_, allValues) => {
    onChange?.(allValues, selectedProducts);
  };
  useEffect(() => {
    if (selectedProducts.length !== 0) {
      onChange?.(form.getFieldsValue(), selectedProducts);
    }
  }, [selectedProducts]);

  const handleSubmitOrder = async () => {
    try {
      setFormLoading(true);
      const values = await form.validateFields();
      const formattedOrderDate = dayjs(values.order_date).format("YYYY-MM-DD");

      const orderDetails = selectedProducts.map((item) => ({
        product_id: item?.product_id,
        quantity: item.quantity,
        price: Number(item?.product_retail_price),
        discount: item?.discountAmount || item?.discount || 0,
      }));

      const rqOrder = {
        order: {
          customer_id: values.customer_id,
          order_date: formattedOrderDate,
          order_amount: values.order_amount ?? 0,
          shipping_address: values.shipping_address,
          shipping_fee: values.shipping_fee ?? 0,
          amount_paid: values.amount_paid ?? 0,
          payment_method: values.payment_method,
          note: values.note,
          warehouse_id: values.warehouse_id,
        },
        orderDetails: orderDetails,
      };

      let res;
      if (mode === "create") {
        res = await orderService.createOrderWithDetails(rqOrder);
      } else {
        res = await orderService.updateOrderWithDetail(orderId, rqOrder);
        navigate("/orders");
      }

      if (onSave) {
        onSave(res);
      }

      if (res) {
        // useToastNotify(
        //     `Đơn hàng đã được ${mode === "create" ? "thêm" : "cập nhật"
        //     } thành công!`,
        //     "success"
        // );
        // navigate("/orders");
      }
    } catch (error) {
      // useToastNotify(
      //     `${mode === "create" ? "Thêm" : "Cập nhật"} đơn hàng không thành công.`,
      //     "error"
      // );
    } finally {
      setFormLoading(false);
    }
  };

  // xử lý form
  const filteredProducts = products.filter((product) =>
    product?.product?.product_name
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const calculateTotalAmount = () => {
    const sourceData =
      mode === "return" ? orderEligibility?.products ?? [] : selectedProducts;
    return sourceData.reduce((sum, item) => {
      const quantity =
        mode === "return" ? item.quantity_return ?? 0 : item.quantity ?? 0;
      return (
        sum +
        (item.product_return_price !== undefined
          ? item.product_return_price
          : item.product_retail_price) *
          quantity
      );
    }, 0);
  };

  const calculateDiscountAmount = () => {
    const sourceData =
      mode === "return" ? orderEligibility?.products ?? [] : selectedProducts;
    const discountProduct = sourceData.reduce(
      (sum, item) => sum + (item?.discountAmount || item?.discount || 0),
      0
    );
    return (
      discountProduct +
      parseFloat(
        mode === "return" ? returnOrderData.order_amount : orderDiscount
      )
    );
  };

  const calculateFinalAmount = () => {
    return (
      Number(calculateTotalAmount()) -
      Number(calculateDiscountAmount()) +
      Number(mode === "return" ? returnOrderData.shipping_fee : shippingFee)
    );
  };
  const addProduct = (inventory) => {
    const product = inventory?.product;
    const productId = product?.product_id;

    const existingProduct = selectedProducts.find(
      (item) => item.product_id === productId
    );

    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          discount: 0,
          discountAmount: 0,
        },
      ]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter((item) => item.product_id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity > 0) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  const updateQuantityReturn = (productId, quantity_return) => {
    if (quantity_return >= 0) {
      setOrderEligibility((prev) => ({
        ...prev,
        products: prev.products.map((item) =>
          item.product_id === productId ? { ...item, quantity_return } : item
        ),
      }));
    }
  };

  const updatePrice = (productId, product_retail_price) => {
    if (product_retail_price >= 0) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.product_id === productId
            ? { ...item, product_retail_price }
            : item
        )
      );
    }
  };
  const updatePriceReturn = (productId, product_return_price) => {
    if (product_return_price >= 0) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.product_id === productId
            ? { ...item, product_return_price }
            : item
        )
      );
    }
  };

  const updateDiscount = (productId, discount, type) => {
    mode === "return"
      ? setOrderEligibility((prev) => ({
          ...prev,
          products: prev.products.map((item) => {
            if (item.product_id !== productId) return item;

            const discountType = type || discountTypes[productId] || "đ";
            const price = item.product_retail_price || 0;
            const quantity = item.quantity || 1;

            let discountAmount = 0;
            if (discountType === "%") {
              discountAmount = Math.round(
                (discount / 100) * (price * quantity)
              );
            } else {
              discountAmount = discount;
            }
            return {
              ...item,
              discount,
              discountAmount,
            };
          }),
        }))
      : setSelectedProducts((prev) =>
          prev.map((item) => {
            if (item.product_id !== productId) return item;

            const discountType = type || discountTypes[productId] || "đ";
            const price = item.product_retail_price || 0;
            const quantity = item.quantity || 1;

            let discountAmount = 0;
            if (discountType === "%") {
              discountAmount = Math.round(
                (discount / 100) * (price * quantity)
              );
            } else {
              discountAmount = discount;
            }
            return {
              ...item,
              discount,
              discountAmount,
            };
          })
        );

    if (type) {
      setDiscountTypes((prev) => ({
        ...prev,
        [productId]: type,
      }));
    }
  };

  const handleWarehouseChange = (warehouseId) => {
    console.log("change");
    fetchInventoryByWarehouseId(warehouseId);
    if (mode === "create") {
      setSelectedProducts([]);
    }
    form.setFieldValue("warehouse_id", warehouseId);
  };

  // Product selection table columns
  const productColumns = [
    {
      title: "Mã SP",
      dataIndex: ["product", "product_id"],
      key: "product_id",
      width: 220,
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "product_name"],
      key: "product_name",
      render: (text, record) => (
        <div className="flex items-center">
          <Button
            type="link"
            onClick={() => addProduct(record)}
            className="p-0 hover:text-gray-700"
          >
            {text}
          </Button>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: ["product", "product_retail_price"],
      key: "product_retail_price",
      align: "right",
      render: (product_retail_price) => formatCurrency(product_retail_price),
    },
    {
      title: "Tồn kho",
      dataIndex: ["product", "available_quantity"],
      key: "available_quantity",
      align: "center",
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => addProduct(record)}
        />
      ),
    },
  ];

  // Selected products table columns
  const selectedProductColumns = [
    {
      title: "Mã SP",
      dataIndex: "product_id",
      key: "product_id",
      width: 200,
      render: (val) => val.slice(0, 8),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      width: 140,
    },

    // 👇 Cột "Giá trả" sẽ chỉ được thêm nếu mode === "return"
    ...(mode === "return"
      ? [
          {
            title: "Giá trả",
            dataIndex: "product_return_price",
            key: "product_return_price",
            align: "right",
            render: (_, record) => (
              <div className="flex items-center gap-1">
                <InputNumber
                  min={0}
                  defaultValue={record.product_retail_price}
                  value={record.product_return_price}
                  addonAfter="₫"
                  onChange={(value) =>
                    updatePriceReturn(record.product_id, value)
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  className="w-32"
                />
                <Tooltip
                  title={`Giá bán gốc: ${record.product_retail_price?.toLocaleString()} ₫`}
                >
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                </Tooltip>
              </div>
            ),
          },

          {
            title: "Số lượng trả",
            dataIndex: "quantity_return",
            key: "quantity_return",
            align: "center",
            render: (_, record) => (
              <div className="flex justify-center items-center">
                <InputNumber
                  min={0}
                  max={record.quantity - record.returned_quantity}
                  defaultValue={0}
                  value={record.quantity_return}
                  onChange={(value) => {
                    updateQuantityReturn(record.product_id, value);
                  }}
                  className="w-14"
                />
                <div className="w-6 text-lg text-neutral-400">
                  / {record.quantity - record.returned_quantity}
                </div>
              </div>
            ),
          },
        ]
      : [
          {
            title: "Giá bán",
            dataIndex: "product_retail_price",
            key: "product_retail_price",
            align: "right",
            render: (_, record) => (
              <InputNumber
                min={0}
                value={record.product_retail_price}
                addonAfter="₫"
                disabled={mode === "return"}
                onChange={(value) => {
                  updatePrice(record.product_id, value);
                  discountTypes[record.product_id] === "%" &&
                    updateDiscount(
                      record.product_id,
                      record.discount,
                      discountTypes[record.product_id]
                    );
                }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                className="w-32"
              />
            ),
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (_, record) => (
              <div className="flex justify-center items-center">
                <InputNumber
                  min={1}
                  max={record.available_quantity}
                  value={record.quantity}
                  onChange={(value) => updateQuantity(record.product_id, value)}
                  className="w-14"
                />
              </div>
            ),
          },
        ]),

    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "right",
      render: (_, record) => {
        const discountType = discountTypes[record.product_id] || "đ";

        return (
          <div className="flex items-center gap-2">
            <InputNumber
              min={0}
              max={discountType === "%" ? 100 : record.product_retail_price}
              value={record.discount}
              onChange={(value) =>
                updateDiscount(record.product_id, value, discountType)
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              className="w-24"
            />
            <Select
              value={discountType}
              onChange={(newType) =>
                updateDiscount(record.product_id, record.discount, newType)
              }
              style={{ width: 60 }}
              options={[
                { label: "%", value: "%" },
                { label: "đ", value: "đ" },
              ]}
            />
          </div>
        );
      },
    },

    {
      title: "Thành tiền",
      key: "subtotal",
      align: "right",
      width: 140,
      render: (_, record) => {
        if (mode === "return" && refundAmount?.itemRefunds) {
          const itemRefund = refundAmount.itemRefunds.find(
            (i) => i.product_id === record.product_id
          );
          return formatCurrency(itemRefund ? itemRefund.refund_amount : 0);
        }
        const quantity =
          mode === "return"
            ? record.quantity_return ?? 0
            : record.quantity ?? 0;
        return formatCurrency(
          (record.product_return_price !== undefined
            ? record.product_return_price
            : record.product_retail_price) *
            (quantity || 0) -
            (record.discountAmount || record.discount)
        );
      },
    },
    mode !== "return" && {
      title: "",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeProduct(record.product_id)}
        />
      ),
    },
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );
  }

  if (mode === "edit" && (!order || order.order_status !== "Mới")) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Typography.Title level={4} className="text-red-500">
            Không thể chỉnh sửa đơn hàng này
          </Typography.Title>
          <Typography.Text>
            Chỉ có thể chỉnh sửa đơn hàng khi ở trạng thái "Mới"
          </Typography.Text>
          <div className="mt-4">
            <Button type="primary" onClick={() => navigate("/orders")}>
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold mb-3">
          {mode === "edit"
            ? `Chỉnh sửa đơn hàng #${order?.order_code}`
            : mode === "return"
            ? `Trả hàng đơn hàng #${order?.order_code}`
            : ""}
        </h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        // initialValues={{
        //     order_date: mode === 'create' ? null : dayjs(order?.order_date),
        //     warehouse_id: mode === 'edit' ? order?.warehouse_id : null
        // }}
      >
        <div className="grid grid-cols-3 gap-4 mb-10 pb-10">
          <div className="col-span-2">
            {/* Product selection by warehouse */}
            {mode !== "return" && (
              <div className="p-4 bg-white rounded-lg shadow mb-4">
                <div className="flex justify-between">
                  <div className="font-medium mb-2">Sản phẩm</div>
                  <Form.Item
                    name="warehouse_id"
                    rules={[
                      { required: true, message: "Vui lòng chọn kho hàng" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn kho hàng"
                      onChange={handleWarehouseChange}
                      disabled={
                        mode !== "create" && selectedProducts.length > 0
                      }
                    >
                      {warehouses?.map((warehouse) => (
                        <Option
                          key={warehouse.warehouse_id}
                          value={warehouse.warehouse_id}
                        >
                          {warehouse.warehouse_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="mb-4">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="mb-2"
                  />
                  <Table
                    columns={productColumns}
                    dataSource={filteredProducts}
                    rowKey="product_id"
                    size="small"
                    pagination={{ pageSize: 5 }}
                    className="mb-4"
                  />
                </div>
              </div>
            )}

            {/* Selected products */}
            {selectedProducts.length > 0 && (
              <div className="rounded-lg p-4 bg-white">
                <div className="flex justify-between">
                  <div className="font-medium mb-2">Sản phẩm đã chọn</div>
                  {mode === "return" && (
                    <div>
                      <span className="font-medium">Kho:</span>{" "}
                      {warehouses?.find(
                        (w) =>
                          w.warehouse_id === form.getFieldValue("warehouse_id")
                      )?.warehouse_name || "Không rõ kho hàng"}
                    </div>
                  )}
                </div>
                <Table
                  columns={selectedProductColumns}
                  dataSource={
                    mode === "return"
                      ? orderEligibility?.products
                      : selectedProducts
                  }
                  rowKey="product_id"
                  size="small"
                  pagination={false}
                />
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Text strong>Số tiền hoàn trả: </Text>
                  <Text type="danger" strong>
                    {formatCurrency(refundAmount.totalRefund)}
                  </Text>
                </div>
              </div>
            )}

            {mode === "return" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* Phí vận chuyển */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium flex items-center gap-1">
                      Phí vận chuyển
                    </label>
                    <InputNumber
                      variant="outlined"
                      placeholder="Nhập phí vận chuyển"
                      addonAfter="₫"
                      className="w-full"
                      value={returnOrderData.shipping_fee}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      onChange={(value) =>
                        setReturnOrderData((prev) => ({
                          ...prev,
                          shipping_fee: Number(value) || 0,
                        }))
                      }
                    />
                  </div>

                  {/* Giảm giá đơn hàng */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium flex items-center gap-1">
                      Giảm giá trả hàng
                      {form?.getFieldValue("order_amount") != null && (
                        <Tooltip
                          title={`Giảm giá đơn hàng: ${form
                            ?.getFieldValue("shipping_fee")
                            .toLocaleString()} ₫`}
                        >
                          <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        </Tooltip>
                      )}
                    </label>
                    <InputNumber
                      variant="outlined"
                      placeholder="Giảm giá trả hàng"
                      addonAfter="₫"
                      className="w-full"
                      value={returnOrderData.order_amount}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      onChange={(value) =>
                        setReturnOrderData((prev) => ({
                          ...prev,
                          order_amount: Number(value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <TextArea
                  className="!mt-3"
                  placeholder="Ghi chú"
                  variant="outlined"
                  rows={2}
                  value={returnOrderData.note} // binding value để TextArea phản ánh đúng state
                  onChange={(e) =>
                    setReturnOrderData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>

          {/* Order information */}
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="font-medium mb-2">Thông tin đơn hàng</div>
            <Divider />
            <div className="font-medium mb-2">Khách hàng</div>
            <div>
              <div className="flex gap-2">
                <Form.Item
                  name="customer_id"
                  className="w-full"
                  rules={[
                    { required: true, message: "Vui lòng chọn khách hàng" },
                  ]}
                >
                  <Select
                    className="w-full"
                    placeholder="Chọn khách hàng"
                    variant="filled"
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                    disabled={mode === "return"}
                  >
                    {customers?.map((customer) => (
                      <Option
                        key={customer.customer_id}
                        value={customer.customer_id}
                        label={`${customer.customer_name} - ${customer.phone}`}
                      >
                        {customer.customer_name} - {customer.phone}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {mode !== "return" && (
                  <Button
                    type="primary"
                    onClick={() => setCreateModalVisible(true)}
                  >
                    + Thêm
                  </Button>
                )}

                <CustomerModal
                  open={createModalVisible}
                  onCancel={() => setCreateModalVisible(false)}
                  onSubmit={handleCreateCustomer}
                  mode="create"
                />
              </div>

              {/* <ShippingAddressForm form={form} /> */}
              <Form.Item
                name="shipping_address"
                label="Địa chỉ cụ thể"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
                ]}
              >
                <Input
                  variant="filled"
                  placeholder="Số nhà, tên đường..."
                  disabled={mode === "return"}
                />
              </Form.Item>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="order_date"
                  label="Ngày giao hàng"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày đặt hàng" },
                  ]}
                >
                  <DatePicker
                    placeholder="Chọn ngày"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                    variant="filled"
                    className="w-full"
                    format="DD/MM/YYYY"
                    disabled={mode === "return"}
                  />
                </Form.Item>

                <Form.Item
                  name="payment_method"
                  label="Thanh toán"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phương thức thành toán",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn phương thức"
                    variant="filled"
                    disabled={mode === "return"}
                  >
                    <Option value="Chuyển khoản">Chuyển khoản</Option>
                    <Option value="COD">COD</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="note" label="Ghi chú">
                <TextArea
                  placeholder="Ghi chú"
                  variant="filled"
                  disabled={mode === "return"}
                  rows={2}
                />
              </Form.Item>
            </div>
            <Divider />
            <div className="font-medium mb-2">Thanh toán</div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="shipping_fee" label="Phí vận chuyển">
                  <InputNumber
                    variant="filled"
                    placeholder="Nhập phí vận chuyển"
                    addonAfter="₫"
                    className="w-full"
                    disabled={mode === "return"}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={(value) => setShippingFee(value)}
                  />
                </Form.Item>

                <Form.Item name="order_amount" label="Giảm giá đơn hàng">
                  <InputNumber
                    variant="filled"
                    addonAfter="₫"
                    placeholder="Nhập phí giảm giá"
                    className="w-full"
                    disabled={mode === "return"}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={(value) => setOrderDiscount(Number(value) || 0)}
                  />
                </Form.Item>
              </div>

              <Form.Item name="amount_paid" label="Tiền chuyển khoản">
                <InputNumber
                  variant="filled"
                  addonAfter="₫"
                  placeholder="Nhập số tiền chuyển khoản"
                  className="w-full"
                  disabled={mode === "return"}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => setTransferAmount(value)}
                />
              </Form.Item>
            </div>
          </div>

          {selectedProducts.length !== 0 && mode !== "return" && (
            <div className="col-span-2 bg-white p-4 rounded-lg shadow space-y-2">
              <Descriptions column={4} size="small" bordered>
                <Descriptions.Item
                  label="Tổng số tiền"
                  className="font-medium !text-xl"
                  span={4}
                >
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(calculateTotalAmount())}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Giảm giá theo đơn hàng" span={2}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(orderDiscount)}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Giảm giá theo từng sản phẩm" span={2}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(calculateDiscountAmount() - orderDiscount)}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label="Tổng giảm giá"
                  style={{ color: "green" }}
                  span={4}
                >
                  <div style={{ textAlign: "right" }}>
                    <strong>{formatCurrency(calculateDiscountAmount())}</strong>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Sau giảm giá" span={4}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(
                      calculateTotalAmount() - calculateDiscountAmount()
                    )}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Phí vận chuyển" span={4}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(shippingFee)}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Cần thanh toán" span={4}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(calculateFinalAmount())}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Đã thanh toán" span={4}>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(transferAmount)}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label="Còn thiếu"
                  span={4}
                  style={{ color: "red" }}
                >
                  <div style={{ textAlign: "right" }}>
                    <strong>
                      {formatCurrency(calculateFinalAmount() - transferAmount)}
                    </strong>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </div>
      </Form>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: mobileView ? 0 : collapsed ? 80 : 240,
          width: mobileView ? "100%" : `calc(100% - ${collapsed ? 80 : 240}px)`,
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          padding: "8px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        {/* Left side - payment info */}
        <div>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Cần thanh toán: {formatCurrency(calculateFinalAmount())}
            </Text>
          </div>

          {mode !== "return" && (
            <div>
              <Text style={{ color: "red" }}>
                COD: {formatCurrency(calculateFinalAmount() - transferAmount)}
              </Text>
            </div>
          )}
        </div>
        {mode !== "return" ? (
          <>
            {/* Right side - actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag color="cyan" style={{ fontSize: 14 }}>
                Trạng thái: <Text strong>Mới</Text>
              </Tag>
              <Button onClick={() => navigate("/orders")}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmitOrder}
                disabled={selectedProducts.length === 0}
                loading={formLoading}
              >
                {mode === "create" ? "Tạo đơn hàng" : "Cập nhật đơn hàng"}
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleCreateOrderReturn}
            disabled={selectedProducts.length === 0}
            loading={formLoading}
          >
            Trả đơn hàng
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderFormData;
