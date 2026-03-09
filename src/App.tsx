import { BrowserRouter, Routes, Route } from 'react-router'

function HomePage() {
  return <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>Home — Mars Mission Fund</div>
}

function AboutPage() {
  return <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>About — Mars Mission Fund</div>
}

function ContactPage() {
  return <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>Contact — Mars Mission Fund</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}
