import { Tabs, Badge } from "antd";
import { useEffect, useState } from "react";
import orderService from "../../service/orderService";

const DEFAULT_STATUS_LIST = [
  { key: "-1", label: "Tất cả", count: 0 },
  { key: "0", label: "Mới", count: 0 },
  { key: "1", label: "Xác nhận", count: 0 },
  { key: "2", label: "Đang đóng hàng", count: 0 },
  { key: "3", label: "Đang giao", count: 0 },
  { key: "4", label: "Hoàn tất", count: 0 },
  { key: "5", label: "Huỷ đơn", count: 0 },
  { key: "6", label: "Huỷ điều chỉnh", count: 0 },
];

const OrderStatusTabs = ({ onChange, activeKey = "-1" }) => {
  const [statusList, setStatusList] = useState(DEFAULT_STATUS_LIST);
  console.log("🚀 ~ OrderStatusTabs ~ statusList:", statusList)

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const res = await orderService.getOrderSummaryByStatus();
        const { data } = res;
        console.log("🚀 ~ fetchStatusCounts ~ data:", data)

        // Map lại danh sách với count từ API
        const updatedList = DEFAULT_STATUS_LIST.map((item) => {
          if (item.key === "-1") {
            // Tính tổng tất cả trạng thái
            const totalCount = Object.values(data).reduce(
              (sum, val) => sum + val?.total,
              0
            );
            console.log("🚀 ~ updatedList ~ totalCount:", totalCount)
            return { ...item, count: totalCount };
          }

          const count = data[item.key]?.total || 0;
          console.log("🚀 ~ updatedList ~ count:", count)
          return { ...item, count };
        });

        setStatusList(updatedList);
      } catch (error) {
        console.error("Lỗi khi lấy tổng đơn theo trạng thái:", error);
      }
    };

    fetchStatusCounts();
  }, []);

  const items = statusList.map((item) => ({
    key: item.key,
    label: (
      <div className="tab-label">
        {item.label} <Badge count={item.count} showZero color="#1677ff" />
      </div>
    ),
    children: null,
  }));

  return (
    <Tabs
      className="equal-width-tabs"
      activeKey={activeKey}
      defaultActiveKey="-1"
      items={items}
      onChange={onChange}
    />
  );
};

export default OrderStatusTabs;
