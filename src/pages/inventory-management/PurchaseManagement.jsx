import { useEffect, useState } from "react"
import PurchaseOrderList from "../../components/purchase/PurchaseOrderList"
import PurchaseOrderForm from "../../components/purchase/PurchaseOrderForm"
import { useDispatch, useSelector } from "react-redux"
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice"
import purchaseOrderService from "../../service/purchaseService"

export default function PurchaseManagement() {
    const [activeTab, setActiveTab] = useState("list")
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)

    const dispatch = useDispatch()
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

    const handleCreatePurchaseOrder = async (order) => {
        if (selectedOrder) {
            await purchaseOrderService.updatePurchaseOrder(selectedOrder.po_id, order)
        } else {
            await purchaseOrderService.createPurchaseOrder(order)
        }
        fetchPurchaseOrder()
        setActiveTab("list")
    }

    const handleEditPurchaseOrder = async (order) => {
        const res = await purchaseOrderService.getPurchaseOrderDetail(order.po_id)

        if (res && res.data) {
            const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id)

            const dataWithWarehouseName = {
                ...res.data,
                warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
            }
            setSelectedOrder(dataWithWarehouseName)
            setActiveTab("form")
        }
    }

    const handleApprovePurchaseOrder = async (orderId) => {
        await purchaseOrderService.ApprovePO(orderId)
        setPurchaseOrders(
            purchaseOrders.map((order) =>
                order.po_id === orderId
                    ? {
                        ...order,
                        status: "posted",
                        posted_at: new Date().toISOString(),
                    }
                    : order,
            ),
        )
    }

    const handleCancelEdit = () => {
        setSelectedOrder(null)
        setActiveTab("list")
    }

    const fetchPurchaseOrder = async () => {
        const res = await purchaseOrderService.getAllPurchaseOrders()
        if (res && res.data) {
            setPurchaseOrders(res.data)
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
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "list"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Danh sách đơn nhập hàng
                        </button>
                        <button
                            onClick={() => setActiveTab("form")}
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
                            setActiveTab("form")
                        }}
                    />
                ) : (
                    <PurchaseOrderForm
                        onSubmit={handleCreatePurchaseOrder}
                        initialValues={selectedOrder}
                        onCancel={handleCancelEdit}
                    />
                )}
            </div>
        </div>
    )
}
