import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import purchaseOrderService from "../../service/purchaseService";
import { useSelector } from "react-redux";

const ExpandedPurchaseOrderTabs = ({ record }) => {
    const [selectedOrder, setSelectedOrder] = useState();
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data);

    useEffect(() => {
        const handleViewDetail = async () => {
            if (record?.po_id) {
                const res = await purchaseOrderService.getPurchaseOrderDetail(record.po_id);
                if (res && res.data) {
                    const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id);
                    const dataWithWarehouseName = {
                        ...res.data,
                        warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
                    };
                    setSelectedOrder(dataWithWarehouseName);
                }
            } else if (record?.return_id) {
                const res = await purchaseOrderService.getReturnById(record.return_id);
                console.log("🚀 ~ handleViewDetail ~ res:", res)
                if (res && res.data) {
                    const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.details[0]?.warehouse_id);
                    const dataWithWarehouseName = {
                        ...res.data,
                        warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
                    };
                    setSelectedOrder(dataWithWarehouseName);
                }
            }
        };
        handleViewDetail();
    }, [record, mockWarehouses]);

    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <PurchaseOrderDetail order={selectedOrder} />,
        },
        // Có thể thêm các tab khác ở đây nếu muốn
    ];
    return (
        <div className="bg-white p-6 py-4 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedPurchaseOrderTabs; 