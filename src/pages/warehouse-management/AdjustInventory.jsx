import { useEffect, useState } from "react";
import { Tabs, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
// import adjustmentService from "../../service/adjustmentService";
import useToastNotify from "../../utils/useToastNotify";
import AdjustmentForm from "../../components/warehouse/AdjustmentForm";
import AdjustmentList from "../../components/transfer/AdjustmentList";

const { TabPane } = Tabs;

export default function AdjustInventory() {
  const [activeTab, setActiveTab] = useState("adjustment");
  const [adjustments, setAdjustments] = useState([]);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  console.log("🚀 ~ TransferManagement ~ selectedAdjustment:", selectedAdjustment)
  const [formMode, setFormMode] = useState("purchase"); // 'purchase' or 'adjustment'

  const dispatch = useDispatch();
  const mockWarehouses = useSelector((state) => state.warehouse.warehouses.data);

  // Fetch data
  useEffect(() => {
    fetchAdjustments();
    dispatch(fetchWarehouses());
  }, []);

  const fetchAdjustments = async () => {
    try {
      const res = await adjustmentService.getAllAdjustments();
      if (res && res.data) {
        setAdjustments(res.data);
      }
    } catch (error) {
      useToastNotify("Lỗi khi tải danh sách phiếu điều chỉnh", "error");
    }
  };


  // Adjustment handlers
  const handleCreateAdjustment = async (adjustment) => {
    console.log("🚀 ~ handleCreateAdjustment ~ adjustment:", adjustment)
    try {
      if (selectedAdjustment) {
        console.log("🚀 ~ handleCreateAdjustment ~ selectedAdjustment:", selectedAdjustment)
        await adjustmentService.updateAdjustment(selectedAdjustment.adjustment_id, adjustment);
        useToastNotify("Cập nhật phiếu điều chỉnh thành công", "success");
      } else {
        await adjustmentService.createAdjustment(adjustment);
        useToastNotify("Tạo phiếu điều chỉnh thành công", "success");
      }
      fetchAdjustments();
      setSelectedAdjustment(null);
      setActiveTab("adjustment");
    } catch (error) {
      useToastNotify("Có lỗi xảy ra khi lưu phiếu điều chỉnh", "error");
    }
  };

  const handleEditAdjustment = async (adjustment) => {
    try {
      const res = await adjustmentService.getAdjustmentDetail(adjustment.adjustment_id);
      if (res && res.data) {
        const warehouse = mockWarehouses.find((w) => w.warehouse_id === res.data.warehouse_id);
        const dataWithWarehouseName = {
          ...res.data,
          warehouse_name: warehouse ? warehouse.warehouse_name : "Không rõ",
        };
        setSelectedAdjustment(dataWithWarehouseName);
        setFormMode("adjustment");
        setActiveTab("form");
      }
    } catch (error) {
      useToastNotify("Lỗi khi tải thông tin phiếu điều chỉnh", "error");
    }
  };

  const handleApproveAdjustment = async (adjustmentId) => {
    try {
      await adjustmentService.approveAdjustment(adjustmentId);
      useToastNotify("Duyệt phiếu điều chỉnh thành công", "success");
      setAdjustments(
        adjustments.map((adj) =>
          adj.adjustment_id === adjustmentId
            ? { ...adj, status: "posted", posted_at: new Date().toISOString() }
            : adj
        )
      );
    } catch (error) {
      useToastNotify("Lỗi khi duyệt phiếu điều chỉnh", "error");
    }
  };

  const handleCancelEdit = () => {
    setSelectedAdjustment(null);
    if (formMode === "purchase") {
      setActiveTab("purchase");
    } else {
      setActiveTab("adjustment");
    }
  };

  const handleCreateNew = (type) => {
    setSelectedAdjustment(null);
    setFormMode("adjustment");
    setActiveTab("form");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Điều chỉnh tồn kho</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Phiếu điều chỉnh" key="adjustment">
            {activeTab === "adjustment" && (
              <AdjustmentList
                adjustments={adjustments}
                onEdit={handleEditAdjustment}
                onApprove={handleApproveAdjustment}
                onCreateNew={() => handleCreateNew("adjustment")}
              />
            )}
          </TabPane>
          <TabPane tab="Tạo mới" key="form">
            {activeTab === "form" && (
              <AdjustmentForm
                onSubmit={handleCreateAdjustment}
                initialValues={selectedAdjustment}
                onCancel={handleCancelEdit}
              />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}