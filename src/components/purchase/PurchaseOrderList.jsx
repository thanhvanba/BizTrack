import { useState } from "react"
import PurchaseOrderDetail from "./PurchaseOrderDetail"
import { useSelector } from "react-redux"
import purchaseOrderService from "../../service/purchaseService";

export default function PurchaseOrderList({ purchaseOrders, onEdit, onApprove, onCreateNew }) {

  const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

  const warehouseMap = new Map(
    mockWarehouses?.map(wh => [wh.warehouse_id, wh.warehouse_name])
  );

  const [searchText, setSearchText] = useState("")
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleViewDetail = async (id) => {
    const res = await purchaseOrderService.getPurchaseOrderDetail(id)

    if (res && res.data) {
      const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id)

      const dataWithWarehouseName = {
        ...res.data,
        warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
      }

      setSelectedOrder(dataWithWarehouseName)
      setDetailVisible(true)
    }
  }

  const handleApprove = (order) => {
    if (confirm(`Bạn có chắc chắn muốn phê duyệt đơn nhập hàng ${order.po_id}?`)) {
      onApprove(order.po_id)
    }
  }

  // const filteredOrders = purchaseOrders.filter(
  //   (order) =>
  //     order.po_id.toLowerCase().includes(searchText.toLowerCase()) ||
  //     order.supplier_name.toLowerCase().includes(searchText.toLowerCase()),
  // )
  const filteredOrders = purchaseOrders.map(po => ({
    ...po,
    warehouse_name: warehouseMap.get(po.warehouse_id) || 'Unknown',
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tìm kiếm theo mã đơn hoặc nhà cung cấp"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Tạo đơn nhập hàng
        </button>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Mã đơn
              </th>
              <th scope="col" className="py-3 px-6">
                Nhà cung cấp
              </th>
              <th scope="col" className="py-3 px-6">
                Kho
              </th>
              <th scope="col" className="py-3 px-6">
                Trạng thái
              </th>
              <th scope="col" className="py-3 px-6">
                Ngày phê duyệt
              </th>
              <th scope="col" className="py-3 px-6">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.po_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-4 px-6">{order.po_id}</td>
                  <td className="py-4 px-6">{order.supplier_name}</td>
                  <td className="py-4 px-6">{order.warehouse_name}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "draft" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                      {order.status === "draft" ? "Nháp" : "Đã phê duyệt"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {order.posted_at ? new Date(order.posted_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(order.po_id)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Chi tiết
                      </button>
                      {order.status === "draft" && (
                        <>
                          <button onClick={() => onEdit(order)} className="font-medium text-blue-600 hover:underline">
                            Sửa
                          </button>
                          <button
                            onClick={() => handleApprove(order)}
                            className="font-medium text-green-600 hover:underline"
                          >
                            Phê duyệt
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-white border-b">
                <td colSpan={6} className="py-4 px-6 text-center">
                  Không có đơn nhập hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailVisible && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chi tiết đơn nhập hàng: {selectedOrder.po_id}</h3>
              <button onClick={() => setDetailVisible(false)} className="text-gray-500 hover:text-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <PurchaseOrderDetail order={selectedOrder} />
          </div>
        </div>
      )}
    </div>
  )
}
