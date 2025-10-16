import { Button } from "antd";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/permissionHelper";

const SupplierInfoTab = ({ setEditModalVisible, setDeleteModalVisible, setSelectedSupplier, supplierData }) => {
  console.log("🚀 ~ supplierInfoTab ~ supplierData:", supplierData)
  const permissions = useSelector(state => state.permission.permissions.permissions)
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-end col-span-2 space-x-2">
          <p>Nhà cung cấp:</p>
          <p className="font-medium text-2xl">{supplierData.supplier_name}</p>
        </div>
        <div>
          <p className="font-medium">Số điện thoại:</p>
          <p>{supplierData.phone}</p>
        </div>
        <div>
          <p className="font-medium">Email:</p>
          <p>{supplierData.email || "Chưa có"}</p>
        </div>
        <div className="col-span-2">
          <p className="font-medium">Địa chỉ:</p>
          <p>{supplierData.address}</p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        {hasPermission(permissions, 'supplier.delete') &&
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedSupplier(supplierData)
                setDeleteModalVisible(true)
              }}
              danger icon={<span>🗑️</span>}
            >
              Xóa
            </Button>
          </div>
        }
        {hasPermission(permissions, 'supplier.update') &&
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedSupplier(supplierData)
                setEditModalVisible(true)
              }}
              type="primary" icon={<span>✏️</span>}
            >
              Chỉnh sửa
            </Button>
          </div>
        }
      </div>
    </div>
  );
};

export default SupplierInfoTab;
