/**
 * Tính toán số tiền hoàn trả cho một lần trả hàng, giống BE.
 * @param {Object} order - Thông tin đơn hàng gốc
 * @param {Array} returnDetails - Danh sách sản phẩm trả hàng (có quantity_return, quantity, discount, price)
 * @param {number} [totalRefundedSoFar=0] - Tổng số tiền đã hoàn trước đó
 * @returns {Object} { totalRefund, itemRefunds: [{product_id, refund_amount}] }
 */
export function calculateRefund(order, returnDetails, totalRefundedSoFar = 0) {
  let total_return_gross = 0;
  let total_return_product_discount = 0;
  let isLastReturn = true;
  let itemNets = [];

  for (const d of returnDetails) {
    const price = d.product_return_price ?? d.product_retail_price ?? 0;
    const discount = d.discount ?? 0;
    const quantity = d.quantity ?? 0;
    const returned_quantity = d.returned_quantity ?? 0;
    const quantity_return = d.quantity_return ?? 0;
    const product_id = d.product_id;

    const item_gross = price * quantity_return;
    const item_discount = discount * quantity_return;
    const item_net = item_gross - item_discount;

    total_return_gross += item_gross;
    total_return_product_discount += item_discount;
    itemNets.push({ product_id, item_net });

    if (returned_quantity + quantity_return < quantity) {
      isLastReturn = false;
    }
  }

  const order_level_discount = parseFloat(order.order_amount ?? 0);
  const total_order_gross = parseFloat(order.total_amount ?? 0);
  let allocated_order_discount = 0;

  if (
    order_level_discount > 0 &&
    total_order_gross > 0 &&
    total_return_gross > 0
  ) {
    if (isLastReturn) {
      // Lấy nốt phần discount còn lại từ các lần trước
      let total_returned_gross = 0;
      for (const d of returnDetails) {
        const price = d.product_return_price ?? d.product_retail_price ?? 0;
        const returned_quantity = d.returned_quantity ?? 0;
        total_returned_gross += price * returned_quantity;
      }
      const allocated_discount_before = order_level_discount * (total_returned_gross / total_order_gross);
      allocated_order_discount = order_level_discount - Math.round(allocated_discount_before);
    } else {
      const return_ratio = total_return_gross / total_order_gross;
      allocated_order_discount = Math.round(order_level_discount * return_ratio);
    }
  }

  let net_refund_this_time = total_return_gross - total_return_product_discount - allocated_order_discount;

  // Không vượt quá số tiền còn lại có thể hoàn
  const remaining_refundable = Math.max(0, parseFloat(order.final_amount ?? 0) - totalRefundedSoFar);
  let totalRefund = net_refund_this_time;
  if (isLastReturn) {
    totalRefund = remaining_refundable;
  } else if (totalRefund > remaining_refundable) {
    totalRefund = remaining_refundable;
  }
  totalRefund = Math.max(0, Math.round(totalRefund));

  // Phân bổ lại refund cho từng item theo tỷ lệ item_net
  const total_item_net = itemNets.reduce((sum, i) => sum + i.item_net, 0);
  let sumAllocated = 0;
  const itemRefunds = itemNets.map((i, idx) => {
    let refund = 0;
    if (idx === itemNets.length - 1) {
      refund = totalRefund - sumAllocated;
    } else {
      refund = total_item_net > 0 ? Math.round((i.item_net / total_item_net) * totalRefund) : 0;
      sumAllocated += refund;
    }
    return { product_id: i.product_id, refund_amount: Math.max(0, refund) };
  });

  return { totalRefund, itemRefunds };
}

export default calculateRefund;