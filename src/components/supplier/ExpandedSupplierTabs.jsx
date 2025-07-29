import React from "react";
import { Tabs, Card } from "antd";
import SupplierInfoTab from "./SupplierInfoTab";
import SupplierSaleReturnTab from "./SupplierSaleReturnTab";
import SupplierPayablesTab from "./SupplierPayablesTab";

const ExpandedSupplierTabs = ({ setEditModalVisible, setDeleteModalVisible, setSelectedSupplier, record, fetchSuppliers }) => {
    console.log("🚀 ~ ExpandedSupplierTabs ~ record:", record)
    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <SupplierInfoTab setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedSupplier={setSelectedSupplier} supplierData={record} />,
        },
        {
            key: "sale_return",
            label: "Lịch sử nhập/trả hàng",
            children: <SupplierSaleReturnTab supplierId={record.supplier_id} />,
        },
        {
            key: "debt",
            label: "Nợ cần trả nhà cung cấp",
            children: <SupplierPayablesTab supplierData={record} fetchSuppliers={fetchSuppliers} />,
        },
    ];

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedSupplierTabs;
