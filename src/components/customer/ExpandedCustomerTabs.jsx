import React from "react";
import { Tabs, Card } from "antd";
import CustomerInfoTab from "./CustomerInfoTab";
import CustomerSaleReturnTab from "./CustomerSaleReturnTab";
import CustomerOrderTab from "./CustomerOrderTab";
import CustomerReceivablesTab from "./CustomerReceivablesTab";

const ExpandedCustomerTabs = ({ record }) => {
    console.log("🚀 ~ ExpandedCustomerTabs ~ record:", record)
    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <CustomerInfoTab customerData={record} />,
        },
        {
            key: "sale_return",
            label: "Lịch sử bán/trả",
            children: <CustomerSaleReturnTab />,
        },
        {
            key: "orders",
            label: "Lịch sử đơn hàng",
            children: <CustomerOrderTab />,
        },
        {
            key: "debt",
            label: "Công nợ cần thu",
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
