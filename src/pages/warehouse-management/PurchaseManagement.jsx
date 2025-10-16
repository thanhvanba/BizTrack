import { useEffect, useState } from "react"
import PurchaseOrderList from "../../components/purchase/PurchaseOrderList"
import PurchaseOrderForm from "../../components/purchase/PurchaseOrderForm"
import { useDispatch, useSelector } from "react-redux"
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice"
import purchaseOrderService from "../../service/purchaseService"
import { useLocation, useSearchParams } from "react-router-dom"
import useToastNotify from "../../utils/useToastNotify"
import { Tabs, Typography } from "antd"
import { hasPermission } from "../../utils/permissionHelper"
const { TabPane } = Tabs;
const { Title } = Typography
export default function PurchaseManagement() {
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") || "list";

    const [activeTab, setActiveTab] = useState(initialTab)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    console.log("🚀 ~ PurchaseManagement ~ purchaseOrders:", purchaseOrders)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paginationPurchase, setPaginationPurchase] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [paginationReturn, setPaginationReturn] = useState({
        current: 1,
        pageSize: 3,
        total: 0,
    });

    const dispatch = useDispatch()
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

    const permissions = useSelector(state => state.permission.permissions.permissions)

    const isReturnPage = location.pathname.includes('purchase-return');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    // Handle expand parameter from URL
    useEffect(() => {
        const expandId = searchParams.get('expand');
        if (expandId) {
            const fetchOrderToExpand = async () => {
                try {
                    let orderData;
                    if (isReturnPage) {
                        orderData = await purchaseOrderService.getReturnById(expandId);
                        console.log("🚀 ~ fetchReturnOrderToExpand ~ orderData:", orderData);
                    } else {
                        orderData = await purchaseOrderService.getPurchaseOrderDetail(expandId);
                        console.log("🚀 ~ fetchPurchaseOrderToExpand ~ orderData:", orderData);
                    }

                    if (orderData) {
                        const normalized = isReturnPage
                            ? normalizeReturnOrder(orderData.data ? orderData.data : orderData, expandId)
                            : normalizePurchaseOrder(orderData.data ? orderData.data : orderData);
                        console.log("🚀 ~ fetchOrderToExpand ~ normalized:", normalized)
                        setPurchaseOrders([normalized]); // Only show the expanded order
                        setActiveTab("list"); // Switch to list tab
                    }
                } catch (error) {
                    console.error("Error fetching order:", error);
                    useToastNotify("Không thể mở chi tiết đơn hàng.", "error");
                }
            };
            fetchOrderToExpand();
        } else {
            if (isReturnPage) {
                fetchPurchaseReturn();
            } else {
                fetchPurchaseOrder();
            }
        }
    }, [searchParams, isReturnPage]);

    const normalizePurchaseOrder = (order) => {
        if (!order) return order;
        return {
            ...order,
            po_id: order.po_id || order.id,
            order_code: order.order_code,
            supplier_name: order.supplier_name,
            warehouse_id: order.warehouse_id,
            status: order.status,
            created_at: order.created_at,
            posted_at: order.posted_at,
        };
    };

    const normalizeReturnOrder = (ret, expandId) => {
        if (!ret) return ret;
        const source = ret.data ? ret.data : ret;
        return {
            ...source,
            return_id: source.return_id || source.id || expandId,
            supplier_name: source.supplier_name,
            warehouse_id: source.warehouse_id,
            status: source.status,
            created_at: source.created_at,
        };
    };

    // Đơn nhập hàng
    const handleCreatePurchaseOrder = async (order) => {
        try {
            if (selectedOrder) {
                await purchaseOrderService.updatePurchaseOrder(selectedOrder.po_id, order)
                useToastNotify("Cập nhật đơn nhập hàng thành công", 'success')
            } else {
                await purchaseOrderService.createPurchaseOrder(order)
                useToastNotify("Tạo đơn nhập hàng thành công", 'success')
            }
            fetchPurchaseOrder()
            setActiveTab("list")
        } catch (error) {
            useToastNotify("Có lỗi xảy ra khi lưu đơn nhập hàng", 'error')
        }
    }

    const handleEditPurchaseOrder = async (order) => {
        try {
            const res = await purchaseOrderService.getPurchaseOrderDetail(order.po_id)

            if (res && res.data) {
                const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id)

                const dataWithWarehouseName = {
                    ...res.data,
                    warehouse_name: warehouse ? warehouse.warehouse_name : "Không rõ"
                }
                // useToastNotify("Cập nhật đơn hàng thành công", 'success')
                setSelectedOrder(dataWithWarehouseName)
                setActiveTab("form")
            } else {
                useToastNotify("Không tìm thấy thông tin đơn hàng", 'error')
            }
        } catch (error) {
            useToastNotify("Lỗi khi tải thông tin đơn nhập hàng", 'error')
        }
    }

    const handleApprovePurchaseOrder = async (orderId) => {
        try {
            await purchaseOrderService.ApprovePO(orderId)
            useToastNotify("Duyệt đơn nhập hàng thành công", 'success')
            setPurchaseOrders(
                purchaseOrders.map(order =>
                    order.po_id === orderId
                        ? { ...order, status: "posted", posted_at: new Date().toISOString() }
                        : order
                )
            )
        } catch (error) {
            useToastNotify("Lỗi khi duyệt đơn nhập hàng", 'error')
        }
    }

    const handleCancelEdit = () => {
        setSelectedOrder(null)
        setActiveTab("list")
    }

    const fetchPurchaseOrder = async (page = paginationPurchase.current, limit = paginationPurchase.pageSize) => {
        setLoading(true)
        try {
            const res = await purchaseOrderService.getAllPurchaseOrders({ page, limit });
            if (res && res.data) {
                setPurchaseOrders(res.data)
                if (res.pagination) {
                    setPaginationPurchase({
                        current: res.pagination.currentPage || res.pagination.page,
                        pageSize: res.pagination.pageSize,
                        total: res.pagination.total,
                    });
                }
            } else {
                useToastNotify("Không thể tải danh sách đơn nhập hàng", 'error')
            }
        } catch (error) {
            useToastNotify("Lỗi khi tải danh sách đơn nhập hàng", 'error')
        } finally {
            setLoading(false)
        }
    }

    // Đơn trả hàng nhập
    const handleCreatePurchaseReturn = async (data) => {
        try {
            const res = await purchaseOrderService.createReturn(data);
            useToastNotify(`${res.message}`, "success");
            fetchPurchaseReturn();
            setActiveTab("list");
        } catch (error) {
            useToastNotify(`${error.response.data.message}`, "error");
        }
    };
    const handleEditPurchaseReturn = async (returnId, data) => {
        try {
            await purchaseOrderService.updateReturn(returnId, data);
            useToastNotify("Cập nhật đơn trả hàng nhập thành công", "success");
            fetchPurchaseReturn();
            setActiveTab("list");
        } catch (error) {
            useToastNotify("Có lỗi khi cập nhật đơn trả hàng nhập", "error");
        }
    };
    const handleDeletePurchaseReturn = async (returnId) => {
        try {
            await purchaseOrderService.deleteReturn(returnId);
            useToastNotify("Xóa đơn trả hàng nhập thành công", "success");
            fetchPurchaseReturn();
        } catch (error) {
            useToastNotify("Có lỗi khi xóa đơn trả hàng nhập", "error");
        }
    };
    // Duyệt đơn trả hàng nhập
    const handleApprovePurchaseReturn = async (returnId) => {
        try {
            await purchaseOrderService.approveReturn(returnId);
            useToastNotify("Duyệt đơn trả hàng nhập thành công", "success");
            fetchPurchaseReturn();
        } catch (error) {
            useToastNotify("Lỗi khi duyệt đơn trả hàng nhập", "error");
        }
    };
    // Lấy danh sách đơn trả hàng nhập
    const fetchPurchaseReturn = async (page = paginationReturn.current, limit = paginationReturn.pageSize) => {
        setLoading(true);
        try {
            const res = await purchaseOrderService.getReturns({ page, limit });
            if (res && res.data) {
                setPurchaseOrders(res.data);
                if (res.pagination) {
                    setPaginationReturn({
                        current: res.pagination.currentPage || res.pagination.page,
                        pageSize: res.pagination.pageSize,
                        total: res.pagination.total,
                    });
                }
            } else {
                useToastNotify("Không thể tải danh sách đơn trả hàng nhập", 'error');
            }
        } catch (error) {
            useToastNotify("Lỗi khi tải danh sách đơn trả hàng nhập", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (paginationInfo) => {
        const { current, pageSize } = paginationInfo;
        if (isReturnPage) {
            setPaginationReturn((prev) => ({ ...prev, current, pageSize }));
            fetchPurchaseReturn(current, pageSize);
        } else {
            setPaginationPurchase((prev) => ({ ...prev, current, pageSize }));
            fetchPurchaseOrder(current, pageSize);
        }
    };

    useEffect(() => {
        const expandId = searchParams.get('expand');
        // Only fetch all orders if there's no expand parameter
        if (!expandId) {
            if (isReturnPage) {
                fetchPurchaseReturn();
            } else {
                fetchPurchaseOrder();
            }
        }
        dispatch(fetchWarehouses());
    }, [isReturnPage]);
    return (
        <div className="max-w-7xl mx-auto">
            <Title
                level={2}
                className="text-xl md:text-2xl font-bold m-0 text-gray-800"
            >
                {isReturnPage ? 'Quản lý trả hàng nhập' : 'Quản lý nhập hàng'}
            </Title>

            <div className="bg-white p-4 rounded-lg shadow">
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <TabPane tab={`${isReturnPage ? 'Danh sách đơn trả hàng nhập' : 'Danh sách đơn nhập hàng'}`} key="list">
                        {activeTab === "list" && (
                            <PurchaseOrderList
                                loading={loading}
                                purchaseOrders={purchaseOrders}
                                onEdit={isReturnPage ? handleEditPurchaseReturn : handleEditPurchaseOrder}
                                onApprove={isReturnPage ? handleApprovePurchaseReturn : handleApprovePurchaseOrder}
                                onCreateNew={() => {
                                    setSelectedOrder(null)
                                    handleTabChange("form")
                                }}
                                onDelete={isReturnPage ? handleDeletePurchaseReturn : undefined}
                                pagination={isReturnPage ? paginationReturn : paginationPurchase}
                                onChange={handleTableChange}
                            />
                        )}
                    </TabPane>
                    {(hasPermission(permissions, 'purchase.return') && isReturnPage) &&
                        <TabPane tab="Tạo đơn trả hàng nhập" key="form">
                            {activeTab === "form" && (
                                <PurchaseOrderForm
                                    onSubmit={isReturnPage ? handleCreatePurchaseReturn : handleCreatePurchaseOrder}
                                    initialValues={selectedOrder}
                                    onCancel={handleCancelEdit}
                                />
                            )}
                        </TabPane>
                    }
                    {(hasPermission(permissions, 'purchase.create') && !isReturnPage) && <TabPane tab={"Tạo đơn nhập hàng"} key="form">
                        {activeTab === "form" && (
                            <PurchaseOrderForm
                                onSubmit={isReturnPage ? handleCreatePurchaseReturn : handleCreatePurchaseOrder}
                                initialValues={selectedOrder}
                                onCancel={handleCancelEdit}
                            />
                        )}
                    </TabPane>
                    }
                </Tabs>
            </div>
        </div>
    )
}
