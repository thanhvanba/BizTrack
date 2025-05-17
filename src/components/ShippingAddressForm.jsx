import React, { useEffect, useState } from "react";
import { Form, Select, Input, Row, Col } from "antd";
import axios from "axios";

const { Option } = Select;

const ShippingAddressForm = ({ form }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/p/")
            .then(res => setProvinces(res.data))
            .catch(err => console.error("Error fetching provinces", err));
    }, []);

    const handleProvinceChange = (provinceCode) => {
        const selected = provinces.find(p => p.code === provinceCode);
        form.setFieldsValue({ province: selected?.name, district: null, ward: null });

        axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            .then(res => setDistricts(res.data.districts || []));
        setWards([]);
    };

    const handleDistrictChange = (districtCode) => {
        const selected = districts.find(d => d.code === districtCode);
        form.setFieldsValue({ district: selected?.name, ward: null });

        axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            .then(res => setWards(res.data.wards || []));
    };

    const handleWardChange = (wardCode) => {
        const selected = wards.find(w => w.code === wardCode);
        form.setFieldsValue({ ward: selected?.name });
    };

    return (
        <>
            <Form.Item
                name="address_detail"
                label="Địa chỉ cụ thể"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
            >
                <Input variant="filled" placeholder="Số nhà, tên đường..." />
            </Form.Item>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="province"
                        rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                    >
                        <Select
                            variant="filled"
                            placeholder="Tỉnh/thành"
                            onChange={handleProvinceChange}
                            dropdownStyle={{ width: 180 }}
                        >
                            {provinces.map(p => (
                                <Option key={p.code} value={p.code}>{p.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="district"
                        rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
                    >
                        <Select
                            variant="filled"
                            placeholder="Quận/huyện"
                            onChange={handleDistrictChange}
                            dropdownStyle={{ width: 160 }}
                        >
                            {districts.map(d => (
                                <Option key={d.code} value={d.code}>{d.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="ward"
                        rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                    >
                        <Select
                            variant="filled"
                            placeholder="Phường/xã"
                            onChange={handleWardChange}
                            dropdownStyle={{ width: 180 }}
                        >
                            {wards.map(w => (
                                <Option key={w.code} value={w.code}>{w.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

export default ShippingAddressForm;
