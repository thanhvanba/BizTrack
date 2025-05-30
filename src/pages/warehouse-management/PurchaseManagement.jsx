import { useEffect, useState } from "react"
import PurchaseOrderList from "../../components/purchase/PurchaseOrderList"
import PurchaseOrderForm from "../../components/purchase/PurchaseOrderForm"
import { useDispatch, useSelector } from "react-redux"
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice"
import purchaseOrderService from "../../service/purchaseService"
import { useSearchParams } from "react-router-dom"
import useToastNotify from "../../utils/useToastNotify"
import { Tabs } from "antd"
const { TabPane } = Tabs;
export default function PurchaseManagement() {
    // const [searchParams, setSearchParams] = useSearchParams();
    // const initialTab = searchParams.get("tab") || "list";

    const [activeTab, setActiveTab] = useState('list')
    console.log("🚀 ~ PurchaseManagement ~ activeTab:", activeTab)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)

    const dispatch = useDispatch()
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // setSearchParams({ tab });
    };

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
        try {
            const res = await purchaseOrderService.getAllPurchaseOrders()
            if (res && res.data) {
                setPurchaseOrders(res.data)
            } else {
                useToastNotify("Không thể tải danh sách đơn nhập hàng", 'error')
            }
        } catch (error) {
            useToastNotify("Lỗi khi tải danh sách đơn nhập hàng", 'error')
        }
    }
    useEffect(() => {
        fetchPurchaseOrder()
        dispatch(fetchWarehouses());
    }, [])
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Quản lý kho</h1>

            <div className="bg-white p-4 rounded-lg shadow">
                {/* <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleTabChange("list")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "list"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Danh sách đơn nhập hàng
                        </button>
                        <button
                            onClick={() => handleTabChange("form")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "form"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {selectedOrder ? "Chỉnh sửa đơn nhập hàng" : "Tạo đơn nhập hàng"}
                        </button>
                    </nav>
                </div>

                {activeTab === "list" ? (
                    <PurchaseOrderList
                        purchaseOrders={purchaseOrders}
                        onEdit={handleEditPurchaseOrder}
                        onApprove={handleApprovePurchaseOrder}
                        onCreateNew={() => {
                            setSelectedOrder(null)
                            handleTabChange("form")
                        }}
                    />
                ) : (
                    <PurchaseOrderForm
                        onSubmit={handleCreatePurchaseOrder}
                        initialValues={selectedOrder}
                        onCancel={handleCancelEdit}
                    />
                )} */}

                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Danh sách đơn nhập hàng" key="list">
                        {activeTab === "list" && (
                            <PurchaseOrderList
                                purchaseOrders={purchaseOrders}
                                onEdit={handleEditPurchaseOrder}
                                onApprove={handleApprovePurchaseOrder}
                                onCreateNew={() => {
                                    setSelectedOrder(null)
                                    handleTabChange("form")
                                }}
                            />
                        )}
                    </TabPane>
                    <TabPane tab="Tạo đơn nhập hàng" key="form">
                        {activeTab === "form" && (
                            <PurchaseOrderForm
                                onSubmit={handleCreatePurchaseOrder}
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
