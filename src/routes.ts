import { createBrowserRouter } from 'react-router';

import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Registration from './pages/Registration';
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
import CropPrices from './pages/farmer/CropPrices';
import CropRegistration from './pages/farmer/CropRegistration';
import MapView from './pages/farmer/MapView';
import OfficerLayout from './pages/officer/Layout';
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerQueue from './pages/officer/Queue';
import OfficerRequests from './pages/officer/Requests';
import OfficerRequestDetail from './pages/officer/RequestDetail';
import OfficerFarmers from './pages/officer/Farmers';
import OfficerSchedules from './pages/officer/Schedules';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import AdminFarmers from './pages/admin/Farmers';
import AdminOfficers from './pages/admin/Officers';
import AdminCenters from './pages/admin/Centers';
import AdminSchedules from './pages/admin/Schedules';
import AdminProcurement from './pages/admin/Procurement';
import AdminPayments from './pages/admin/Payments';
import AdminComplaints from './pages/admin/Complaints';
import AdminSettings from './pages/admin/Settings';

export const router = createBrowserRouter([
  { path: '/', Component: SplashScreen },
  { path: '/onboarding', Component: Onboarding },
  { path: '/login', Component: Login },
  { path: '/register', Component: Registration },
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
      { path: 'crop-prices', Component: CropPrices },
      { path: 'crop-registration', Component: CropRegistration },
      { path: 'map', Component: MapView },
    ],
  },
  {
    path: '/officer',
    Component: OfficerLayout,
    children: [
      { index: true, Component: OfficerDashboard },
      { path: 'dashboard', Component: OfficerDashboard },
      { path: 'queue', Component: OfficerQueue },
      { path: 'requests', Component: OfficerRequests },
      { path: 'requests/:id', Component: OfficerRequestDetail },
      { path: 'farmers', Component: OfficerFarmers },
      { path: 'schedules', Component: OfficerSchedules },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'analytics', Component: Analytics },
      { path: 'farmers', Component: AdminFarmers },
      { path: 'officers', Component: AdminOfficers },
      { path: 'centers', Component: AdminCenters },
      { path: 'schedules', Component: AdminSchedules },
      { path: 'procurement', Component: AdminProcurement },
      { path: 'payments', Component: AdminPayments },
      { path: 'complaints', Component: AdminComplaints },
      { path: 'settings', Component: AdminSettings },
    ],
  },
]);

