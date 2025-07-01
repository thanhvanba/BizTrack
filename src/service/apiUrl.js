// BASE URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// API URL
const API_URL = `${BASE_URL}/api/v1`;

// AUTHENTICATION URL
export const REGISTER_URL = `${API_URL}/auth/register`;
export const SIGNIN_URL = `${API_URL}/auth/login`;
export const SIGN_OUT_URL = `${API_URL}/auth/logout`;
export const REFRESH_TOKEN_URL = `${API_URL}/auth/refresh-token`;
export const PROFILE_URL = `${API_URL}/auth/profile`;
export const CHANGE_PASSWORD_URL = `${API_URL}/auth/change-password`;

// USER URL
export const USERS_URL = `${API_URL}/users`;

// CATEGORY URL
export const CATEGORIES_URL = `${API_URL}/categories`;

// PRODUCT URL
export const PRODUCTS_URL = `${API_URL}/products`;

// PURCHASE URL
export const PURCHASE_ORDERS_URL = `${API_URL}/purchase-orders`;

// WAREHOUSE URL
export const WAREHOUSES_URL = `${API_URL}/warehouses`;

// INVENTORY URL
export const INVENTORY_URL = `${API_URL}/inventories`;

// CUSTOMER URL
export const CUSTOMERS_URL = `${API_URL}/customers`;

// ORDER URL
export const ORDERS_URL = `${API_URL}/orders`;

// ORDER DETAIL URL
export const ORDERS_DETAIL_URL = `${API_URL}/order-details`;

// ANALYSIS URL
export const ANALYSIS_URL = `${API_URL}/analysis`;

// SEARCH URL
export const SEARCH_URL = `${API_URL}/search`;

// SUPPLIER_URL
export const SUPPLIERS_URL = `${API_URL}/suppliers`;

// PRODUCT_REPORT_URL
export const PRODUCT_REPORT_URL = `${API_URL}/product-report`;

// CUSTOMER_REPORT_URL
export const CUSTOMER_REPORT_URL = `${API_URL}/customer-report`;

// INVOICES_URL
export const INVOICES_URL = `${API_URL}/invoices`;

// CUSTOMER_RETURN_URL
export const CUSTOMER_RETURN_URL = `${API_URL}/customer-returns`;
