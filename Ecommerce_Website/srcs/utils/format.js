// Định dạng số thành tiền tệ VNĐ
export function formatCurrency(amount) {
  if (typeof amount !== "number") return amount;
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
