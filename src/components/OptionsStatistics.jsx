// src/components/OptionsStatistics.jsx

import { Button, Col, DatePicker, Row, Select } from "antd"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

const { RangePicker } = DatePicker
const { Option } = Select

const OptionsStatistics = ({
    selectedOptions,
    selectedYear,
    selectedMonth,
    selectedDate,
    selectedQuarter,
    onSelectOptions,
    onDateChange,
    onStatistic,
}) => {
    const getPickerType = () => {
        switch (selectedOptions) {
            case "day":
                return "date"
            case "month":
            case "quarter":
                return "quarter"
            case "year":
                return "year"
            case "range":
                return "date"
            default:
                return "date"
        }
    }

    const getDateValue = () => {
        switch (selectedOptions) {
            case "day":
                return selectedDate ? dayjs(selectedDate) : null
            case "month":
                return selectedYear && selectedMonth ? dayjs(`${selectedYear}-${selectedMonth}`) : null
            case "quarter":
                return selectedYear && selectedQuarter ? dayjs(`${selectedYear}-Q${selectedQuarter}`, 'YYYY-[Q]Q') : null
            case "year":
                return selectedYear ? dayjs(`${selectedYear}`) : null
            case "range":
                return selectedDate && Array.isArray(selectedDate)
                    ? [dayjs(selectedDate[0]), dayjs(selectedDate[1])]
                    : null
            default:
                return null
        }
    }

    return (
        <Row gutter={[16, 16]} className="my-4">
            <Col xs={24} sm={8}>
                <Select
                    value={selectedOptions}
                    onChange={onSelectOptions}
                    style={{ width: "100%" }}
                    size="middle"
                >
                    <Option value="range">Theo khoảng thời gian</Option>
                    <Option value="day">Theo ngày</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="quarter">Theo quý</Option>
                    <Option value="year">Theo năm</Option>
                </Select>
            </Col>
            <Col xs={24} sm={8}>
                {selectedOptions === "range" ? (
                    <RangePicker
                        onChange={onDateChange}
                        value={getDateValue()}
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                    />
                ) : (
                    <DatePicker
                        picker={getPickerType()}
                        onChange={onDateChange}
                        value={getDateValue()}
                        style={{ width: "100%" }}
                        format={
                            selectedOptions === "day"
                                ? "YYYY-MM-DD"
                                : selectedOptions === "month"
                                    ? "YYYY-MM"
                                    : selectedOptions === "quarter"
                                        ? "YYYY-[Q]Q"
                                        : "YYYY"
                        }
                        allowClear
                    />
                )}
            </Col>
            <Col xs={24} sm={8}>
                <Button
                    type="primary"
                    onClick={onStatistic}
                    block
                >
                    Thống kê
                </Button>
            </Col>
        </Row>
    )
}

export default OptionsStatistics
