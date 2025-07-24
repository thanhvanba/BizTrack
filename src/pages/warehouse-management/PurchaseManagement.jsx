import { useEffect, useState } from "react"
import PurchaseOrderList from "../../components/purchase/PurchaseOrderList"
import PurchaseOrderForm from "../../components/purchase/PurchaseOrderForm"
import { useDispatch, useSelector } from "react-redux"
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice"
import purchaseOrderService from "../../service/purchaseService"
import { useLocation, useSearchParams } from "react-router-dom"
import useToastNotify from "../../utils/useToastNotify"
import { Tabs, Typography } from "antd"
const { TabPane } = Tabs;
const { Title } = Typography
export default function PurchaseManagement() {
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") || "list";

    const [activeTab, setActiveTab] = useState(initialTab)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

    const isReturnPage = location.pathname.includes('purchase-return');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
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

    const fetchPurchaseOrder = async () => {
        setLoading(true)
        try {
            const res = await purchaseOrderService.getAllPurchaseOrders()
            if (res && res.data) {
                setPurchaseOrders(res.data)
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
            await purchaseOrderService.createReturn(data);
            useToastNotify("Tạo đơn trả hàng nhập thành công", "success");
            fetchPurchaseReturn();
            setActiveTab("list");
        } catch (error) {
            useToastNotify("Có lỗi khi tạo đơn trả hàng nhập", "error");
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
    const fetchPurchaseReturn = async () => {
        setLoading(true);
        try {
            const res = await purchaseOrderService.getReturns();
            if (res && res.data) {
                setPurchaseOrders(res.data);
            } else {
                useToastNotify("Không thể tải danh sách đơn trả hàng nhập", 'error');
            }
        } catch (error) {
            useToastNotify("Lỗi khi tải danh sách đơn trả hàng nhập", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isReturnPage) {
            fetchPurchaseReturn();
        } else {
            fetchPurchaseOrder();
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
                            />
                        )}
                    </TabPane>
                    <TabPane tab={`${isReturnPage ? "Tạo đơn trả hàng nhập" : "Tạo đơn nhập hàng"}`} key="form">
                        {activeTab === "form" && (
                            <PurchaseOrderForm
                                onSubmit={isReturnPage ? handleCreatePurchaseReturn : handleCreatePurchaseOrder}
                                initialValues={selectedOrder}
                                onCancel={handleCancelEdit}
                            />
                        )}
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
