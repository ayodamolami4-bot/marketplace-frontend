
import { Routes, Route } from "react-router";

import MainLayout from "./layouts/MainLayout";

import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import VerifyEmail from "./features/auth/VerifyEmail";
import OTP from "./features/auth/OTP";
import ForgotPassword from "./features/auth/ForgotPassword";

import Products from "./features/customer/products/Products";
import ProductDetails from "./features/customer/products/ProductDetails";

import Cart from "./features/customer/cart/Cart";

import Wishlist from "./features/customer/wishlist/Wishlist";

import Payment from "./features/customer/payments/Payment";

import Orders from "./features/customer/orders/Orders";

import Reviews from "./features/customer/reviews/Reviews";

import Notifications from "./features/customer/notifications/Notifications";

import Tracking from "./features/customer/delivery/Tracking";
import DeliveryStatus from "./features/customer/delivery/DeliveryStatus";
import PickupLocations from "./features/customer/delivery/PickupLocations";

function App() {
  return (
    <Routes>

      {/* Authentication */}

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/otp" element={<OTP />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* Customer */}

      <Route element={<MainLayout />}>

        <Route path="/" element={<Products />} />

        <Route path="/products" element={<Products />} />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/payment" element={<Payment />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/reviews" element={<Reviews />} />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/tracking"
          element={<Tracking />}
        />

        <Route
          path="/delivery"
          element={<DeliveryStatus />}
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