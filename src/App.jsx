import { Route, Routes } from "react-router";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";

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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Products />} />
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
          path="/pickup-locations"
          element={<PickupLocations />}
        />
      </Route>
    </Routes>
  );
}

export default App;
