import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import purchaseOrderService from "../../service/purchaseService";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissionHelper";
import { useLocation } from "react-router-dom";

const ExpandedPurchaseOrderTabs = ({ record }) => {
    const [selectedOrder, setSelectedOrder] = useState();
    const mockWarehouses = useSelector(state => state.warehouse.warehouses.data);
    const permissions = useSelector(state => state.permission.permissions.permissions)
    const location = useLocation();
    const isReturnPage = location.pathname.includes('purchase-return');

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

    const tabItems = ([
        (hasPermission(permissions, 'purchase.readById') && !isReturnPage) && {
            key: "info",
            label: "Thông tin",
            children: <PurchaseOrderDetail order={selectedOrder} />,
        },

        (hasPermission(permissions, 'purchase.readReturnById') && isReturnPage) && {
            key: "info",
            label: "Thông tin",
            children: <PurchaseOrderDetail order={selectedOrder} />,
        },]).filter(Boolean);
    return (
        <div className="bg-white p-6 py-4 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedPurchaseOrderTabs; 