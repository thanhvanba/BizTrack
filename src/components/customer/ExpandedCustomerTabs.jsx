import React, { useEffect, useState } from "react";
import { Tabs, Card } from "antd";
import CustomerInfoTab from "./CustomerInfoTab";
import CustomerSaleReturnTab from "./CustomerSaleReturnTab";
import CustomerReceivablesTab from "./CustomerReceivablesTab";
import orderService from "../../service/orderService";
import customerService from "../../service/customerService";

const ExpandedCustomerTabs = ({ setEditModalVisible, setDeleteModalVisible, setSelectedCustomer, record }) => {
    const [loading, setLoading] = useState(true);
    const [returnOrder, setReturnOrder] = useState({});
    const [dataSource, setDataSource] = useState([]);      

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [orderHistoryRes, returnOrderRes] = await Promise.all([
                    customerService.getCustomerOrderHistory(record?.customer_id),
                    orderService.getReturns({ customer_id: record?.customer_id }),
                ]);

                const orderData = orderHistoryRes.data?.map(order => ({
                    code: order.order_code,
                    date: new Date(order.created_at).toLocaleString("vi-VN"),
                    performer: order.customer_name || "Không rõ",
                    total: parseFloat(order.final_amount),
                    status: order.order_status,
                    type: "order",
                }));

                const returnData = returnOrderRes.data?.map(ret => ({
                    code: "TH-" + ret.return_id.slice(0, 8),
                    date: new Date(ret.created_at).toLocaleString("vi-VN"),
                    performer: ret.customer_name || "Không rõ",
                    total: -parseFloat(ret.total_refund),
                    status: "Đã trả",
                    type: "return",
                }));

                const mergedData = [...(orderData || []), ...(returnData || [])].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );

                setDataSource(mergedData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                useToastNotify("Không thể tải dữ liệu khách hàng.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <CustomerInfoTab setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedCustomer={setSelectedCustomer} customerData={record} />,
        },
        {
            key: "sale_return",
            label: "Lịch sử bán/trả hàng",
            children: <CustomerSaleReturnTab dataSource={dataSource} />,
        },
        {
            key: "debt",
            label: "Nợ cần thu từ khách",
            children: <CustomerReceivablesTab customerData={record} />,
        },
    ];

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedCustomerTabs;
