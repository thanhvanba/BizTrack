export default function AdjustmentDetail({ adjustment }) {
  const totalAmount = adjustment.details.reduce((sum, detail) => sum + detail.quantity * (detail.price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">Mã điều chỉnh</p>
          <p className="font-medium">{adjustment.adjustment_id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Trạng thái</p>
          <p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                adjustment.status === "draft" 
                  ? "bg-orange-100 text-orange-800" 
                  : "bg-green-100 text-green-800"
              }`}
            >
              {adjustment.status === "draft" ? "Chờ duyệt" : "Đã nhập"}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phương thức điều chỉnh</p>
          <p className="font-medium">
            {adjustment.adjustment_type === "increase" ? "Tăng kho" : "Giảm kho"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Kho điều chỉnh</p>
          <p className="font-medium">{adjustment.warehouse_name}</p>
        </div>
        {adjustment.posted_at && (
          <div>
            <p className="text-sm text-gray-500">Ngày phê duyệt</p>
            <p className="font-medium">{new Date(adjustment.posted_at).toLocaleString()}</p>
          </div>
        )}
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Ghi chú</p>
          <p className="font-medium">{adjustment.note || "Không có ghi chú"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Chi tiết điều chỉnh</h3>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">
                  Mã sản phẩm
                </th>
                <th scope="col" className="py-3 px-6">
                  Tên sản phẩm
                </th>
                <th scope="col" className="py-3 px-6">
                  Số lượng
                </th>
                <th scope="col" className="py-3 px-6">
                  Giá trị (nếu có)
                </th>
                <th scope="col" className="py-3 px-6">
                  Thành tiền (nếu có)
                </th>
              </tr>
            </thead>
            <tbody>
              {adjustment.details.map((detail) => (
                <tr key={detail.adjustment_detail_id} className="bg-white border-b">
                  <td className="py-4 px-6">{detail.product_id}</td>
                  <td className="py-4 px-6">{detail.product_name || "Không xác định"}</td>
                  <td className="py-4 px-6">{detail.quantity}</td>
                  <td className="py-4 px-6">{detail.price ? detail.price.toLocaleString() + " VNĐ" : "-"}</td>
                  <td className="py-4 px-6">
                    {detail.price ? (detail.quantity * detail.price).toLocaleString() + " VNĐ" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {adjustment.adjustment_type === "increase" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-gray-500">Tổng giá trị:</p>
                <p className="text-xl font-bold">{totalAmount.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}