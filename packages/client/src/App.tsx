import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { CampaignsPage } from './pages/CampaignsPage'

const CampaignDetailPage = React.lazy(() =>
  import('./pages/CampaignDetailPage').then((m) => ({
    default: m.CampaignDetailPage,
  }))
)
const ContributePlaceholderPage = React.lazy(() =>
  import('./pages/ContributePlaceholderPage').then((m) => ({
    default: m.ContributePlaceholderPage,
  }))
)
const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)
const AdminUsersPage = React.lazy(() =>
  import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
)
const ReviewQueuePage = React.lazy(() =>
  import('./pages/ReviewQueuePage').then((m) => ({ default: m.ReviewQueuePage }))
)
const ReviewDetailPage = React.lazy(() =>
  import('./pages/ReviewDetailPage').then((m) => ({ default: m.ReviewDetailPage }))
)
const AdminMilestonesPage = React.lazy(() =>
  import('./pages/AdminMilestonesPage').then((m) => ({ default: m.AdminMilestonesPage }))
)
const AdminCancellationsPage = React.lazy(() =>
  import('./pages/AdminCancellationsPage').then((m) => ({ default: m.AdminCancellationsPage }))
)
const NotificationsPage = React.lazy(() =>
  import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/contribute/:id" element={<ContributePlaceholderPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
            <Route element={<ProtectedRoute requireReviewer />}>
              <Route path="/review" element={<ReviewQueuePage />} />
              <Route path="/review/:id" element={<ReviewDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/milestones" element={<AdminMilestonesPage />} />
              <Route path="/admin/cancellations" element={<AdminCancellationsPage />} />
            </Route>
            <Route element={<ProtectedRoute requireReviewer />}>
              <Route path="/review-queue" element={<ReviewQueuePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
