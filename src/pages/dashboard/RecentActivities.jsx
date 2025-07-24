import { Card, List, Typography } from "antd";
import { UndoOutlined, ShoppingCartOutlined, ExclamationCircleOutlined, HistoryOutlined } from "@ant-design/icons";

const { Text } = Typography;

const activities = [
    {
        id: 1,
        type: "return",
        user: "awe",
        value: 7798000,
        time: "7 phút trước",
        desc: "nhận trả hàng",
    },
    {
        id: 2,
        type: "sale",
        user: "awe",
        value: 7798000,
        time: "10 phút trước",
        desc: "bán đơn hàng",
    },
    {
        id: 3,
        type: "return",
        user: "awe",
        value: 899000,
        time: "21 giờ trước",
        desc: "nhận trả hàng",
    },
    {
        id: 4,
        type: "return",
        user: "awe",
        value: 5198000,
        time: "21 giờ trước",
        desc: "nhận trả hàng",
    },
    {
        id: 5,
        type: "sale",
        user: "awe",
        value: 7798000,
        time: "1 ngày trước",
        desc: "bán đơn hàng",
    },
];

const activityIcon = (type) => {
    if (type === "return") return <UndoOutlined className="text-blue-500 text-xl" />;
    if (type === "sale") return <ShoppingCartOutlined className="text-green-500 text-xl" />;
    return <ExclamationCircleOutlined className="text-yellow-500 text-xl" />;
};

export default function RecentActivities({ warning }) {
    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-lg font-semibold">
                    Hoạt động gần đây
                    <HistoryOutlined className="text-gray-500" />
                </span>
            }
            className="shadow-md rounded-xl"
            bodyStyle={{ padding: 0 }}
        >
            {warning && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border-b border-yellow-200">
                    <ExclamationCircleOutlined className="text-yellow-500 text-lg" />
                    <span className="text-yellow-700 font-medium">{warning}</span>
                </div>
            )}
            <div className="max-h-[420px] overflow-y-auto">
                <List
                    itemLayout="horizontal"
                    dataSource={activities}
                    renderItem={item => (
                        <List.Item className="py-3 !px-2 border-b last:border-b-0">
                            <List.Item.Meta
                                avatar={
                                    <span className={`flex items-center justify-center w-9 h-9 rounded-full ${item.type === "sale" ? "bg-green-50" : "bg-blue-50"}`}>
                                        {activityIcon(item.type)}
                                    </span>
                                }
                                title={
                                    <span>
                                        <span className="font-semibold text-gray-800">{item.user}</span>{" "}
                                        vừa <span className="text-blue-600">{item.desc}</span> với giá trị {" "}
                                        <span className="font-bold text-blue-600 text-base">{item.value.toLocaleString()}</span>
                                    </span>
                                }
                                description={<span className="text-xs text-gray-400">{item.time}</span>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
} 