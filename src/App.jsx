import { Route, Routes } from "react-router";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";

import Home from "./features/customer/home/Home";
import Products from "./features/customer/products/Products";
import ProductDetails from "./features/customer/products/ProductDetails";
import Cart from "./features/customer/cart/Cart";
import Wishlist from "./features/customer/wishlist/Wishlist";
import Payment from "./features/customer/payments/Payment";
import Orders from "./features/customer/orders/Orders";
import Reviews from "./features/customer/reviews/Reviews";
import Notifications from "./features/customer/notifications/Notifications";
import Tracking from "./features/customer/delivery/Tracking";
import PickupLocations from "./features/customer/delivery/PickupLocations";
import BecomeSeller from "./features/customer/vendor/BecomeSeller";

import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./features/vendor/VendorDashboard";
import VendorProducts from "./features/vendor/VendorProducts";
import VendorOrders from "./features/vendor/VendorOrders";
import VendorFinance from "./features/vendor/VendorFinance";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminUsers from "./features/admin/AdminUsers";
import AdminVendors from "./features/admin/AdminVendors";
import AdminCategories from "./features/admin/AdminCategories";
import AdminReviews from "./features/admin/AdminReviews";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <BecomeSeller />
            </ProtectedRoute>
          }
        />

        <Route
          path="/become-seller"
          element={
            <ProtectedRoute>
              <BecomeSeller />
            </ProtectedRoute>
          }
        />

        <Route path="/pickup-locations" element={<PickupLocations />} />
      </Route>

      <Route
        path="/vendor"
        element={
          <ProtectedRoute roles={["VENDOR"]}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="finance" element={<VendorFinance />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>
    </Routes>
  );
}

export default App;
