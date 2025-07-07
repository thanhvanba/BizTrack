import React, { useEffect, useState } from "react";
import { Tabs, Card, Spin } from "antd";
import OrderInfoTab from "./OrderInfoTab";
import orderDetailService from "../../service/orderDetailService";
import useToastNotify from "../../utils/useToastNotify";
import OrderReturnHistoryTab from "./OrderReturnHistoryTab";
import PaymentHistory from "./PaymentHistory";
import { useLocation } from "react-router-dom";
import orderService from "../../service/orderService";

const ExpandedOrderTabs = ({ record, onUpdateOrderStatus }) => {
    console.log("🚀 ~ ExpandedOrderTabs ~ record:", record)
    const location = useLocation();
    const [orderInfo, setOrderInfo] = useState({});
    const [returnOrder, setReturnOrder] = useState({});
    const [loading, setLoading] = useState(true);
    console.log("🚀 ~ ExpandedOrderTabs ~ orderInfo:", orderInfo)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                let response;
                let res;

                if (location.pathname.includes('return-order')) {
                    response = await orderService.getReturnById(record?.return_id);
                } else {
                    response = await orderDetailService.getOrderDetailById(record?.order_id);
                    res = await orderDetailService.getOrderDetailSummaryById(record?.order_id);
                }

                setOrderInfo({
                    ...response,
                    ...(res?.data && {
                        remaining_value: res.data.remaining_value,
                        total_refund: res.data.total_refund
                    })
                });
            } catch (error) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error);
                useToastNotify("Không thể tải danh sách sản phẩm.", "error");
            } finally {
                setLoading(false);
            }
        };
        const fetchReturnOrderByOrderId = async () => {
            try {
                const response = await orderService.getReturns({ order_id: record?.order_id })

                setReturnOrder(response?.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách trả hàng:", error);
                useToastNotify("Không thể tải danh sách sản phẩm.", "error");
            }
        }
        fetchOrderDetails()
        !location.pathname.includes('return-order') &&
            fetchReturnOrderByOrderId()
    }, [])

    const tabItems = location.pathname.includes('return-order')
        ? [
            {
                key: "info",
                label: "Thông tin",
                children: <OrderInfoTab orderData={orderInfo} onUpdateOrderStatus={onUpdateOrderStatus} record={record} />,
            },
        ]
        : [
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
            {
                key: "sale_return",
                label: "Lịch sử trả hàng",
                children: <OrderReturnHistoryTab returnOrderData={returnOrder} />,
            },
        ];

    return (
        <div className="bg-white p-6 py-4 rounded-md shadow-sm">
            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Spin />
                </div>
            ) : (
                <Tabs items={tabItems} className="mb-6" />
            )}
        </div>
    );
};

export default ExpandedOrderTabs;
