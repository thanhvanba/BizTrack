import React from "react";
import { Tabs, Card } from "antd";
import CustomerInfoTab from "./CustomerInfoTab";
import CustomerSaleReturnTab from "./CustomerSaleReturnTab";
import CustomerReceivablesTab from "./CustomerReceivablesTab";

const ExpandedCustomerTabs = ({ setEditModalVisible, setDeleteModalVisible, setSelectedCustomer, record }) => {
    console.log("🚀 ~ ExpandedCustomerTabs ~ record:", record)
    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <CustomerInfoTab setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedCustomer={setSelectedCustomer} customerData={record} />,
        },
        {
            key: "sale_return",
            label: "Lịch sử bán/trả hàng",
            children: <CustomerSaleReturnTab />,
        },
        {
            key: "debt",
            label: "Nợ cần thu từ khách",
            children: <CustomerReceivablesTab />,
        },
    ];

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedCustomerTabs;
