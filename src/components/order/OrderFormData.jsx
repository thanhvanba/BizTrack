/**
 * OrderFormData Component
 *
 * Mục đích: Component chính để tạo, chỉnh sửa và xử lý trả hàng đơn hàng
 *
 * Tính năng chính:
 * - Tạo đơn hàng mới (create mode)
 * - Chỉnh sửa đơn hàng (edit mode)
 * - Xử lý trả hàng (return mode)
 * - Quản lý sản phẩm và tính toán giá trị
 * - Tích hợp với MultiOrderFormTabs cho tạo nhiều đơn hàng
 * - Lưu trữ tạm thời vào localStorage
 *
 * Props:
 * - mode: "create" | "edit" | "return" - Chế độ hoạt động
 * - order: Object - Dữ liệu đơn hàng (cho edit/return mode)
 * - selectedProducts: Array - Danh sách sản phẩm đã chọn
 * - onSave: Function - Callback khi lưu thành công
 * - onChange: Function - Callback khi form thay đổi
 */
import { useState, useEffect, useMemo } from "react";
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
import useToastNotify from "../../utils/useToastNotify";
import LoadingLogo from "../LoadingLogo";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

/**
 * Component chính xử lý form đơn hàng
 * @param {string} mode - Chế độ hoạt động: "create" | "edit" | "return"
 * @param {object} orderProp - Dữ liệu đơn hàng (cho edit/return mode)
 * @param {array} selectedProductsProps - Danh sách sản phẩm đã chọn
 * @param {function} onSave - Callback khi lưu thành công
 * @param {function} onChange - Callback khi form thay đổi
 */
