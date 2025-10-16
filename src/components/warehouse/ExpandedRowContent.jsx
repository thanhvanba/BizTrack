import { Tabs } from "antd"
import ProductInfoTab from "./ProductInfoTab"
import ProductWarehouseTab from "./ProductWarehouseTab"
import AdjustInventory from "../../pages/warehouse-management/AdjustInventory"
import AdjustmentForm from "./AdjustmentForm"
import { useState } from "react"
import { hasPermission } from "../../utils/permissionHelper"
import { useSelector } from "react-redux"

const ExpandedRowContent = ({ record }) => {
    const [activeTabKey, setActiveTabKey] = useState("info");
    const [reloadKey, setReloadKey] = useState(0);
    const permissions = useSelector(state => state.permission.permissions.permissions)

    const handleAdjustmentSuccess = () => {
        setReloadKey((prev) => prev + 1);
        setActiveTabKey("warehouse");
    };
    const tabItems = ([
        hasPermission(permissions, 'inventory.readById') && {
            key: "info",
            label: "Thông tin",
            children: <ProductInfoTab productData={record?.product} />,
        },
        hasPermission(permissions, 'inventory.getStockLedger') && {
            key: "warehouse",
            label: "Thẻ kho",
            children: <ProductWarehouseTab
                productId={record?.product?.product_id}
                warehouseId={record?.warehouse?.warehouse_id}
                reloadKey={reloadKey}
            />,
        },
        (hasPermission(permissions, 'inventory.stockIncrease') || hasPermission(permissions, 'inventory.stockDecrease')) && {
            key: "adj-inventory",
            label: "Điều chỉnh kho",
            children: <AdjustmentForm
                productId={record?.product?.product_id}
                warehouseId={record?.warehouse?.warehouse_id}
                onSuccess={handleAdjustmentSuccess}
            />,
        },
    ]).filter(Boolean)

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
