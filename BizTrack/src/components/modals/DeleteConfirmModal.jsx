import { Modal, Typography } from "antd"
import { ExclamationCircleOutlined } from "@ant-design/icons"

const { Text } = Typography

const DeleteConfirmModal = ({ open, onCancel, onConfirm, title, content, loading }) => {
  return (
    <Modal
      title={
        <div className="flex items-center text-red-500">
          <ExclamationCircleOutlined className="mr-2 text-xl" />
          {title || "Xác nhận xóa"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Xóa"
      cancelText="Hủy"  
      okButtonProps={{ danger: true, loading }}
    >
      <div className="py-4">
        <Text>{content || "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác."}</Text>
      </div>
    </Modal>
  )
}

export default DeleteConfirmModal
