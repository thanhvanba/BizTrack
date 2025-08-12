// src/routes/routeConfig.js
import Dashboard from '../pages/dashboard';
import OrderManagement from '../pages/order-management';
import ProductManagement from '../pages/product-management';
import RevenueTracking from '../pages/revenue-tracking';
import CustomerManagement from '../pages/customer-management';
import ProductCategory from '../pages/product-management/ProductCategory';
import PurchaseManagement from '../pages/warehouse-management/PurchaseManagement';
import InventoryManagement from '../pages/warehouse-management/InventoryManagement';
import WarehouseManagement from '../pages/warehouse-management';
import OrderFormPage from '../pages/order-management/OrderFormPage';
import SupplierManagement from '../pages/warehouse-management/SupplierManagement';
import ReturnOrderPage from '../pages/order-management/ReturnOrderPage';
import HomePage from '../pages/home-page';
import CashBookPage from '../pages/cash-book';
import AdjustInventory from '../pages/warehouse-management/AdjustInventory';
import CustomerImport from '../pages/CustomerImport';
import ProductReport from '../pages/report-page';
import TopEntityReport from '../pages/report-page';

export const homeRoute = { path: '', element: <HomePage /> };

export const privateRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'orders', element: <OrderManagement /> },
  { path: 'create-order', element: <OrderFormPage /> },
  { path: 'return-order', element: <ReturnOrderPage /> },
  { path: 'edit-order/:orderId', element: <OrderFormPage /> },
  { path: 'return-order/:orderId', element: <OrderFormPage /> },
  { path: 'products', element: <ProductManagement /> },
  { path: 'product-category', element: <ProductCategory /> },
  { path: 'revenue', element: <RevenueTracking /> },
  { path: 'customers', element: <CustomerManagement /> },
  { path: 'inventory', element: <InventoryManagement /> },
  { path: 'warehouses', element: <WarehouseManagement /> },
  { path: 'inventory', element: <InventoryManagement /> },
  { path: 'purchase', element: <PurchaseManagement /> },
  { path: 'purchase-return', element: <PurchaseManagement /> },
  { path: 'adjust-inventory', element: <AdjustInventory /> },
  { path: 'suppliers', element: <SupplierManagement /> },
  { path: 'cash-book', element: <CashBookPage />, },
  { path: 'customer-import', element: <CustomerImport />, },
  { path: 'product-report', element: <TopEntityReport type="product" /> },
  { path: 'customer-report', element: <TopEntityReport type="customer" /> },
  { path: 'supplier-report', element: <TopEntityReport type="supplier" /> },
  { path: 'revenue-report', element: <TopEntityReport type="revenue" /> },
  { path: 'finance-report', element: <TopEntityReport type="finance" /> },

];
