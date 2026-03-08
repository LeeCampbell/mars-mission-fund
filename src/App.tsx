import { BrowserRouter, Routes, Route } from 'react-router'

function HomePage() {
  return <div style={{ padding: '2rem' }}>Home</div>
}

function AboutPage() {
  return <div style={{ padding: '2rem' }}>About</div>
}

function ContactPage() {
  return <div style={{ padding: '2rem' }}>Contact</div>
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
