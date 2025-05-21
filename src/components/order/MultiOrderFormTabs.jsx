import React, { useEffect, useState } from "react";
import { Tabs, Button, Typography, Tag } from "antd";
import OrderFormData from "./OrderFormData";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MultiOrderFormTabs = () => {
  const [panes, setPanes] = useState(() => {
    const saved = localStorage.getItem("orderTabs");
    return saved ? JSON.parse(saved) : [{ key: "1", title: "Đơn hàng #1", mode: "create", order: null }];
  });

  console.log("🚀 ~ const[panes,setPanes]=useState ~ panes:", panes)
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem("activeOrderTab") || "1";
  });

  const [orderCount, setOrderCount] = useState(() => {
    return parseInt(localStorage.getItem("orderTabCount") || "1", 10);
  });

  // Ghi localStorage khi thay đổi panes, activeKey hoặc orderCount
  useEffect(() => {
    localStorage.setItem("orderTabs", JSON.stringify(panes));
    localStorage.setItem("activeOrderTab", activeKey);
    localStorage.setItem("orderTabCount", orderCount.toString());
  }, [panes, activeKey, orderCount]);

  const addTab = () => {
    const newKey = (orderCount + 1).toString();
    setPanes([
      ...panes,
      { key: newKey, title: `Đơn hàng #${newKey}`, mode: "create", order: null },
    ]);
    setActiveKey(newKey);
    setOrderCount(orderCount + 1);
  };

  const removeTab = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = panes.filter((pane) => pane.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setPanes(newPanes);
    setActiveKey(newActiveKey);
  };

  // Khi order mới được lưu (ví dụ trả về order có mã order_code),
  // ta có thể cập nhật tab tương ứng (ví dụ đổi tên tab sang mã order)
  const onOrderSaved = (key, savedOrder) => {
    setPanes((prev) =>
      prev.map((pane) =>
        pane.key === key
          ? {
            ...pane,
            title: savedOrder.order_code
              ? `Đơn hàng #${savedOrder.order_code}`
              : pane.title,
            mode: "edit",
            order: savedOrder,
          }
          : pane
      )
    );

    removeTab(key);
  };

  const onOrderChange = (key, updatedOrder) => {
    setPanes((prev) =>
      prev.map((pane) =>
        pane.key === key
          ? { ...pane, order: updatedOrder }
          : pane
      )
    );
  };

  return (
    <>
      <Tabs
        type="editable-card"
        onChange={setActiveKey}
        activeKey={activeKey}
        onEdit={(targetKey, action) => {
          if (action === "remove") removeTab(targetKey);
        }}
        hideAdd
        tabBarExtraContent={
          <Button type="primary" onClick={addTab}>
            <PlusOutlined />
          </Button>
        }
      >
        {panes.map(({ key, title, mode, order }) => (
          <Tabs.TabPane tab={title} key={key} closable={panes.length > 1}>
            <OrderFormData
              mode={mode}
              order={order}
              onSave={(savedOrder) => onOrderSaved(key, savedOrder)}
              onChange={(updatedOrder) => onOrderChange(key, updatedOrder)}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>

    </>
  );
};

export default MultiOrderFormTabs;
