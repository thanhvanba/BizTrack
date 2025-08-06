import React, { useState } from 'react';
import axios from 'axios';

import { CUSTOMERS_URL } from '../service/apiUrl';
import axiosService from '../service/axiosService';

const CustomerImport = () => {
    const [textData, setTextData] = useState('');
    const [delimiter, setDelimiter] = useState('\t');
    const [validateOnly, setValidateOnly] = useState(true);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Download template
    const downloadTemplate = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosService().get(`${CUSTOMERS_URL}/import-template`, {
                responseType: 'text'
            });

            // Tạo file download
            const blob = new Blob([response.data], { type: 'text/plain; charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customers-import-template.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('✅ Template downloaded successfully');
        } catch (error) {
            console.error('❌ Download template failed:', error);
            setError(`Download template failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Import data
    const handleImport = async () => {
        if (!textData.trim()) {
            setError('Vui lòng nhập dữ liệu');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                textData: textData.trim(),
                delimiter,
                validateOnly
            };

            console.log('🚀 Sending payload:', payload);

            const response = await axiosService().post(`${CUSTOMERS_URL}/import-text`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds
            });

            setResult(response.data);
            console.log('✅ Import result:', response.data);

        } catch (error) {
            console.error('❌ Import failed:', error);

            if (error.response) {
                // Server responded with error
                setError(`Server error: ${error.response.data?.message || error.response.statusText}`);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                // Network error
                setError('Network error: Không thể kết nối đến server');
            } else {
                // Other error
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear all data
    const handleClear = () => {
        setTextData('');
        setResult(null);
        setError(null);
    };

    // Load sample data
    const loadSampleData = () => {
        const sampleData = `customer_name\temail\tphone\ttotal_expenditure\ttotal_orders\tdebt
Anh Giang - Kim Mã\ta@gmail.com\t123123123\t436.100.000\t5\t0
Anh Hoàng - Sài Gòn\tb@gmail.com\t123123123\t379.300.000\t10\t0
Tuấn - Hà Nội\tc@gmail.com\t123123123\t270.500.000\t15\t0
Phạm Thu Hương\td@gmail.com\t123123123\t464.900.000\t20\t0
Nguyễn Văn Hải\te@gmail.com\t1123123123\t186.500.000\t25\t0`;

        setTextData(sampleData);
        setError(null);
    };

    return React.createElement('div', {
        style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' }
    }, [
        // Title
        React.createElement('h1', {
            key: 'title',
            style: { color: '#333', marginBottom: '20px' }
        }, '📋 Import Khách Hàng'),

        // Template Section
        React.createElement('div', {
            key: 'template-section',
            style: {
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
            }
        }, [
            React.createElement('h3', {
                key: 'template-title',
                style: { margin: '0 0 10px 0', color: '#495057' }
            }, '📥 Template'),

            React.createElement('button', {
                key: 'download-btn',
                onClick: downloadTemplate,
                disabled: loading,
                style: {
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                }
            }, loading ? '⏳ Đang tải...' : '📄 Download Template'),

            React.createElement('p', {
                key: 'template-desc',
                style: { margin: '10px 0 0 0', color: '#6c757d', fontSize: '14px' }
            }, '💡 Hướng dẫn: Download template → Copy dữ liệu từ Excel → Paste vào ô bên dưới')
        ]),

        // Import Form
        React.createElement('div', {
            key: 'import-form',
            style: {
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                marginBottom: '20px'
            }
        }, [
            React.createElement('h3', {
                key: 'import-title',
                style: { margin: '0 0 15px 0', color: '#495057' }
            }, '📤 Import Dữ Liệu'),

            // Data Input
            React.createElement('div', {
                key: 'data-input',
                style: { marginBottom: '15px' }
            }, [
                React.createElement('label', {
                    key: 'data-label',
                    style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }
                }, 'Dữ liệu (copy từ Excel):'),

                React.createElement('textarea', {
                    key: 'data-textarea',
                    value: textData,
                    onChange: (e) => setTextData(e.target.value),
                    placeholder: 'Paste dữ liệu từ Excel vào đây...',
                    style: {
                        width: '100%',
                        minHeight: '200px',
                        padding: '10px',
                        border: '1px solid #ced4da',
                        borderRadius: '5px',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                    }
                })
            ]),

            // Options
            React.createElement('div', {
                key: 'options',
                style: { display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }
            }, [
                React.createElement('div', { key: 'delimiter-option' }, [
                    React.createElement('label', {
                        key: 'delimiter-label',
                        style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }
                    }, 'Ký tự phân cách:'),

                    React.createElement('select', {
                        key: 'delimiter-select',
                        value: delimiter,
                        onChange: (e) => setDelimiter(e.target.value),
                        style: {
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '5px',
                            minWidth: '120px'
                        }
                    }, [
                        React.createElement('option', { key: 'tab', value: '\t' }, 'Tab (\\t)'),
                        React.createElement('option', { key: 'comma', value: ',' }, 'Comma (,)'),
                        React.createElement('option', { key: 'semicolon', value: ';' }, 'Semicolon (;)')
                    ])
                ]),

                React.createElement('div', {
                    key: 'validate-option',
                    style: { display: 'flex', alignItems: 'center', marginTop: '25px' }
                }, [
                    React.createElement('input', {
                        key: 'validate-checkbox',
                        type: 'checkbox',
                        id: 'validateOnly',
                        checked: validateOnly,
                        onChange: (e) => setValidateOnly(e.target.checked),
                        style: { marginRight: '8px' }
                    }),

                    React.createElement('label', {
                        key: 'validate-label',
                        htmlFor: 'validateOnly',
                        style: { cursor: 'pointer' }
                    }, '🔍 Chỉ validate (không lưu vào database)')
                ])
            ]),

            // Action Buttons
            React.createElement('div', {
                key: 'action-buttons',
                style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }
            }, [
                React.createElement('button', {
                    key: 'import-btn',
                    onClick: handleImport,
                    disabled: loading,
                    style: {
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }
                }, loading ? '⏳ Đang xử lý...' : '🚀 Import Dữ Liệu'),

                React.createElement('button', {
                    key: 'sample-btn',
                    onClick: loadSampleData,
                    disabled: loading,
                    style: {
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }
                }, '📝 Load Sample Data'),

                React.createElement('button', {
                    key: 'clear-btn',
                    onClick: handleClear,
                    disabled: loading,
                    style: {
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }
                }, '🗑️ Clear All')
            ])
        ]),

        // Error Display
        error && React.createElement('div', {
            key: 'error-display',
            style: {
                background: '#f8d7da',
                color: '#721c24',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
            }
        }, [
            React.createElement('strong', { key: 'error-label' }, '❌ Lỗi: '),
            error
        ]),

        // Results Display
        result && React.createElement('div', {
            key: 'results-display',
            style: {
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }
        }, [
            React.createElement('h3', {
                key: 'results-title',
                style: { margin: '0 0 15px 0', color: '#495057' }
            }, '📊 Kết Quả Import'),

            // Summary
            result.data?.summary && React.createElement('div', {
                key: 'summary',
                style: {
                    background: '#e7f3ff',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    border: '1px solid #b3d9ff'
                }
            }, [
                React.createElement('h4', {
                    key: 'summary-title',
                    style: { margin: '0 0 10px 0', color: '#0056b3' }
                }, '📈 Tổng Kết'),

                React.createElement('div', {
                    key: 'summary-grid',
                    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }
                }, [
                    React.createElement('div', { key: 'total' }, ['Tổng: ', result.data.summary.total]),
                    React.createElement('div', { key: 'valid' }, ['Hợp lệ: ', React.createElement('span', { style: { color: '#28a745' } }, result.data.summary.valid)]),
                    React.createElement('div', { key: 'invalid' }, ['Lỗi: ', React.createElement('span', { style: { color: '#dc3545' } }, result.data.summary.invalid)]),
                    React.createElement('div', { key: 'inserted' }, ['Đã lưu: ', React.createElement('span', { style: { color: '#007bff' } }, result.data.summary.inserted)]),
                    React.createElement('div', { key: 'mode' }, ['Mode: ', result.data.summary.validateOnly ? '🔍 Validation' : '💾 Full Import'])
                ])
            ]),

            // Errors
            result.data?.errors && result.data.errors.length > 0 && React.createElement('div', {
                key: 'errors-detail',
                style: { marginBottom: '15px' }
            }, [
                React.createElement('h4', {
                    key: 'errors-title',
                    style: { color: '#dc3545', marginBottom: '10px' }
                }, '❌ Chi Tiết Lỗi'),

                ...result.data.errors.map((error, index) =>
                    React.createElement('div', {
                        key: `error-${index}`,
                        style: {
                            background: '#f8d7da',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '8px',
                            border: '1px solid #f5c6cb'
                        }
                    }, [
                        React.createElement('strong', { key: 'error-row' }, `Dòng ${error.row}:`),
                        React.createElement('ul', {
                            key: 'error-list',
                            style: { margin: '5px 0 0 20px', padding: 0 }
                        }, error.errors.map((err, errIndex) =>
                            React.createElement('li', { key: errIndex }, err)
                        ))
                    ])
                )
            ]),

            // Valid Data Preview
            result.data?.validData && result.data.validData.length > 0 && React.createElement('div', {
                key: 'valid-data'
            }, [
                React.createElement('h4', {
                    key: 'valid-title',
                    style: { color: '#28a745', marginBottom: '10px' }
                }, '✅ Dữ Liệu Hợp Lệ'),

                React.createElement('div', {
                    key: 'valid-content',
                    style: {
                        background: '#f8f9fa',
                        padding: '10px',
                        borderRadius: '5px',
                        maxHeight: '300px',
                        overflow: 'auto'
                    }
                }, [
                    React.createElement('pre', {
                        key: 'valid-json',
                        style: { margin: 0, fontSize: '12px' }
                    }, JSON.stringify(result.data.validData, null, 2))
                ])
            ]),

            // Full Response
            React.createElement('details', {
                key: 'full-response',
                style: { marginTop: '15px' }
            }, [
                React.createElement('summary', {
                    key: 'response-summary',
                    style: { cursor: 'pointer', color: '#6c757d' }
                }, '🔍 Xem Response Đầy Đủ'),

                React.createElement('pre', {
                    key: 'response-content',
                    style: {
                        background: '#f8f9fa',
                        padding: '10px',
                        borderRadius: '5px',
                        overflow: 'auto',
                        fontSize: '12px',
                        marginTop: '10px'
                    }
                }, JSON.stringify(result, null, 2))
            ])
        ])
    ]);
};

export default CustomerImport;