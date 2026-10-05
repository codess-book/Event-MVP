import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import AdminResets from "./pages/AdminResets";
import Profile from "./pages/Profile";
import Sponsors from "./pages/Sponsors";
import SponsorDetail from "./pages/SponsorDetail";
import AdminNotify from "./pages/AdminNotify";
import AdminSponsors from "./pages/AdminSponsors";
import AdminDashboard from "./pages/Admindashboard";
import AdminUsers from "./pages/Adminusers";
import Event from "./pages/Event";
import AdminEvent from "./pages/AdminEvent";
import Challenges from "./pages/Challenges";
import AdminChallenges from "./pages/AdminChallenges";
import Prizes from "./pages/Prizes";
import Members from "./pages/Members";
import Rules from "./pages/Rules";
import InstallPage from "./pages/Installpage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Only for logged-out users */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/install" element={<InstallPage />} />
        </Route>

        {/* only for logeed user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/sponsors/:id" element={<SponsorDetail />} />
          <Route path="/event" element={<Event />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/prizes" element={<Prizes />} />
          <Route path="/members" element={<Members />} />
          <Route path="/rules" element={<Rules />} />
          
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/users"
            element={<AdminUsers title="All users" />}
          />
          <Route
            path="/admin/players"
            element={<AdminUsers type="player" title="Players" />}
          />
          <Route
            path="/admin/members"
            element={<AdminUsers type="member" title="Members" />}
          />
          <Route path="/admin/sponsors" element={<AdminSponsors />} />
          <Route path="/admin/resets" element={<AdminResets />} />
          <Route path="/admin/notify" element={<AdminNotify />} />
          <Route path="/admin/event" element={<AdminEvent />} />
          <Route path="/admin/challenges" element={<AdminChallenges />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
