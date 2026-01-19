// src/routes/routeConfig.js
import ProtectedRoute from "../components/ProtectedRoute";
import CashBookPage from "../pages/cash-book";
import CustomerManagement from "../pages/customer-management";
import CustomerImport from "../pages/CustomerImport";
import Dashboard from "../pages/dashboard";
import HomePage from "../pages/home-page";
import OrderManagement from "../pages/order-management";
import OrderFormPage from "../pages/order-management/OrderFormPage";
import ReturnOrderPage from "../pages/order-management/ReturnOrderPage";
import ProductManagement from "../pages/product-management";
import ProductCategory from "../pages/product-management/ProductCategory";
import ProfilePage from "../pages/profile";
import TopEntityReport from "../pages/report-page";
import UserAccountPage from "../pages/user-account";
import WarehouseManagement from "../pages/warehouse-management";
import InventoryManagement from "../pages/warehouse-management/InventoryManagement";
import PurchaseManagement from "../pages/warehouse-management/PurchaseManagement";
import SupplierManagement from "../pages/warehouse-management/SupplierManagement";

export const homeRoute = { path: "", element: <HomePage /> };

export const privateRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  {
    path: "orders",
    element: (
      <ProtectedRoute permission="order.read" element={<OrderManagement />} />
    ),
  },
  {
    path: "create-order",
    element: (
      <ProtectedRoute permission="order.create" element={<OrderFormPage />} />
    ),
  },
  {
    path: "return-order",
    element: (
      <ProtectedRoute
        permission="order.readReturn"
        element={<ReturnOrderPage />}
      />
    ),
  },
  {
    path: "edit-order/:orderId",
    element: (
      <ProtectedRoute permission="order.update" element={<OrderFormPage />} />
    ),
  },
  {
    path: "return-order/:orderId",
    element: (
      <ProtectedRoute permission="order.update" element={<OrderFormPage />} />
    ),
  },
  {
    path: "products",
    element: (
      <ProtectedRoute
        permission="product.read"
        element={<ProductManagement />}
      />
    ),
  },
  {
    path: "product-category",
    element: (
      <ProtectedRoute
        permission="category.read"
        element={<ProductCategory />}
      />
    ),
  },

  {
    path: "customers",
    element: (
      <ProtectedRoute
        permission="customer.read"
        element={<CustomerManagement />}
      />
    ),
  },
  {
    path: "inventory",
    element: (
      <ProtectedRoute
        permission="inventory.read"
        element={<InventoryManagement />}
      />
    ),
  },
  {
    path: "warehouses",
    element: (
      <ProtectedRoute
        permission="warehouse.read"
        element={<WarehouseManagement />}
      />
    ),
  },
  {
    path: "purchase",
    element: (
      <ProtectedRoute
        permission="purchase.read"
        element={<PurchaseManagement />}
      />
    ),
  },
  {
    path: "purchase-return",
    element: (
      <ProtectedRoute
        permission="purchase.readReturn"
        element={<PurchaseManagement />}
      />
    ),
  },
  {
    path: "suppliers",
    element: (
      <ProtectedRoute
        permission="supplier.read"
        element={<SupplierManagement />}
      />
    ),
  },
  {
    path: "cash-book",
    element: (
      <ProtectedRoute permission="cashbook.read" element={<CashBookPage />} />
    ),
  },
  { path: "customer-import", element: <CustomerImport /> },
  {
    path: "product-report",
    element: (
      <ProtectedRoute
        permission="statictis.product-report"
        element={<TopEntityReport type="product" />}
      />
    ),
  },
  {
    path: "customer-report",
    element: (
      <ProtectedRoute
        permission="statictis.customer-report"
        element={<TopEntityReport type="customer" />}
      />
    ),
  },
  {
    path: "supplier-report",
    element: (
      <ProtectedRoute
        permission="statictis.supplier-report"
        element={<TopEntityReport type="supplier" />}
      />
    ),
  },
  {
    path: "revenue-report",
    element: (
      <ProtectedRoute
        permission="statictis.revenue-report"
        element={<TopEntityReport type="revenue" />}
      />
    ),
  },
  {
    path: "finance-report",
    element: (
      <ProtectedRoute
        permission="statictis.finance-report"
        element={<TopEntityReport type="finance" />}
      />
    ),
  },
  { path: "profile", element: <ProfilePage /> },
  { path: "user-accounts", element: <UserAccountPage /> },
];
