import { Tabs } from "antd"
import ProductInfoTab from "./ProductInfoTab"
import ProductWarehouseTab from "./ProductWarehouseTab"
import AdjustInventory from "../../pages/warehouse-management/AdjustInventory"
import AdjustmentForm from "./AdjustmentForm"
import { useState } from "react"

const ExpandedRowContent = ({ record }) => {
    const [activeTabKey, setActiveTabKey] = useState("info");
    const [reloadKey, setReloadKey] = useState(0);

    const handleAdjustmentSuccess = () => {
        setReloadKey((prev) => prev + 1);
        setActiveTabKey("warehouse");
    };
    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <ProductInfoTab productData={record?.product} />,
        },
        {
            key: "warehouse",
            label: "Thẻ kho",
            children: <ProductWarehouseTab
                productId={record?.product?.product_id}
                warehouseId={record?.warehouse?.warehouse_id}
                reloadKey={reloadKey}
            />,
        },
        {
            key: "adj-inventory",
            label: "Điều chỉnh kho",
            children: <AdjustmentForm
                productId={record?.product?.product_id}
                warehouseId={record?.warehouse?.warehouse_id}
                onSuccess={handleAdjustmentSuccess}
            />,
        },
    ]

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs
                items={tabItems}
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
                className="mb-6" />
        </div>
    )
}

export default ExpandedRowContent
