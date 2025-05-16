// src/routes/routeConfig.js
import Dashboard from '../pages/dashboard';
import OrderManagement from '../pages/order-management';
import ProductManagement from '../pages/product-management';
import RevenueTracking from '../pages/revenue-tracking';
import CustomerManagement from '../pages/customer-management';
import InventoryManagement from '../pages/inventory-management';
import ProductCategory from '../pages/product-management/ProductCategory';
import PurchaseManagement from '../pages/inventory-management/PurchaseManagement';
import CreateOrderPage from '../pages/order-management/CreateOrder';

export const privateRoutes = [
  { path: '', element: <Dashboard /> }, // index route
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'orders', element: <OrderManagement /> },
  { path: 'create-order', element: <CreateOrderPage /> },
  { path: 'products', element: <ProductManagement /> },
  { path: 'product-category', element: <ProductCategory /> },
  { path: 'revenue', element: <RevenueTracking /> },
  { path: 'customers', element: <CustomerManagement /> },
  { path: 'inventory', element: <InventoryManagement /> },
  { path: 'purchase', element: <PurchaseManagement /> },
];
