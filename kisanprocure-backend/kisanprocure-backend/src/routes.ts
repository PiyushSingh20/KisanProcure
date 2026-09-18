import { createBrowserRouter } from 'react-router';

import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import FarmerLayout from './pages/farmer/Layout';
import FarmerHome from './pages/farmer/Home';
import Queue from './pages/farmer/Queue';
import Centers from './pages/farmer/Centers';
import CenterDetails from './pages/farmer/CenterDetails';
import Booking from './pages/farmer/Booking';
import TokenConfirmed from './pages/farmer/TokenConfirmed';
import Tracking from './pages/farmer/Tracking';
import Payment from './pages/farmer/Payment';
import Receipt from './pages/farmer/Receipt';
import History from './pages/farmer/History';
import Notifications from './pages/farmer/Notifications';
import FarmerProfile from './pages/farmer/Profile';
import OfficerDashboard from './pages/officer/Dashboard';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';

export const router = createBrowserRouter([
  { path: '/', Component: SplashScreen },
  { path: '/onboarding', Component: Onboarding },
  { path: '/login', Component: Login },
  {
    path: '/farmer',
    Component: FarmerLayout,
    children: [
      { index: true, Component: FarmerHome },
      { path: 'home', Component: FarmerHome },
      { path: 'queue', Component: Queue },
      { path: 'centers', Component: Centers },
      { path: 'centers/:id', Component: CenterDetails },
      { path: 'book', Component: Booking },
      { path: 'book/confirmed', Component: TokenConfirmed },
      { path: 'tracking', Component: Tracking },
      { path: 'payment', Component: Payment },
      { path: 'receipt', Component: Receipt },
      { path: 'history', Component: History },
      { path: 'notifications', Component: Notifications },
      { path: 'profile', Component: FarmerProfile },
    ],
  },
  { path: '/officer', Component: OfficerDashboard },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'analytics', Component: Analytics },
    ],
  },
]);
