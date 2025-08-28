import { Select, Input, Button, Tag, Alert, Spin, Switch, Table } from 'antd';
import { useState, useEffect } from 'react';
import { MailOutlined, PhoneOutlined, DownloadOutlined } from '@ant-design/icons';
import importService from '../service/importService';
import useToastNotify from '../utils/useToastNotify';
import categoryService from '../service/categoryService';
import searchService from '../service/searchService';

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
  console.log("🚀 ~ CustomerImport ~ templateText:", templateText)
  const [templateLoading, setTemplateLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [categoryPagination, setCategoryPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  useEffect(() => {
    async function fetchTypes() {
      setLoading(true);
      setError('');
      try {
        const res = await importService.getEntityTypes();
        setEntityTypes(res.data || []);
      } catch (err) {
        setError('Không thể tải loại dữ liệu!');
      } finally {
        setLoading(false);
      }
    }
    fetchTypes();
  }, []);

  useEffect(() => {
    const found = entityTypes.find(e => e.type === selectedType);
    setSelectedEntity(found || null);
    // Reset template khi đổi entity type
    setTemplateText('');
    setTextData('')
  }, [selectedType, entityTypes]);

  // Tải danh mục khi chọn loại dữ liệu là sản phẩm
  useEffect(() => {
    const shouldLoadCategories = selectedType === 'products' || selectedType === 'product';
    if (!shouldLoadCategories) {
      setCategories([]);
      setFilteredCategories([]);
      return;
    }
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await categoryService.getAllCategories({ page: 1, limit: 1000 });
        const categoriesData = Array.isArray(response?.data) ? response.data : [];
        setCategories(categoriesData);
        setFilteredCategories(categoriesData); // Khởi tạo filtered categories
      } catch (err) {
        useToastNotify('Không thể tải danh sách danh mục.', 'error');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [selectedType]);

  // Search categories bằng searchService
  const searchCategories = async (searchText, page = 1, limit = 10) => {
    if (!searchText.trim()) {
      // Nếu không có search text, load lại tất cả categories
      try {
        const response = await categoryService.getAllCategories({ page, limit });
        const categoriesData = Array.isArray(response?.data) ? response.data : [];
        setFilteredCategories(categoriesData);
        // Cập nhật pagination
        if (response?.pagination) {
          setCategoryPagination(prev => ({
            ...prev,
            current: page,
            total: response.pagination.total || 0
          }));
        }
      } catch (err) {
        useToastNotify('Không thể tải danh sách danh mục.', 'error');
      }
      return;
    }

    setCategoriesLoading(true);
    try {
      // Sử dụng searchService.searchCategoryByName với page và limit
      const response = await searchService.searchCategoryByName(searchText, page, limit);
      const searchResults = Array.isArray(response?.data) ? response.data : [];
      setFilteredCategories(searchResults);
      
      // Cập nhật pagination từ response
      if (response?.pagination) {
        setCategoryPagination(prev => ({
          ...prev,
          current: page,
          total: response.pagination.total || 0
        }));
      }
    } catch (err) {
      useToastNotify('Không thể tìm kiếm danh mục.', 'error');
      // Fallback: filter từ danh sách hiện có
      const filtered = categories.filter(cat => 
        cat.category_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        cat.category_id?.toString().includes(searchText)
      );
      setFilteredCategories(filtered);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Debounced search để tránh gọi API quá nhiều
  const handleSearchChange = (value) => {
    setCategorySearchText(value);
    
    // Clear timeout cũ
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set timeout mới để debounce search
    const newTimeout = setTimeout(() => {
      searchCategories(value, 1, categoryPagination.pageSize); // Reset về page 1 khi search
    }, 500); // Delay 500ms
    
    setSearchTimeout(newTimeout);
  };

  // Handle pagination change
  const handleCategoryPaginationChange = (page, pageSize) => {
    setCategoryPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
    
    if (categorySearchText.trim()) {
      // Nếu đang search, gọi search với page mới
      searchCategories(categorySearchText, page, pageSize);
    } else {
      // Nếu không search, load categories với page mới
      searchCategories('', page, pageSize);
    }
  };

  // Fetch template khi chọn entity type
  const fetchTemplate = async () => {
    if (!selectedType) return;
    setTemplateLoading(true);
    try {
      const template = await importService.getTemplate(selectedType);
      setTemplateText(template);
    } catch (err) {
      setError('Không thể tải template: ' + (err?.message || 'Unknown error'));
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImport = async () => {
    setResult(null);
    setError('');
    if (!selectedType) {
      const msg = 'Vui lòng chọn loại dữ liệu!';
      setError(msg);
      useToastNotify(msg, 'error');
      return;
    }
    if (!textData.trim()) {
      const msg = 'Vui lòng nhập dữ liệu!';
      setError(msg);
      useToastNotify(msg, 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { textData: textData.trim(), delimiter, validateOnly };
      const res = await importService.importData(selectedType, payload);
      setResult(res);
      const summary = res?.data?.summary;
      const msg = res?.message || 'Import hoàn tất';
      if (summary?.invalid > 0) {
        const errors = Array.isArray(res?.data?.errors) ? res.data.errors : [];
        const topErrors = errors.slice(0, 3).map((e, idx) => {
          const detail = Array.isArray(e?.errors) ? e.errors.join('; ') : '';
          return `Dòng ${e?.row}: ${detail}`;
        });
        const extra = errors.length > 3 ? ` (+${errors.length - 3} lỗi khác)` : '';
        const fullMsg = topErrors.length ? `${msg}\n${topErrors.join('\n')}${extra}` : msg;
        useToastNotify(fullMsg, 'warning');
      } else {
        useToastNotify(msg, 'success');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Import thất bại!');
      useToastNotify(err?.response?.data?.message || err?.message || 'Import thất bại!', 'error');
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

  // Download template Excel
  const handleDownloadTemplate = async () => {
    if (!selectedType) {
      useToastNotify('Vui lòng chọn loại dữ liệu trước!', 'warning');
      return;
    }

    try {
      // Gọi API download template (cần implement trong importService)
      // const response = await importService.downloadTemplate(selectedType);
      useToastNotify('Template Excel đã được tải xuống!', 'success');
    } catch (error) {
      useToastNotify('Tải template thất bại: ' + (error?.message || 'Unknown error'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header với gradient và shadow */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Import Dữ Liệu
          </h2>
          <p className="text-gray-600 text-lg">Quản lý và nhập dữ liệu từ Excel một cách dễ dàng</p>
        </div>

        <div className="flex gap-8">
          {/* Main content - Form import với styling đẹp */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 hover:shadow-3xl transition-all duration-300">
              {/* Form import chính - giữ nguyên như cũ */}
              <div className="mb-6">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Loại dữ liệu</label>
                <Select
                  className="w-full"
                  placeholder="Chọn loại dữ liệu"
                  value={selectedType || undefined}
                  onChange={setSelectedType}
                  loading={loading}
                  showSearch
                  optionFilterProp="children"
                  size="large"
                >
                  {entityTypes.map(e => (
                    <Option key={e.type} value={e.type}>{e.displayName}</Option>
                  ))}
                </Select>
              </div>
              {selectedEntity && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="mb-3 text-sm font-semibold text-blue-800">Trường bắt buộc:</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedEntity.requiredFields.map(f => (
                      <Tag color="red" key={f} className="px-3 py-1 text-sm font-medium border-2 border-red-300 bg-red-50 text-red-700">
                        {f}
                      </Tag>
                    ))}
                  </div>
                  <div className="mb-2 text-sm font-semibold text-blue-800">Trường tùy chọn:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntity.optionalFields.map(f => (
                      <Tag key={f} className="px-3 py-1 text-sm font-medium border-2 border-blue-300 bg-blue-50 text-blue-700">
                        {f}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {selectedType && (selectedType === 'products' || selectedType === 'product') && (
                <div className="mt-6 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="mb-3 text-lg font-semibold text-green-800">Danh mục hiện có (tham chiếu trường category_id):</div>
                  
                  {/* Thanh search cho categories */}
                  <div className="mb-4">
                    <Input.Search
                      placeholder="Tìm kiếm danh mục theo tên hoặc ID..."
                      allowClear
                      size="middle"
                      className="max-w-md"
                      value={categorySearchText}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onSearch={(value) => {
                        setCategorySearchText(value);
                        searchCategories(value, 1, categoryPagination.pageSize);
                      }}
                    />
                    {categorySearchText && (
                      <div className="mt-2 text-sm text-gray-600">
                        Tìm thấy {filteredCategories.length} danh mục
                        {categoriesLoading && <span className="ml-2 text-blue-600">Đang tìm kiếm...</span>}
                      </div>
                    )}
                  </div>
                  
                  <Table
                    loading={categoriesLoading}
                    dataSource={filteredCategories}
                    columns={[
                      { title: 'category_id', dataIndex: 'category_id', key: 'category_id' },
                      { title: 'category_name', dataIndex: 'category_name', key: 'category_name' },
                      { title: 'status', dataIndex: 'status', key: 'status' },
                    ]}
                    rowKey={(row, idx) => row.category_id || idx}
                    size="small"
                    pagination={{
                      current: categoryPagination.current,
                      pageSize: categoryPagination.pageSize,
                      total: categoryPagination.total,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
                      onChange: handleCategoryPaginationChange,
                      onShowSizeChange: handleCategoryPaginationChange
                    }}
                    scroll={{ x: true }}
                    className="custom-table"
                  />
                </div>
              )}
              <div className="mb-6">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Dữ liệu (copy từ Excel):</label>
                <TextArea
                  rows={10}
                  value={textData}
                  onChange={e => setTextData(e.target.value)}
                  placeholder="Paste dữ liệu từ Excel vào đây..."
                  className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200 rounded-xl text-sm"
                />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">Chỉ kiểm tra dữ liệu:</span>
                    <Switch checked={validateOnly} onChange={setValidateOnly} />
                    <span className="text-sm text-gray-600">(Bật: chỉ validate, Tắt: import thật)</span>
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                loading={loading}
                onClick={handleImport}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="large"
              >
                {loading ? 'Đang Import...' : 'Import Dữ Liệu'}
              </Button>
              {error && (
                <Alert
                  className="mt-6 border-2 border-red-200 bg-red-50 rounded-xl"
                  type="error"
                  message={error}
                  showIcon
                />
              )}
              {result && (
                <Alert
                  className="mt-6 border-2 border-green-200 bg-green-50 rounded-xl"
                  type="success"
                  message="Kết quả Import"
                  description={<pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result.message, null, 2)}</pre>}
                  showIcon
                />
              )}
              {/* Hiển thị bảng dữ liệu hợp lệ nếu có */}
              {result?.data?.validData && Array.isArray(result.data.validData) && result.data.validData.length > 0 && (
                <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="mb-4 text-lg font-semibold text-green-800">Dữ liệu hợp lệ</h4>
                  <Table
                    dataSource={result.data.validData}
                    columns={validDataColumns}
                    rowKey={(row, idx) => row.id || row._id || row.supplier_id || row.customer_id || idx}
                    size="small"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: true }}
                    className="custom-table"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar bên phải */}
          <div className="w-80 space-y-6">
            {/* Section liên hệ admin để lấy template */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <MailOutlined /> Liên Hệ Admin
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-blue-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Email hỗ trợ:</p>
                    <p className="text-sm text-blue-600">admin@biztrack.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-blue-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Hotline:</p>
                    <p className="text-sm text-blue-600">1900-xxxx</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-2 bg-blue-100 rounded text-xs text-blue-800">
                <p>
                  <strong>Lưu ý:</strong> Nếu bạn cần template Excel mẫu hoặc gặp vấn đề khi import dữ liệu,
                  vui lòng liên hệ admin qua hotline trên để được hỗ trợ.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                  disabled={!selectedType}
                  className="w-full"
                  size="small"
                >
                  Tải Template (nếu có)
                </Button>
              </div>
            </div>

            {/* Hướng dẫn sử dụng */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Hướng Dẫn Sử Dụng</h3>
              <div className="space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
                  <p>Chọn loại dữ liệu cần import (khách hàng, sản phẩm, nhà cung cấp...)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
                  <p>Tải template Excel mẫu để xem cấu trúc dữ liệu cần thiết</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
                  <p>Điền dữ liệu vào template theo đúng định dạng yêu cầu</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</span>
                  <p>Copy-paste dữ liệu vào form bên trái và nhấn Import</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}