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
    message,
    Divider,
    Descriptions,
    Tag,
    Spin,
    Alert,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import CustomerModal from "../../components/modals/CustomerModal";
import customerService from "../../service/customerService";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import inventoryService from "../../service/inventoryService";
import orderService from "../../service/orderService";
import useToastNotify from "../../utils/useToastNotify";
import ShippingAddressForm from "../../components/ShippingAddressForm";
import orderDetailService from "../../service/orderDetailService";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

const OrderFormData = ({ mode = 'create', order: orderProp, selectedProducts: selectedProductsProps, onSave, onChange }) => {

    console.log("🚀 ~ OrderFormData ~ orderProp:", orderProp)
    const { orderId } = useParams();
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(mode === 'edit');
    const [formLoading, setFormLoading] = useState(false);

    const dispatch = useDispatch();
    const warehouses = useSelector(
        (state) => state.warehouse.warehouses.data || []
    );
    const { mobileView, collapsed } = useOutletContext();

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [discountTypes, setDiscountTypes] = useState({});

    const [form] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState(selectedProductsProps || []);

    const [shippingFee, setShippingFee] = useState(0);
    const [orderDiscount, setOrderDiscount] = useState(0);
    const [transferAmount, setTransferAmount] = useState(0);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);

    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    // useEffect(() => {
    //     dispatch(fetchWarehouses());
    //     fetchCustomers();

    //     if (mode === 'edit') {
    //         fetchOrderDetails();
    //     }
    // }, [orderId]);

    // useEffect(() => {
    //     fetchInventoryByWarehouseId(orderProp.warehouse_id);
    // }, [orderProp?.warehouse_id]);

    // Gọi fetchInventory chỉ khi warehouse_id tồn tại

    // useEffect(() => {
    //   if (mode === "edit" && orderId) {
    //     const fetchOrder = async () => {
    //       try {
    //         const res = await orderService.getOrderById(orderId);
    //         if (res?.data) {
    //           setOrder(res.data);
    //         }
    //       } catch (error) {
    //         console.error("Lỗi khi fetch order:", error);
    //       } finally {
    //         setLoading(false);
    //       }
    //     };

    //     fetchOrder();
    //   }
    // }, [mode, orderId]);

    // useEffect(() => {
    //   console.log("🚀 ~ order:", order);
    // }, [order]);

    // Chỉ gọi fetchWarehouses nếu chưa có trong store
    useEffect(() => {
        fetchCustomers();
        dispatch(fetchWarehouses());

        if (mode === "edit" && orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    useEffect(() => {
        fetchInventoryByWarehouseId(orderProp?.warehouse_id);
    }, [orderProp?.warehouse_id]);

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

    // Nếu có dữ liệu order ban đầu thì set form
    useEffect(() => {
        if (order) {
            form.setFieldsValue({
                customer_id: order?.customer?.customer_id,
                order_date: dayjs(order?.order_date),
                shipping_fee: order?.shipping_fee,
                discount_amount: order?.order_amount,
                transfer_amount: order?.transfer_amount,
                payment_method: order?.payment_method,
                note: order?.note,
                warehouse_id: order?.warehouse_id,
                shipping_address: order?.shipping_address,
            });
        }
    }, [order]);

    const handleValuesChange = (_, allValues) => {
        onChange?.(allValues, selectedProducts);
    };
    useEffect(() => {
        if (selectedProducts.length !== 0) {
            onChange?.(form.getFieldsValue(), selectedProducts);
        }
    }, [selectedProducts]);


    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // const orderRes = await orderService.getOrderById(orderId);
            const orderRes = await orderDetailService.getOrderDetailById(orderId);
            console.log("🚀 ~ fetchOrderDetails ~ orderRes:", orderRes);
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

                setSelectedProducts(formattedProducts);
                setShippingFee(orderRes.shipping_fee || 0);
                setOrderDiscount(orderRes.order_amount || 0);
                setTransferAmount(orderRes.transfer_amount || 0);

                // Set form values
                form.setFieldsValue({
                    customer_id: orderRes.customer.customer_id,
                    order_date: dayjs(orderRes.order_date),
                    shipping_fee: orderRes.shipping_fee,
                    discount_amount: orderRes.order_amount,
                    transfer_amount: orderRes.transfer_amount,
                    payment_method: orderRes.payment_method,
                    note: orderRes.note,
                    warehouse_id: orderRes.warehouse_id,
                    shipping_address: orderRes.shipping_address
                });

                // Fetch products for the warehouse
                fetchInventoryByWarehouseId(orderRes.warehouse_id);
            }
        } catch (error) {
            useToastNotify("Không thể tải thông tin đơn hàng", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOrder = async () => {
        try {
            setFormLoading(true);
            const values = await form.validateFields();
            const formattedOrderDate = dayjs(values.order_date).format("YYYY-MM-DD");

            const orderDetails = selectedProducts.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: Number(item.product_retail_price),
                discount: item.discountAmount || item.discount || 0,
            }));

            const rqOrder = {
                order: {
                    customer_id: values.customer_id,
                    order_date: formattedOrderDate,
                    order_amount: values.discount_amount,
                    shipping_address: values.shipping_address,
                    shipping_fee: values.shipping_fee,
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
            }

            if (onSave) {
                onSave(res);
            }

            if (res) {
                useToastNotify(
                    `Đơn hàng đã được ${mode === "create" ? "thêm" : "cập nhật"
                    } thành công!`,
                    "success"
                );
                // navigate("/orders");
            }
        } catch (error) {
            useToastNotify(
                `${mode === "create" ? "Thêm" : "Cập nhật"} đơn hàng không thành công.`,
                "error"
            );
        } finally {
            setFormLoading(false);
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
            useToastNotify(
                `Khách hàng "${data.customer_name}" đã được thêm thành công!`,
                "success"
            );
        } catch (error) {
            useToastNotify("Thêm khách hàng không thành công.", "error");
        }
    };

    // Filter products based on search text
    const filteredProducts = products.filter((product) =>
        product.product_name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Calculate totals
    const calculateTotalAmount = () => {
        return selectedProducts.reduce(
            (sum, item) => sum + item.product_retail_price * item.quantity,
            0
        );
    };

    const calculateDiscountAmount = () => {
        const discountProduct = selectedProducts.reduce(
            (sum, item) => sum + (item.discountAmount || 0),
            0
        );
        return discountProduct + orderDiscount;
    };

    const calculateFinalAmount = () => {
        return (
            Number(calculateTotalAmount()) -
            Number(calculateDiscountAmount()) +
            Number(shippingFee)
        );
    };

    // Add product to order
    const addProduct = (product) => {
        const existingProduct = selectedProducts.find(
            (item) => item.product_id === product.product_id
        );

        if (existingProduct) {
            setSelectedProducts(
                selectedProducts.map((item) =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setSelectedProducts([
                ...selectedProducts,
                { ...product, quantity: 1, discount: 0 },
            ]);
        }
    };

    // Remove product from order
    const removeProduct = (productId) => {
        setSelectedProducts(
            selectedProducts.filter((item) => item.product_id !== productId)
        );
    };

    // Update product quantity
    const updateQuantity = (productId, quantity) => {
        if (quantity > 0) {
            setSelectedProducts(
                selectedProducts.map((item) =>
                    item.product_id === productId ? { ...item, quantity } : item
                )
            );
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

    // Update product discount
    const updateDiscount = (productId, discount, type) => {
        setSelectedProducts((prev) =>
            prev.map((item) => {
                if (item.product_id !== productId) return item;

                const discountType = type || discountTypes[productId] || "đ";
                let discountAmount = 0;

                if (discountType === "%") {
                    discountAmount = Math.round(
                        (discount / 100) * (item.product_retail_price * item.quantity)
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

    // Handle warehouse change
    const handleWarehouseChange = (warehouseId) => {
        console.log('change')
        fetchInventoryByWarehouseId(warehouseId);
        if (mode === 'create') {
            setSelectedProducts([]);
        }
        form.setFieldValue('warehouse_id', warehouseId);
    };

    // Product selection table columns
    const productColumns = [
        {
            title: "Mã SP",
            dataIndex: "product_id",
            key: "product_id",
            width: 220,
        },
        {
            title: "Sản phẩm",
            dataIndex: "product_name",
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
            dataIndex: "product_retail_price",
            key: "product_retail_price",
            align: "right",
            render: (product_retail_price) => formatCurrency(product_retail_price),
        },
        {
            title: "Tồn kho",
            dataIndex: "available_quantity",
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
        },
        {
            title: "Sản phẩm",
            dataIndex: "product_name",
            key: "product_name",
            width: 140,
        },
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
                <InputNumber
                    min={1}
                    max={record.available_quantity}
                    value={record.quantity}
                    onChange={(value) => updateQuantity(record.product_id, value)}
                    className="w-14"
                />
            ),
        },
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
            render: (_, record) =>
                formatCurrency(
                    record.product_retail_price * record.quantity -
                    (record.discountAmount || 0)
                ),
        },
        {
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
    ];

    if (loading) {
        return <Spin size="large" className="flex justify-center mt-10" />;
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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">
                    {mode === 'edit' && `Chỉnh sửa đơn hàng #${order?.order_code}`}
                </h1>
            </div>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={{
                    order_date: mode === 'create' ? null : dayjs(order?.order_date),
                    warehouse_id: mode === 'edit' ? order?.warehouse_id : null
                }}
            >
                <div className="grid grid-cols-3 gap-4 mb-10 pb-10">
                    <div className="col-span-2">
                        {/* Product selection by warehouse */}
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
                                        disabled={mode === 'edit' && selectedProducts.length > 0}
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

                        {/* Selected products */}
                        {selectedProducts.length > 0 && (
                            <div className="rounded-lg p-4 bg-white">
                                <div className="font-medium mb-2">Sản phẩm đã chọn</div>
                                <Table
                                    columns={selectedProductColumns}
                                    dataSource={selectedProducts}
                                    rowKey="product_id"
                                    size="small"
                                    pagination={false}
                                />
                            </div>
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
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {customers?.map((customer) => (
                                            <Option
                                                key={customer.customer_id}
                                                value={customer.customer_id}
                                            >
                                                {customer.customer_name} - {customer.phone}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Button
                                    type="primary"
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    + Thêm
                                </Button>

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
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
                            >
                                <Input variant="filled" placeholder="Số nhà, tên đường..." />
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
                                        variant="filled"
                                        className="w-full"
                                        format="DD/MM/YYYY"
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
                                    <Select placeholder="Chọn phương thức" variant="filled">
                                        <Option value="Chuyển khoản">Chuyển khoản</Option>
                                        <Option value="COD">COD</Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item name="note" label="Ghi chú">
                                <TextArea placeholder="Ghi chú" variant="filled" rows={2} />
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
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        onChange={(value) => setShippingFee(value)}
                                    />
                                </Form.Item>

                                <Form.Item name="discount_amount" label="Giảm giá đơn hàng">
                                    <InputNumber
                                        variant="filled"
                                        addonAfter="₫"
                                        placeholder="Nhập phí giảm giá"
                                        className="w-full"
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        onChange={(value) => setOrderDiscount(value)}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item name="transfer_amount" label="Tiền chuyển khoản">
                                <InputNumber
                                    variant="filled"
                                    addonAfter="₫"
                                    placeholder="Nhập số tiền chuyển khoản"
                                    className="w-full"
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                    onChange={(value) => setTransferAmount(value)}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {selectedProducts.length !== 0 && (
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
                    <div>
                        <Text style={{ color: "red" }}>
                            COD: {formatCurrency(calculateFinalAmount() - transferAmount)}
                        </Text>
                    </div>
                </div>

                {/* Right side - actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag color="cyan" style={{ fontSize: 14 }}>
                        Trạng thái: <Text strong>Mới</Text>
                    </Tag>
                    <Button onClick={() => navigate("/orders")} className="mr-2">
                        Hủy
                    </Button>
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
            </div>
        </div>
    );
};

export default OrderFormData;