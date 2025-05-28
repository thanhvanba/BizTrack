const formatPrice = (price) => {
  const value = parseFloat(price) || 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default formatPrice;
