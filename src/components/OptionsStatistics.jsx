import { Button, Col, DatePicker, Row, Select } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;

const pickerFormatMap = {
  day: { picker: "date", format: "YYYY-MM-DD" },
  month: { picker: "month", format: "YYYY-MM" },
  quarter: { picker: "quarter", format: "YYYY-[Q]Q" },
  year: { picker: "year", format: "YYYY" },
  range: { picker: "date", format: "YYYY-MM-DD" },
};

const OptionsStatistics = ({
  selectedOptions,
  selectedDate,
  onSelectOptions,
  onDateChange,
  onStatistic,
}) => {
  const getDateValue = () => {
    if (!selectedDate) return null;
    return selectedOptions === "range"
      ? selectedDate.map((d) => dayjs(d))
      : dayjs(selectedDate);
  };

  const { picker, format } = pickerFormatMap[selectedOptions] || {};

  return (
    <Row gutter={[16, 16]} className="justify-end">
      <Col xs={24} sm={8}>
        <Select
          value={selectedOptions}
          onChange={onSelectOptions}
          style={{ width: "100%" }}
          size="middle"
        >
          <Option value="init">Chọn phương thức lọc</Option>
          <Option value="range">Theo khoảng thời gian</Option>
          <Option value="day">Theo ngày</Option>
          <Option value="month">Theo tháng</Option>
          {/* <Option value="quarter">Theo quý</Option> */}
          <Option value="year">Theo năm</Option>
        </Select>
      </Col>
      {selectedOptions !== "init" && (
        <Col xs={24} sm={10} >
          {selectedOptions === "range" ? (
            <RangePicker
              onChange={onDateChange}
              value={getDateValue()}
              style={{ width: "100%" }}
              format={format}
            />
          ) : (
            <DatePicker
              picker={picker}
              onChange={onDateChange}
              value={getDateValue()}
              style={{ width: "100%" }}
              format={format}
              allowClear
            />
          )}
        </Col>
      )}


        < Col xs={24} sm={6} md={6} lg={6}>
      <Button type="primary" onClick={onStatistic} block>
        Áp dụng
      </Button>
    </Col>
    </Row >
  );
};

export default OptionsStatistics;
