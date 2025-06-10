import { Button, Image, Tag } from "antd"
import formatPrice from "../../utils/formatPrice"

const ProductInfoTab = ({ productData }) => {
    console.log("🚀 ~ productData:", productData)
    return (
        <div>
            <div>
                {/* Product Info Header */}
                <div className="flex gap-4 items-start mb-6">
                    <div className="w-28 h-28 bg-gray-100 rounded-md flex items-center justify-center text-3xl text-blue-500">
                        <Image
                            src={productData?.product_image || "/placeholder.svg"}
                            alt={productData?.product_image}
                            width={100}
                            height={100}
                            className="object-cover rounded"
                            preview={false}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">{productData?.product_name}</h3>

                        <div className="mb-2">
                            <span className="text-gray-600">Danh mục: </span>
                            <span className="text-blue-500">{productData?.category?.category_name}</span>
                        </div>

                        <div className="mb-2">
                            <span className="text-gray-600">Trạng thái: </span>
                            <Tag color={
                                productData?.available_stock > 5 ? "green" :
                                    productData?.available_stock > 0 ? "orange" : "red"
                            }>
                                {
                                    productData?.available_stock > 5
                                        ? "Đủ hàng"
                                        : productData?.available_stock > 0
                                            ? "Sắp hết"
                                            : "Hết hàng"
                                }
                            </Tag>
                        </div>
                    </div>

                    <div>

                    </div>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Mã hàng</div>
                        <div className="font-medium">{productData?.sku}</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Mã vạch</div>
                        <div className="text-gray-600">Chưa có</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Tồn kho</div>
                        <div className="font-medium">{productData?.quantity}</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Định mức tồn</div>
                        <div className="font-medium">0 - 999,999,999</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Giá vốn</div>
                        <div className="font-medium">100,000</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Giá bán</div>
                        <div className="font-medium">{formatPrice(productData?.product_retail_price)}</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Thương hiệu</div>
                        <div className="text-gray-600">Chưa có</div>
                    </div>
                    <div>
                        <div className="text-gray-600 text-xs mb-1">Trọng lượng</div>
                        <div className="font-medium">0 g</div>
                    </div>
                </div>

                {/* Additional Options */}
                {/* <div className="mb-6">
                    <div className="text-blue-500 cursor-pointer mb-2 hover:text-blue-600">+ Thêm đơn vị tính</div>
                    <div className="text-blue-500 cursor-pointer hover:text-blue-600">+ Thêm thuộc tính</div>
                </div> */}
            </div>
            <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                    <Button danger icon={<span>🗑️</span>}>
                        Xóa
                    </Button>
                    <Button icon={<span>📋</span>}>
                        Sao chép
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button type="primary" icon={<span>✏️</span>}>
                        Chỉnh sửa
                    </Button>
                    <Button icon={<span>🖨️</span>}>
                        In tem mã
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProductInfoTab
