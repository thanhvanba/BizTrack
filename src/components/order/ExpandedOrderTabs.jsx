import React, { useEffect, useState } from "react";
import { Tabs, Card } from "antd";
import OrderInfoTab from "./OrderInfoTab";
import orderDetailService from "../../service/orderDetailService";
import useToastNotify from "../../utils/useToastNotify";
import OrderReturnHistoryTab from "./OrderReturnHistoryTab";
import PaymentHistory from "./PaymentHistory";
import { useLocation } from "react-router-dom";

const ExpandedOrderTabs = ({ record, onUpdateOrderStatus }) => {
    console.log("🚀 ~ ExpandedOrderTabs ~ record:", record)
    const location = useLocation();
    const [orderInfo, setOrderInfo] = useState({});
    console.log("🚀 ~ ExpandedOrderTabs ~ orderInfo:", orderInfo)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await orderDetailService.getOrderDetailById(record?.order_id);
                setOrderInfo(response);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error);
                useToastNotify("Không thể tải danh sách sản phẩm.", "error");
            }
        };

        fetchOrderDetails()
    }, [])

    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <OrderInfoTab orderData={orderInfo} onUpdateOrderStatus={onUpdateOrderStatus} />,
        },
        {
            key: "payment_history",
            label: "Lịch sử thanh toán",
            children: <PaymentHistory />,
        },
        location.pathname.includes('edit-order') &&
        {
            key: "sale_return",
            label: "Lịch sử trả hàng",
            children: <OrderReturnHistoryTab />,
        },
    ];

    return (
        <div className="bg-white p-6 py-4 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    );
};

export default ExpandedOrderTabs;
