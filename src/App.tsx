import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
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
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
