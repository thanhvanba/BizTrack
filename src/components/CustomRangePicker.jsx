import React, { useState } from 'react';
import { DatePicker, Button, ConfigProvider } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import vi_VN from 'antd/es/locale/vi_VN';

const { RangePicker } = DatePicker;

const CustomRangePicker = ({ onChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [tempDates, setTempDates] = useState([]);

  const rangePresets = [
    { label: 'Hôm nay', value: [dayjs(), dayjs()] },
    { label: 'Hôm qua', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
    { label: '7 ngày qua', value: [dayjs().subtract(6, 'day'), dayjs()] },
    { label: '30 ngày qua', value: [dayjs().subtract(29, 'day'), dayjs()] },
    { label: '90 ngày qua', value: [dayjs().subtract(89, 'day'), dayjs()] },
    { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    { label: 'Đầu tuần đến nay', value: [dayjs().startOf('week'), dayjs()] },
    { label: 'Đầu tháng đến nay', value: [dayjs().startOf('month'), dayjs()] },
  ];

  const handleApply = () => {
    if (tempDates && tempDates.length === 2) {
      setSelectedDates(tempDates);
      onChange?.(tempDates);
    }
    setOpen(false);
  };

  const handleClose = () => {
    setTempDates(selectedDates); // Khôi phục giá trị đã chọn nếu không áp dụng
    setOpen(false);
  };

  const renderExtraFooter = () => (
    <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 'bold' }}>Thời điểm tạo ▼</span>
      <div>
        <Button size="small" onClick={handleClose} style={{ marginRight: 8 }}>
          Đóng
        </Button>
        <Button size="small" type="primary" onClick={handleApply}>
          Áp dụng
        </Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider locale={vi_VN}>
      <RangePicker
        value={tempDates}
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setTempDates(selectedDates); // Reset temp khi mở lại
          }
          setOpen(nextOpen); // Điều khiển mở/đóng thủ công
        }}
        // onCalendarChange={(dates) => {
        //   setTempDates(dates); // Chỉ lưu tạm
        // }}
        onChange={onChange}
        presets={rangePresets.map(preset => ({
          ...preset,
          onClick: () => setTempDates(preset.value)
        }))}
        suffixIcon={<CalendarOutlined />}
        renderExtraFooter={renderExtraFooter}
        style={{ width: 300 }}
        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
      />
    </ConfigProvider>
  );
};

export default CustomRangePicker;
