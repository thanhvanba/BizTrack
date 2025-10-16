import React from "react";
import { Tabs, Card } from "antd";
import { useNavigate } from "react-router-dom";
import SupplierInfoTab from "./SupplierInfoTab";
import SupplierSaleReturnTab from "./SupplierSaleReturnTab";
import SupplierPayablesTab from "./SupplierPayablesTab";
import useToastNotify from "../../utils/useToastNotify";
import { hasPermission } from "../../utils/permissionHelper";
import { useSelector } from "react-redux";

const ExpandedSupplierTabs = ({ setEditModalVisible, setDeleteModalVisible, setSelectedSupplier, record, fetchSuppliers }) => {
    console.log("🚀 ~ ExpandedSupplierTabs ~ record:", record)
    const navigate = useNavigate();
    const permissions = useSelector(state => state.permission.permissions.permissions)

    const handlePurchaseClick = (purchaseRecord) => {
        console.log("Clicked purchase order:", purchaseRecord);

        if (purchaseRecord.type === 'supplier_return') {
            // Đây là đơn hàng trả, chuyển đến trang supplier_return với expand
            navigate(`/purchase-return?expand=${purchaseRecord.order_id}`);
            useToastNotify(`Đang mở chi tiết đơn trả hàng: ${purchaseRecord.code}`, "info");
        } else if (purchaseRecord.order_id) {
            // Navigate to purchase management page with expand parameter
            navigate(`/purchase?expand=${purchaseRecord.order_id}`);
            useToastNotify(`Đang mở chi tiết đơn nhập hàng: ${purchaseRecord.order_code}`, "info");
        } else {
            useToastNotify(`Không thể mở chi tiết đơn nhập hàng: ${purchaseRecord.order_code}`, "error");
        }
    };
    const tabItems = ([
        hasPermission(permissions, 'supplier.readById') && {
            key: "info",
            label: "Thông tin",
            children: <SupplierInfoTab setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedSupplier={setSelectedSupplier} supplierData={record} />,
        },
        hasPermission(permissions, 'supplier.getSupplierPOHistory') && {
            key: "sale_return",
            label: "Lịch sử nhập/trả hàng",
            children: <SupplierSaleReturnTab supplierId={record.supplier_id} onPurchaseClick={handlePurchaseClick} />,
        },
        hasPermission(permissions, 'supplier.getSupplierTransactionLedger') && {
            key: "debt",
            label: "Nợ cần trả nhà cung cấp",
            children: <SupplierPayablesTab supplierData={record} fetchSuppliers={fetchSuppliers} />,
        },
    ]).filter(Boolean)

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedSupplierTabs;
