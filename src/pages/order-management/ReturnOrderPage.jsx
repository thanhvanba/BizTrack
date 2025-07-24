import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Input, Tag } from 'antd';
import './index.css'; // file này cần chứa tailwind directives
import ExpandedOrderTabs from '../../components/order/ExpandedOrderTabs';
import ReturnInvoiceModal from '../../components/modals/ReturnInvoiceModal';
import { useNavigate } from 'react-router-dom';
import useToastNotify from '../../utils/useToastNotify';
import orderService from '../../service/orderService';
import formatPrice from '../../utils/formatPrice';
import LoadingLogo from '../../components/LoadingLogo';

const { Search } = Input;


const ReturnOrderPage = () => {
    const [expandedRowKeys, setExpandedRowKeys] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingApprove, setLoadingApprove] = useState(false)
    const [open, setOpen] = useState(false);
    const [ordersReturnData, setOrdersReturnData] = useState([]);
    console.log("🚀 ~ ReturnOrderPage ~ ordersReturnData:", ordersReturnData)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const navigate = useNavigate()

    const showActionColumn = ordersReturnData.some(order => order.status === 'pending');

    const columns = useMemo(() => {
        const baseCols = [
            {
                title: 'Mã trả hàng', dataIndex: 'return_id', key: 'return_id',
                render: (val) => { return "TH-" + val.slice(0, 8); }
            },
            { title: 'Người bán', dataIndex: 'seller', key: 'seller' },
            {
                title: 'Thời gian',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date) => new Date(date).toLocaleString("vi-VN"),
            },
            { title: 'Khách hàng', dataIndex: 'customer_name', key: 'customer_name' },
            {
                title: 'Tổng tiền',
                dataIndex: 'total_refund',
                key: 'total_refund',
                align: 'right',
                render: (value) => formatPrice(value ?? 0),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                    const color =
                        status === 'completed'
                            ? 'green'
                            : status === 'pending'
                                ? 'orange'
                                : 'red';
                    const text =
                        status === 'completed'
                            ? 'Đã trả'
                            : status === 'pending'
                                ? 'Đang xử lý'
                                : 'Không thành công';

                    return <Tag color={color}>{text}</Tag>;
                },
            },
        ];

        if (showActionColumn) {
            baseCols.push({
                title: 'Thao tác',
                key: 'action',
                render: (_, record) =>
                    record.status === 'pending' ? (
                        <Button
                            type="link"
                            style={{ color: '#52c41a' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(record);
                            }}
                        >
                            Phê duyệt
                        </Button>
                    ) : null,
            });
        }

        return baseCols;
    }, [showActionColumn]);

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
                {
                    page,
                    limit,
                    ...params,
                }
            );
            setOrdersReturnData(
                response?.data
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

    const handleApproveReturnOrder = async (return_id) => {
        setLoadingApprove(true);
        try {
            await orderService.approveReturn(return_id)
            useToastNotify("Duyệt đơn trả hàng thành công", 'success')
            fetchOrdersReturn()
        } catch (error) {
            useToastNotify("Lỗi khi duyệt đơn trả hàng", 'error')
        } finally {
            setLoadingApprove(false);
        }
    }

    const handleApprove = (orderReturn) => {
        if (confirm(`Bạn có chắc chắn muốn phê duyệt đơn trả hàng ${orderReturn.return_id}?`)) {
            handleApproveReturnOrder(orderReturn.return_id)
        }
    }
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
                rowKey="return_id"
                dataSource={ordersReturnData}
                loading={(loading || loadingApprove) ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
                columns={columns}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                            <ExpandedOrderTabs record={record} />
                        </div>
                    ),
                    expandedRowKeys,
                    onExpand: (expanded, record) => {
                        setExpandedRowKeys(expanded ? [record.return_id] : []);
                    },
                }}
                onRow={(record) => ({
                    onClick: () => toggleExpand(record.return_id),
                    className: "cursor-pointer",
                })}
                rowClassName={(record) =>
                    expandedRowKeys.includes(record.return_id)
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
