import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Tag } from 'antd';
import './index.css'; // file này cần chứa tailwind directives
import ExpandedOrderTabs from '../../components/order/ExpandedOrderTabs';
import ReturnInvoiceModal from '../../components/modals/ReturnInvoiceModal';
import { useNavigate } from 'react-router-dom';
import useToastNotify from '../../utils/useToastNotify';
import orderService from '../../service/orderService';
import formatPrice from '../../utils/formatPrice';

const { Search } = Input;

const dataSource = [
    {
        key: '1',
        order_id: "27413d44-5245-427b-8841-4ffe3c1076b2",
        returnCode: 'TH000006',
        seller: 'Hoàng Nam Quang',
        time: '21/06/2025 10:36',
        customer: 'Phạm Văn Bạch',
        amountToReturn: '3,141,000',
        amountReturned: '1,596,000',
        status: 'Success',
    },
    // thêm các dòng dữ liệu khác ở đây...
];

const columns = [
    { title: 'Mã trả hàng', dataIndex: 'order_code', key: 'order_code' },
    { title: 'Người bán', dataIndex: 'seller', key: 'seller' },
    {
        title: 'Thời gian', dataIndex: 'created_at', key: 'created_at',
        render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    { title: 'Khách hàng', dataIndex: 'customer_name', key: 'customer_name' },
    {
        title: 'Tổng tiền',
        dataIndex: 'total_refund',
        key: 'total_refund',
        align: 'right',
        render: (value) => (formatPrice(value) ?? 0),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            const color = status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red';
            return <Tag color={color}>{status === 'completed' ? 'Đã trả' : status === 'pending' ? 'Đang xử lý' : 'Không thành công'}</Tag>;
        },
        // render: (text) => <span className="text-green-600">{text}</span>,
    },
];

const ReturnOrderPage = () => {
    const [expandedRowKeys, setExpandedRowKeys] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [loading, setLoading] = useState([])
    const [open, setOpen] = useState(false);
    const [ordersReturnData, setOrdersReturnData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const navigate = useNavigate()
    const toggleExpand = (key) => {
        if (expandedRowKeys.includes(key)) {
            setExpandedRowKeys([])
        } else {
            setExpandedRowKeys([key])
        }
    }

    const handleSelectInvoice = (invoice) => {
        navigate(`/return-order/${invoice.order_id}`)
        setOpen(false);
    };

    const fetchOrdersReturn = async ({ page = pagination.current, limit = pagination.pageSize, params = {} } = {}) => {
        setLoading(true);
        try {
            const response = await orderService.getReturns(
                // {
                //     page,
                //     limit,
                //     ...params,
                // }
            );
            setOrdersReturnData(
                response?.data?.map((order) => ({
                    ...order,
                    key: order.order_id,
                }))
            );

            if (response?.data.pagination) {
                setPagination({
                    current: response?.pagination.page,
                    pageSize: response?.pagination.limit,
                    total: response?.pagination.total,
                });
            }
        } catch (error) {
            useToastNotify("Không thể tải danh sách đơn trả hàng.", "error");
        } finally {
            setLoading(false);
        }
    };

    //HÀM XỬ LÝ CHUYỂN TRANG
    const handleTableChange = (newPagination) => {
        const params = {};
        if (Number(orderStatus) !== -1) {
            params.order_status = orderStatus;
        }
        fetchOrdersReturn({
            page: newPagination.current,
            limit: newPagination.pageSize,
            params,
        });
    };

    useEffect(() => {
        fetchOrdersReturn();
    }, []);

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-4">
                <Search placeholder="Tìm theo mã phiếu trả" style={{ width: 220 }} />
                <div className="flex gap-3">
                    <Button type="primary" onClick={() => setOpen(true)} >Trả hàng</Button>
                    <Button>Xuất file</Button>
                </div>
            </div>
            <ReturnInvoiceModal visible={open} onClose={() => setOpen(false)} onSelect={handleSelectInvoice} />
            <Table
                dataSource={ordersReturnData}
                columns={columns}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                            <ExpandedOrderTabs record={record} />
                        </div>
                    ),
                    expandedRowKeys,
                    onExpand: (expanded, record) => {
                        setExpandedRowKeys(expanded ? [record.key] : []);
                    },
                }}
                onRow={(record) => ({
                    onClick: () => toggleExpand(record.key),
                    className: "cursor-pointer",
                })}
                rowClassName={(record) =>
                    expandedRowKeys.includes(record.key)
                        ? "border-x-2 border-t-2 border-blue-500 !border-collapse z-10 bg-blue-50 rounded-md shadow-sm"
                        : "hover:bg-gray-50 transition-colors"
                }
                onChange={handleTableChange}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Không có đơn hàng nào" }}
            />
        </div>
    );
};

export default ReturnOrderPage;
