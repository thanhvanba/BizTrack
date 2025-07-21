import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const SessionExpiredModal = ({ visible, onOk }) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
          <span>Phiên đăng nhập hết hạn</span>
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onOk}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="ok" type="primary" onClick={onOk}>
          Đăng nhập lại
        </Button>
      ]}
      centered
    >
      <p>Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.</p>
    </Modal>
  );
};

export default SessionExpiredModal; 