import { Tabs } from "antd"
import ProductInfoTab from "./ProductInfoTab"
import ProductWarehouseTab from "./ProductWarehouseTab"

const ExpandedRowContent = ({ record }) => {
    const tabItems = [
        {
            key: "info",
            label: "Thông tin",
            children: <ProductInfoTab productData={record?.product} />,
        },
        {
            key: "warehouse",
            label: "Thẻ kho",
            children: <ProductWarehouseTab />,
        },
    ]

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <Tabs items={tabItems} className="mb-6" />
        </div>
    )
}

export default ExpandedRowContent