const OrderFormData = ({
  mode = "create",
  order: orderProp,
  selectedProducts: selectedProductsProps,
  onSave,
  onChange,
}) => {
  const { orderId } = useParams();

  // State quản lý dữ liệu khách hàng và sản phẩm
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderEligibility, setOrderEligibility] = useState(null);

  // Form instance và state quản lý trả hàng
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

  // State quản lý loading và trạng thái form
  const [loading, setLoading] = useState(mode === "edit");
  const [formLoading, setFormLoading] = useState(false);

  // Redux store và warehouses
  const dispatch = useDispatch();
  const warehouses = useSelector(
    (state) => state.warehouse.warehouses.data || []
  );

  // State quản lý modal và loại giảm giá
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [discountTypes, setDiscountTypes] = useState({});

  // State quản lý sản phẩm đã chọn và các giá trị tính toán
  const [selectedProducts, setSelectedProducts] = useState(
    selectedProductsProps || []
  );
  const [shippingFee, setShippingFee] = useState(0);
  const [orderDiscount, setOrderDiscount] = useState(0);

  const [transferAmount, setTransferAmount] = useState(
    orderProp?.amount_paid || 0
  );
  const [transferAmountByInput, setTransferAmountByInput] = useState(
    orderProp?.amount_paid || 0
  );

  const [refundAmount, setRefundAmount] = useState(0);
  const [orderDetailSummary, setOrderDetailSummary] = useState(null);
  // Utility function để format tiền tệ
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // State quản lý tìm kiếm và navigation
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState();

  // State quản lý loại giảm giá đơn hàng (% hoặc ₫)
  const [orderDiscountType, setOrderDiscountType] = useState("₫");

  /**
   * Cập nhật giảm giá đơn hàng và đồng bộ với form
   * @param {number} value - Giá trị giảm giá
   * @param {string} type - Loại giảm giá ('%' hoặc '₫')
   */
  const updateOrderDiscount = (value, type) => {
    setOrderDiscount(Number(value) || 0);
    setOrderDiscountType(type);
  };

  /**
   * Tính số tiền giảm giá đơn hàng thực tế
   * @returns {number} Số tiền giảm giá
   */
  const getOrderDiscountAmount = () => {
    if (orderDiscountType === "%") {
      return (orderDiscount / 100) * calculateTotalAmount();
    }
    return orderDiscount;
  };

  /**
   * useEffect khởi tạo dữ liệu ban đầu
   * - Fetch danh sách khách hàng
   * - Fetch danh sách warehouses từ Redux
   * - Fetch chi tiết đơn hàng nếu là edit/return mode
   */
  useEffect(() => {
    fetchCustomers();
    dispatch(fetchWarehouses());

    if (mode !== "create" && orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  /**
   * Fetch danh sách khách hàng từ API
   */
  const fetchCustomers = async () => {
    try {
      // setLoading(true);
      const res = await customerService.getAllCustomers({
        page: 1,
        limit: 1000,
      });
      if (res && res.data) {
        setCustomers(res.data);
      }
    } finally {
      // setLoading(false);
    }
  };

  /**
   * Fetch danh sách sản phẩm theo warehouse ID
   * @param {string} warehouseId - ID của warehouse
   */
  const fetchInventoryByWarehouseId = async (warehouseId) => {
    const res = await inventoryService.getInventoryByWarehouseId(warehouseId);
    if (res && res.data) {
      setProducts(res.data);
    }
  };
  /**
   * Đồng bộ selectedCustomerId khi form thay đổi customer_id
   */
  useEffect(() => {
    setSelectedCustomerId(form.getFieldValue("customer_id"));
  }, [form.getFieldValue("customer_id")]);

  /**
   * Xử lý tạo khách hàng mới
   * @param {object} data - Dữ liệu khách hàng mới
   */
  const handleCreateCustomer = async (data) => {
    try {
      const res = await customerService.createCustomer(data);
      const newCustomer = res?.data || data;
      setCustomers([...customers, newCustomer]);
      setCreateModalVisible(false);
      form.setFieldsValue({ customer_id: newCustomer.customer_id });
      setSelectedCustomerId(newCustomer.customer_id);
      await form.validateFields(["customer_id"]); // Force re-render và validate
      useToastNotify(
        `Khách hàng "${newCustomer.customer_name}" đã được thêm thành công!`,
        "success"
      );
    } catch (error) {
      useToastNotify("Thêm khách hàng không thành công.", "error");
    }
  };
  /**
   * Fetch chi tiết đơn hàng (sử dụng cho edit và return mode)
   * Bao gồm:
   * - Thông tin đơn hàng
   * - Danh sách sản phẩm
   * - Kiểm tra eligibility cho return
   * - Lịch sử trả hàng
   */
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
    } catch (error) {
      // useToastNotify("Không thể tải thông tin đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý tạo đơn trả hàng
   * Lọc sản phẩm có quantity_return > 0 và tạo return_details
   */
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

  /**
   * useEffect đồng bộ dữ liệu từ orderProp (sử dụng cho tạo nhiều đơn hàng)
   * Cập nhật form values khi orderProp thay đổi
   */
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

  /**
   * Fetch sản phẩm khi warehouse_id thay đổi
   */
  useEffect(() => {
    fetchInventoryByWarehouseId(orderProp?.warehouse_id);
  }, [orderProp?.warehouse_id]);

  /**
   * Tính toán số tiền hoàn trả cho return mode
   * Sử dụng calculateRefund utility với tổng số tiền đã hoàn trước đó
   */
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

  /**
   * Xử lý submit đơn hàng
   * Bao gồm:
   * - Validate form
   * - Format dữ liệu
   * - Gọi API tạo/cập nhật đơn hàng
   * - Hiển thị thông báo
   * - Navigate hoặc callback onSave
   */
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
          order_amount:
            (getOrderDiscountAmount() || orderProp?.order_amount || 0) ?? 0,
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
        useToastNotify(
          `Đơn hàng đã được ${
            mode === "create" ? "thêm" : "cập nhật"
          } thành công!`,
          "success"
        );
      }
    } catch (error) {
      // Show each validation error as a toast
      if (error && error.errorFields) {
        error.errorFields.forEach((fieldError) => {
          fieldError.errors.forEach((msg) => {
            useToastNotify(msg, "error");
          });
        });
      } else {
        useToastNotify(
          `${
            mode === "create" ? "Thêm" : "Cập nhật"
          } đơn hàng không thành công.`,
          "error"
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Lọc sản phẩm theo searchText
  const filteredProducts = products.filter((product) =>
    product?.product?.product_name
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );
  /**
   * Tính tổng tiền đơn hàng
   * Sử dụng orderEligibility.products cho return mode, selectedProducts cho create/edit mode
   * @returns {number} Tổng tiền đơn hàng
   */
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
  /**
   * Tính tổng giảm giá (sản phẩm + đơn hàng)
   * @returns {number} Tổng giảm giá
   */
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
        mode === "return"
          ? returnOrderData.order_amount
          : getOrderDiscountAmount() || orderProp?.order_amount || 0
      )
    );
  };

  /**
   * Tính số tiền cuối cùng cần thanh toán
   * Công thức: Tổng tiền - Tổng giảm giá + Phí vận chuyển
   */
  const finalAmount = useMemo(() => {
    return (
      Number(calculateTotalAmount()) -
      Number(calculateDiscountAmount()) +
      Number(
        mode === "return"
          ? returnOrderData.shipping_fee
          : shippingFee || orderProp?.shipping_fee || 0
      )
    );
  }, [
    selectedProducts,
    orderEligibility,
    returnOrderData,
    shippingFee,
    orderDiscount,
    mode,
  ]);

  /**
   * Tự động cập nhật transferAmount và form khi finalAmount thay đổi
   * Đảm bảo đồng bộ giữa state và form
   */
  useEffect(() => {
    setTransferAmount(finalAmount);
    // form.setFieldsValue({ amount_paid: finalAmount });
    const currentValues = {
      ...form.getFieldsValue(),
      amount_paid: finalAmount, // Gán lại trước khi gửi đi
    };
    onChange?.(currentValues, selectedProducts);
  }, [selectedProducts, form, finalAmount]);

  /**
   * Callback khi form values thay đổi
   */
  const handleValuesChange = (_, allValues) => {
    const updatedValues = { ...allValues, amount_paid: transferAmount };
    onChange?.(updatedValues, selectedProducts);
  };

  /**
   * Đồng bộ dữ liệu với parent component khi selectedProducts thay đổi
   */
  useEffect(() => {
    if (selectedProducts.length !== 0) {
      const currentValues = {
        ...form.getFieldsValue(),
        amount_paid: transferAmount, // Gán lại trước khi gửi đi
      };
      onChange?.(currentValues, selectedProducts);
    }
  }, [transferAmountByInput]);

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
      width: 120,
      responsive: ["md"],
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
            className="p-0 hover:text-gray-700 text-xs sm:text-sm"
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
      width: 100,
      render: (product_retail_price) => formatCurrency(product_retail_price),
    },
    {
      title: "Tồn kho",
      dataIndex: ["product", "available_quantity"],
      key: "available_quantity",
      align: "center",
      width: 80,
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 60,
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
      width: 100,
      responsive: ["md"],
      render: (val) => val.slice(0, 8),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      width: 120,
      render: (text) => (
        <div className="text-xs sm:text-sm truncate" title={text}>
          {text}
        </div>
      ),
    },

    // 👇 Cột "Giá trả" sẽ chỉ được thêm nếu mode === "return"
    ...(mode === "return"
      ? [
          {
            title: "Giá trả",
            dataIndex: "product_return_price",
            key: "product_return_price",
            align: "right",
            width: 160,
            render: (_, record) => (
              <div className="flex items-center gap-1">
                <InputNumber
                  min={0}
                  step={1000}
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
                  style={{ width: "100%" }}
                  size="small"
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
            width: 100,
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
                  className="w-12 sm:w-14"
                  size="small"
                />
                <div className="w-4 sm:w-6 text-xs sm:text-lg text-neutral-400">
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
            width: 160,
            render: (_, record) => (
              <InputNumber
                min={0}
                step={1000}
                value={record.product_retail_price}
                addonAfter="₫"
                disabled={mode === "return"}
                style={{ width: "100%" }}
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
                className="w-20 sm:w-32"
                size="small"
              />
            ),
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            width: 80,
            render: (_, record) => (
              <div className="flex justify-center items-center">
                <InputNumber
                  min={1}
                  max={record.available_quantity}
                  value={record.quantity}
                  onChange={(value) => updateQuantity(record.product_id, value)}
                  className="w-12 sm:w-14"
                  size="small"
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
      width: 60,
      render: (_, record) => {
        const discountType = discountTypes[record.product_id] || "đ";
        return (
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <InputNumber
              min={0}
              step={1000}
              max={discountType === "%" ? 100 : record.product_retail_price}
              value={record.discount}
              disabled={mode === "return"}
              onChange={(value) =>
                updateDiscount(record.product_id, value, discountType)
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              className="w-16 sm:w-24"
              size="small"
            />
            <Select
              value={discountType}
              onChange={(newType) =>
                updateDiscount(record.product_id, record.discount, newType)
              }
              style={{ width: 50 }}
              size="small"
              disabled={mode === "return"}
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
      width: 120,
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
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeProduct(record.product_id)}
        />
      ),
    },
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <LoadingLogo size={40} className="mx-auto my-8" />
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg sm:text-xl font-semibold">
          {mode === "edit"
            ? `Chỉnh sửa đơn hàng #${order?.order_code}`
            : mode === "return"
            ? `Trả hàng đơn hàng #${order?.order_code}`
            : ""}
        </h1>
      </div>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10 pb-10">
          <div className="lg:col-span-2">
            {/* Product selection by warehouse */}
            {mode !== "return" && (
              <div className="p-3 sm:p-4 bg-white rounded-lg shadow mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <div className="font-medium">Sản phẩm</div>
                  <Form.Item
                    name="warehouse_id"
                    rules={[
                      { required: true, message: "Vui lòng chọn kho hàng" },
                    ]}
                    className="mb-0"
                  >
                    <Select
                      className="highlight-select w-full sm:w-auto"
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
                  <div className="overflow-x-auto">
                    <Table
                      columns={productColumns}
                      dataSource={filteredProducts}
                      rowKey="product_id"
                      size="small"
                      pagination={{ pageSize: 5 }}
                      className="mb-4"
                      scroll={{ x: 600 }}
                      responsive
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected products */}
            {selectedProducts.length > 0 && (
              <div className="rounded-lg p-3 sm:p-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <div className="font-medium">Sản phẩm đã chọn</div>
                  {mode === "return" && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Kho:</span>{" "}
                      {warehouses?.find(
                        (w) =>
                          w.warehouse_id === form.getFieldValue("warehouse_id")
                      )?.warehouse_name || "Không rõ kho hàng"}
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
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
                    scroll={{ x: 800 }}
                    responsive
                  />
                </div>
              </div>
            )}

            {mode === "return" && (
              <>
                {/* Phí vận chuyển */}
                <div className="flex flex-col gap-1 mt-4">
                  <label className="font-medium flex items-center gap-1">
                    Phí vận chuyển
                  </label>
                  <InputNumber
                    min={0}
                    step={1000}
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

                <TextArea
                  className="!mt-3"
                  placeholder="Ghi chú"
                  variant="outlined"
                  rows={2}
                  value={returnOrderData.note}
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
          <div className="p-3 sm:p-4 bg-white rounded-lg shadow">
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
                    key={customers.length}
                    value={selectedCustomerId}
                    onChange={(value) => {
                      setSelectedCustomerId(value);
                      form.setFieldsValue({ customer_id: value });
                    }}
                  >
                    {customers?.map((customer) => (
                      <Option
                        key={customer.customer_id}
                        value={customer.customer_id}
                        label={`${customer.customer_name}${
                          customer.phone ? " - " + customer.phone : ""
                        }`}
                      >
                        {customer.customer_name}
                        {customer.phone ? " - " + customer.phone : ""}
                      </Option>
                    ))}
                  </Select>
                  {mode !== "return" && (
                    <div className="absolute -top-8 right-0">
                      <Text
                        type="link"
                        className="text-sm cursor-pointer !text-blue-600"
                        onClick={() => setCreateModalVisible(true)}
                      >
                        + Thêm khách hàng
                      </Text>
                    </div>
                  )}
                </Form.Item>

                <CustomerModal
                  open={createModalVisible}
                  onCancel={() => setCreateModalVisible(false)}
                  onSubmit={handleCreateCustomer}
                  mode="create"
                />
              </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item name="shipping_fee" label="Phí vận chuyển">
                  <InputNumber
                    min={0}
                    step={1000}
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

                <div className="flex items-center gap-2 w-full">
                  <Form.Item name="order_amount" label="Giảm giá đơn hàng">
                    <InputNumber
                      min={0}
                      step={1000}
                      max={orderDiscountType === "%" ? 100 : finalAmount}
                      variant="filled"
                      placeholder="Nhập phí giảm giá"
                      className="!w-full flex-1"
                      disabled={mode === "return"}
                      value={orderDiscount}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      onChange={(value) =>
                        updateOrderDiscount(value, orderDiscountType)
                      }
                    />
                  </Form.Item>
                  <Select
                    value={orderDiscountType}
                    onChange={(type) =>
                      updateOrderDiscount(orderDiscount, type)
                    }
                    style={{ width: 50 }}
                    disabled={mode === "return"}
                    options={[
                      { label: "%", value: "%" },
                      { label: "₫", value: "₫" },
                    ]}
                  />
                </div>
              </div>
              <Form.Item
                name="payment_method"
                label="Phương thức thanh toán"
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
                  <Option value="Tiền mặt">Tiền mặt</Option>
                  <Option value="Chuyển khoản">Chuyển khoản</Option>
                </Select>
              </Form.Item>
              <Form.Item name="amount_paid" label="Khách thanh toán">
                <InputNumber
                  min={0}
                  step={1000}
                  variant="filled"
                  addonAfter="₫"
                  placeholder="Nhập số tiền trả trước"
                  className="w-full"
                  disabled={mode === "return"}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => {
                    setTransferAmountByInput(value);
                    setTransferAmount(value);
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {selectedProducts.length !== 0 && mode !== "return" && (
            <div className="lg:col-span-2 bg-white p-3 sm:p-4 rounded-lg shadow space-y-2">
              <div className="overflow-x-auto">
                <Descriptions
                  column={{ xs: 1, sm: 2, md: 4 }}
                  size="small"
                  bordered
                >
                  <Descriptions.Item
                    label="Tổng số tiền"
                    className="font-medium !text-lg sm:!text-xl"
                    span={4}
                  >
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(calculateTotalAmount())}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Giảm giá theo đơn hàng" span={2}>
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(
                        getOrderDiscountAmount() || orderProp?.order_amount || 0
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Giảm giá theo từng sản phẩm"
                    span={2}
                  >
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(
                        calculateDiscountAmount() -
                          (getOrderDiscountAmount() ||
                            orderProp?.order_amount ||
                            0)
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Tổng giảm giá"
                    style={{ color: "green" }}
                    span={4}
                  >
                    <div style={{ textAlign: "right" }}>
                      <strong>
                        {formatCurrency(calculateDiscountAmount())}
                      </strong>
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
                      {formatCurrency(
                        shippingFee || orderProp?.shipping_fee || 0
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Cần thanh toán" span={4}>
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(finalAmount)}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Đã thanh toán" span={4}>
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(orderProp?.amount_paid || transferAmount)}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Còn thiếu"
                    span={4}
                    style={{ color: "red" }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <strong>
                        {formatCurrency(
                          finalAmount -
                            (orderProp?.amount_paid || transferAmount)
                        )}
                      </strong>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          )}
        </div>
      </Form>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 z-50"
        style={{
          display: "flex",
          flexDirection: "column sm:flex-row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Left side - payment info */}
        <div className="text-center sm:text-left">
          <div>
            <Text strong className="text-sm sm:text-base">
              Cần thanh toán:
              {mode === "return"
                ? formatCurrency(refundAmount.totalRefund)
                : formatCurrency(finalAmount)}
            </Text>
          </div>

          {(() => {
            const debtAmount =
              mode === "return"
                ? refundAmount.totalRefund
                : finalAmount - (orderProp?.amount_paid || transferAmount);

            return debtAmount !== 0 ? (
              <div>
                <div className="text-red-500 text-xs sm:text-sm">
                  Tính vào công nợ:
                  {formatCurrency(debtAmount)}
                </div>
              </div>
            ) : null;
          })()}
        </div>
        {mode !== "return" ? (
          <>
            {/* Right side - actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <Tag color="cyan" className="text-xs sm:text-sm">
                Trạng thái: <Text strong>Mới</Text>
              </Tag>
              <Button size="small" onClick={() => navigate("/orders")}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="small"
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
            size="small"
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
