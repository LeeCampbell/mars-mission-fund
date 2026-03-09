import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { CampaignsPage } from './pages/CampaignsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
