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
import TransferManagement from '../pages/warehouse-management/TransferManagement';

export const privateRoutes = [
  { path: '', element: <Dashboard /> }, // index route
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'orders', element: <OrderManagement /> },
  { path: 'create-order', element: <OrderFormPage /> },
  { path: 'edit-order/:orderId', element: <OrderFormPage/> },
  { path: 'products', element: <ProductManagement /> },
  { path: 'product-category', element: <ProductCategory /> },
  { path: 'revenue', element: <RevenueTracking /> },
  { path: 'customers', element: <CustomerManagement /> },
  { path: 'inventory', element: <InventoryManagement /> },
  { path: 'warehouses', element: <WarehouseManagement /> },
  { path: 'inventory', element: <InventoryManagement /> },
  { path: 'purchase', element: <PurchaseManagement /> },
  { path: 'transfer', element: <TransferManagement /> },
];
