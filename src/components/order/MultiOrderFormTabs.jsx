import React, { useEffect, useState } from "react";
import { Tabs, Button, Modal } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import OrderFormData from "./OrderFormData";
import { useNavigate } from "react-router-dom";

/**
 * MultiOrderFormTabs Component
 * 
 * Mục đích: Cho phép người dùng tạo và quản lý nhiều đơn hàng cùng lúc
 * trong một giao diện tab, với khả năng lưu trữ tạm thời vào localStorage.
 * 
 * Tính năng chính:
 * - Quản lý nhiều tab đơn hàng
 * - Lưu trữ tạm thời vào localStorage
 * - Đồng bộ dữ liệu real-time
 * - Modal xác nhận trước khi xử lý
 * - Tự động chuyển tab và navigate
 */
const MultiOrderFormTabs = () => {
  const navigate = useNavigate();
  
  // Flag để xóa localStorage khi cần thiết
  const [shouldClearStorage, setShouldClearStorage] = useState(false);

  /**
   * State quản lý danh sách các tab đơn hàng
   * Khởi tạo từ localStorage hoặc tạo tab mặc định
   */
  const [panes, setPanes] = useState(() => {
    const saved = localStorage.getItem("orderTabs");
    return saved
      ? JSON.parse(saved)
      : [{ key: "1", title: "Đơn hàng #1", mode: "create", order: null, formKey: Date.now() }];
  });
  console.log("🚀 ~ MultiOrderFormTabs ~ panes:", panes)

  /**
   * State quản lý tab đang được chọn
   * Khởi tạo từ localStorage hoặc mặc định là "1"
   */
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem("activeOrderTab") || "1";
  });

  /**
   * State quản lý số thứ tự để tạo key cho tab mới
   * Khởi tạo từ localStorage hoặc mặc định là 1
   */
  const [orderCount, setOrderCount] = useState(() => {
    return parseInt(localStorage.getItem("orderTabCount") || "1", 10);
  });

  /**
   * State quản lý danh sách các tab cần xác nhận qua modal
   */
  const [modalQueue, setModalQueue] = useState([]);
  
  /**
   * State quản lý index hiện tại trong modal queue
   */
  const [currentModalIndex, setCurrentModalIndex] = useState(0);

  /**
   * useEffect: Đồng bộ state với localStorage
   * Chạy mỗi khi panes, activeKey, orderCount thay đổi
   */
  useEffect(() => {
    if (!shouldClearStorage) {
      localStorage.setItem("orderTabs", JSON.stringify(panes));
      localStorage.setItem("activeOrderTab", activeKey);
      localStorage.setItem("orderTabCount", orderCount.toString());
    }
  }, [panes, activeKey, orderCount, shouldClearStorage]);

  /**
   * useEffect: Khởi tạo modal queue và lọc tabs
   * Chỉ chạy một lần khi component mount
   */
  useEffect(() => {
    // Lọc các tab có dữ liệu đơn hàng
    let tabsWithOrder = panes.filter((pane) => pane.order !== null);

    // Nếu không có tab nào có order, lấy tab đầu tiên
    if (tabsWithOrder.length === 0 && panes.length > 0) {
      tabsWithOrder = [panes[0]];
    }

    // Nếu số lượng tab thay đổi, cập nhật panes
    if (tabsWithOrder.length !== panes.length) {
      setPanes(tabsWithOrder);

      // Nếu tab hiện tại không còn tồn tại, chuyển sang tab đầu tiên
      if (!tabsWithOrder.find(p => p.key === activeKey)) {
        setActiveKey(tabsWithOrder[0].key);
      }
    }

    // Lọc các tab có order thực sự để đưa vào modal queue
    const tabsWithTruthyOrder = tabsWithOrder.filter(pane => pane.order);
    setModalQueue(tabsWithTruthyOrder);
    setCurrentModalIndex(0);
  }, []);

  /**
   * useEffect: Tự động chuyển tab khi có modal trong queue
   */
  useEffect(() => {
    if (modalQueue.length > 0 && currentModalIndex < modalQueue.length) {
      const modalTab = modalQueue[currentModalIndex];
      if (activeKey !== modalTab.key) {
        setActiveKey(modalTab.key);
      }
    }
  }, [modalQueue, currentModalIndex, activeKey]);

  /**
   * Hàm thêm tab mới
   * Tạo tab với key mới và chuyển sang tab đó
   */
  const addTab = () => {
    const newKey = (orderCount + 1).toString();
    setPanes([
      ...panes,
      {
        key: newKey,
        title: `Đơn hàng #${newKey}`,
        mode: "create",
        order: null,
        formKey: Date.now(), // 👈 Force remount component để có state sạch
      },
    ]);
    setActiveKey(newKey);
    setOrderCount(orderCount + 1);
  };

  /**
   * Hàm xóa tab
   * Xử lý logic chuyển tab và reset khi cần thiết
   */
  const removeTab = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    
    // Tìm index của tab trước tab bị xóa
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) lastIndex = i - 1;
    });
    
    // Lọc ra các tab không bị xóa
    const newPanes = panes.filter((pane) => pane.key !== targetKey);

    // Nếu không còn tab nào, tạo tab mặc định
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
      
      // Cập nhật localStorage với tab mặc định
      localStorage.setItem("orderTabs", JSON.stringify([defaultPane]));
      localStorage.setItem("activeOrderTab", defaultKey);
      localStorage.setItem("orderTabCount", "1");
    } else {
      // Nếu tab hiện tại bị xóa, chuyển sang tab khác
      if (newActiveKey === targetKey) {
        newActiveKey = lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key;
      }
      setPanes(newPanes);
      setActiveKey(newActiveKey);
    }
  };

  /**
   * Hàm reset tab về trạng thái ban đầu
   * Tạo formKey mới để ép remount component
   */
  const resetTab = (tabKey) => {
    setPanes((prev) =>
      prev.map((pane) =>
        pane.key === tabKey
          ? { ...pane, formKey: Date.now(), order: null, mode: "create" }
          : pane
      )
    );
  };

  /**
   * Callback được gọi khi đơn hàng được lưu thành công
   * Cập nhật thông tin tab và xử lý navigation
   */
  const onOrderSaved = (key, savedOrder) => {
    // Cập nhật thông tin tab với dữ liệu đơn hàng đã lưu
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

    // Xóa tab sau khi lưu thành công
    removeTab(key);

    // Kiểm tra nếu chỉ còn 1 tab thì clear localStorage và navigate
    const test = JSON.parse(localStorage.getItem("orderTabs") || "[]");
    if (Array.isArray(test) && test.length === 1) {
      setShouldClearStorage(true);
      localStorage.removeItem("orderTabs");
      localStorage.removeItem("activeOrderTab");
      localStorage.removeItem("orderTabCount");
      navigate("/orders");
    }
  };

  /**
   * Callback được gọi khi dữ liệu đơn hàng thay đổi
   * Cập nhật state theo thời gian thực
   */
  const onOrderChange = (key, updatedOrder, updatedSelectedProducts) => {
    console.log("🚀 ~ o---------------- updatedSelectedProducts:", updatedSelectedProducts)
    console.log("🚀 ~ o!!!!!!!!!!!!!!!!!!~ updatedOrder:", updatedOrder)
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

  /**
   * Hàm xử lý khi user click "Tiếp tục" trong modal
   * Chuyển sang modal tiếp theo trong queue
   */
  const handleContinue = () => {
    setCurrentModalIndex((prev) => prev + 1);
  };

  /**
   * Hàm xử lý khi user click "Hủy" trong modal
   * Xóa tab hiện tại và chuyển sang modal tiếp theo
   */
  const handleCancelOrder = () => {
    const currentTabKey = modalQueue[currentModalIndex].key;
    removeTab(currentTabKey);
    setCurrentModalIndex((prev) => prev + 1);
  };

  return (
    <>
      {/* Tabs UI với Ant Design */}
      <Tabs
        type="editable-card" // Tab có thể đóng được
        onChange={setActiveKey} // Callback khi chuyển tab
        activeKey={activeKey} // Tab đang được chọn
        onEdit={(targetKey, action) => {
          if (action === "remove") removeTab(targetKey);
        }}
        hideAdd // Ẩn nút add mặc định
        tabBarExtraContent={
          <Button type="primary" onClick={addTab}>
            <PlusOutlined />
          </Button>
        }
      >
        {/* Render các tab đơn hàng */}
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

      {/* Modal xác nhận - chỉ hiển thị khi có tab trong queue */}
      {modalQueue.length > 0 &&
        currentModalIndex < modalQueue.length &&
        activeKey === modalQueue[currentModalIndex].key && (
          <Modal
            title="Nhắc nhở"
            open={true}
            closable={false} // Không thể đóng bằng cách click outside
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
