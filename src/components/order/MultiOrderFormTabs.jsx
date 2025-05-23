import React, { useEffect, useState } from "react";
import { Tabs, Button, Modal } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import OrderFormData from "./OrderFormData";
import { useNavigate } from "react-router-dom";

const MultiOrderFormTabs = () => {
  const navigate = useNavigate();
  const [shouldClearStorage, setShouldClearStorage] = useState(false);

  const [panes, setPanes] = useState(() => {
    const saved = localStorage.getItem("orderTabs");
    return saved
      ? JSON.parse(saved)
      : [{ key: "1", title: "Đơn hàng #1", mode: "create", order: null, formKey: Date.now() }];
  });

  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem("activeOrderTab") || "1";
  });

  const [orderCount, setOrderCount] = useState(() => {
    return parseInt(localStorage.getItem("orderTabCount") || "1", 10);
  });

  const [modalQueue, setModalQueue] = useState([]);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);

  useEffect(() => {
    if (!shouldClearStorage) {
      localStorage.setItem("orderTabs", JSON.stringify(panes));
      localStorage.setItem("activeOrderTab", activeKey);
      localStorage.setItem("orderTabCount", orderCount.toString());
    }
  }, [panes, activeKey, orderCount, shouldClearStorage]);

  useEffect(() => {
    let tabsWithOrder = panes.filter((pane) => pane.order !== null);

    if (tabsWithOrder.length === 0 && panes.length > 0) {
      tabsWithOrder = [panes[0]];
    }

    if (tabsWithOrder.length !== panes.length) {
      setPanes(tabsWithOrder);

      if (!tabsWithOrder.find(p => p.key === activeKey)) {
        setActiveKey(tabsWithOrder[0].key);
      }
    }

    const tabsWithTruthyOrder = tabsWithOrder.filter(pane => pane.order);
    setModalQueue(tabsWithTruthyOrder);
    setCurrentModalIndex(0);
  }, []);


  useEffect(() => {
    if (modalQueue.length > 0 && currentModalIndex < modalQueue.length) {
      const modalTab = modalQueue[currentModalIndex];
      if (activeKey !== modalTab.key) {
        setActiveKey(modalTab.key);
      }
    }
  }, [modalQueue, currentModalIndex, activeKey]);

  const addTab = () => {
    const newKey = (orderCount + 1).toString();
    setPanes([
      ...panes,
      {
        key: newKey,
        title: `Đơn hàng #${newKey}`,
        mode: "create",
        order: null,
        formKey: Date.now(),
      },
    ]);
    setActiveKey(newKey);
    setOrderCount(orderCount + 1);
  };

  const removeTab = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) lastIndex = i - 1;
    });
    const newPanes = panes.filter((pane) => pane.key !== targetKey);

    if (newPanes.length === 0) {
      const defaultKey = "1";
      const defaultPane = {
        key: defaultKey,
        title: "Đơn hàng #1",
        mode: "create",
        order: null,
        formKey: Date.now(),
      };
      setPanes([defaultPane]);
      setActiveKey(defaultKey);
      setOrderCount(1);
      localStorage.setItem("orderTabs", JSON.stringify([defaultPane]));
      localStorage.setItem("activeOrderTab", defaultKey);
      localStorage.setItem("orderTabCount", "1");
    } else {
      if (newActiveKey === targetKey) {
        newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key;
      }
      setPanes(newPanes);
      setActiveKey(newActiveKey);
    }
  };

  const resetTab = (tabKey) => {
    setPanes((prev) =>
      prev.map((pane) =>
        pane.key === tabKey
          ? { ...pane, formKey: Date.now(), order: null, mode: "create" }
          : pane
      )
    );
  };

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

    const test = JSON.parse(localStorage.getItem("orderTabs") || "[]");
    if (Array.isArray(test) && test.length === 1) {
      setShouldClearStorage(true);
      localStorage.removeItem("orderTabs");
      localStorage.removeItem("activeOrderTab");
      localStorage.removeItem("orderTabCount");
      navigate("/orders");
    }
  };

  const onOrderChange = (key, updatedOrder, updatedSelectedProducts) => {
    setPanes((prev) =>
      prev.map((pane) =>
        pane.key === key
          ? {
            ...pane,
            order: updatedOrder,
            selectedProducts: updatedSelectedProducts || pane.selectedProducts,
          }
          : pane
      )
    );
  };

  const handleContinue = () => {
    setCurrentModalIndex((prev) => prev + 1);
  };

  const handleCancelOrder = () => {
    const currentTabKey = modalQueue[currentModalIndex].key;
    removeTab(currentTabKey);
    setCurrentModalIndex((prev) => prev + 1);
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
        {panes.map(({ key, title, mode, order, selectedProducts, formKey }) => (
          <Tabs.TabPane tab={title} key={key} closable={panes.length > 1}>
            <OrderFormData
              key={formKey} // 👈 Đây là chỗ ép React remount component
              mode={mode}
              order={order}
              selectedProducts={selectedProducts}
              onSave={(savedOrder) => onOrderSaved(key, savedOrder)}
              onChange={(updatedOrder, updatedProducts) =>
                onOrderChange(key, updatedOrder, updatedProducts)
              }
            />
          </Tabs.TabPane>
        ))}
      </Tabs>

      {modalQueue.length > 0 &&
        currentModalIndex < modalQueue.length &&
        activeKey === modalQueue[currentModalIndex].key && (
          <Modal
            title="Nhắc nhở"
            open={true}
            closable={false}
            footer={[
              <Button key="cancel" onClick={handleCancelOrder}>
                Hủy
              </Button>,
              <Button key="continue" type="primary" onClick={handleContinue}>
                Tiếp tục
              </Button>,
            ]}
          >
            <p>
              <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
              Bạn có muốn tiếp tục với đơn <b>{modalQueue[currentModalIndex].title}</b> không?
            </p>
          </Modal>
        )}
    </>
  );
};

export default MultiOrderFormTabs;
