import { Select, Input, Button, Tag, Alert, Spin, Switch, Table } from 'antd';
import { useState, useEffect } from 'react';
import importService from '../service/importService';

const { Option } = Select;
const { TextArea } = Input;

export default function CustomerImport() {
  const [entityTypes, setEntityTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [textData, setTextData] = useState('');
  const [delimiter, setDelimiter] = useState('\t');
  const [validateOnly, setValidateOnly] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [templateText, setTemplateText] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);

  useEffect(() => {
    async function fetchTypes() {
      setLoading(true);
      setError(null);

      const response = await axiosService().get(
        `${CUSTOMERS_URL}/import-template`,
        {
          responseType: "text",
        }
      );

      // Tạo file download
      const blob = new Blob([response.data], {
        type: "text/plain; charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers-import-template.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ Template downloaded successfully");
    } catch (error) {
      console.error("❌ Download template failed:", error);
      setError(
        `Download template failed: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImport = async () => {
    setResult(null);
    setError('');
    if (!selectedType) return setError('Vui lòng chọn loại dữ liệu!');
    if (!textData.trim()) return setError('Vui lòng nhập dữ liệu!');
    setLoading(true);
    try {
      const payload = { textData: textData.trim(), delimiter, validateOnly };
      const res = await importService.importData(selectedType, payload);
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Import thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Tạo columns động cho Table từ validData
  const validDataColumns = result?.data?.validData && Array.isArray(result.data.validData) && result.data.validData.length > 0
    ? Object.keys(result.data.validData[0]).map(key => ({
        title: key,
        dataIndex: key,
        key,
      }))
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Import Dữ Liệu</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Loại dữ liệu</label>
        <Select
          className="w-full"
          placeholder="Chọn loại dữ liệu"
          value={selectedType || undefined}
          onChange={setSelectedType}
          loading={loading}
          showSearch
          optionFilterProp="children"
        >
          {entityTypes.map(e => (
            <Option key={e.type} value={e.type}>{e.displayName}</Option>
          ))}
        </Select>
      </div>
      {selectedEntity && (
        <div className="mb-4">
          <div className="mb-1 text-sm">Trường bắt buộc:</div>
          {selectedEntity.requiredFields.map(f => (
            <Tag color="red" key={f}>{f}</Tag>
          ))}
          <div className="mt-2 mb-1 text-sm">Trường tùy chọn:</div>
          {selectedEntity.optionalFields.map(f => (
            <Tag key={f}>{f}</Tag>
          ))}
        </div>
      )}
      {/* Template section */}
      {selectedType && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Template mẫu:</label>
            <Button 
              size="small" 
              onClick={fetchTemplate} 
              loading={templateLoading}
              disabled={templateLoading}
            >
              {templateText ? 'Làm mới Template' : 'Xem Template'}
            </Button>
          </div>
          {templateText && (
            <div className="border rounded p-3 bg-gray-50">
              <pre className="text-sm whitespace-pre-wrap font-mono">{templateText}</pre>
            </div>
          )}
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Dữ liệu (copy từ Excel):</label>
        <TextArea
          rows={8}
          value={textData}
          onChange={e => setTextData(e.target.value)}
          placeholder="Paste dữ liệu từ Excel vào đây..."
        />
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">Chỉ kiểm tra dữ liệu:</span>
          <Switch checked={validateOnly} onChange={setValidateOnly} />
          <span className="text-xs text-gray-500">(Bật: chỉ validate, Tắt: import thật)</span>
        </div>
      </div>
      <Button
        type="primary"
        loading={loading}
        onClick={handleImport}
        className="w-full"
        size="large"
      >
        Import
      </Button>
      {error && <Alert className="mt-4" type="error" message={error} showIcon />}
      {result && (
        <Alert
          className="mt-4"
          type="success"
          message="Kết quả Import"
          description={<pre className="whitespace-pre-wrap">{JSON.stringify(result.message, null, 2)}</pre>}
          showIcon
        />
      )}
      {/* Hiển thị bảng dữ liệu hợp lệ nếu có */}
      {result?.data?.validData && Array.isArray(result.data.validData) && result.data.validData.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 font-medium">Dữ liệu hợp lệ</h4>
          <Table
            dataSource={result.data.validData}
            columns={validDataColumns}
            rowKey={(row, idx) => row.id || row._id || row.supplier_id || row.customer_id || idx}
            size="small"
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
          />
        </div>
      )}
    </div>
  );
}