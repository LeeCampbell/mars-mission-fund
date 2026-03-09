import { BrowserRouter, Route, Routes } from 'react-router'
import { Button } from './components/ui/Button'

function HomePage() {
  return (
    <main id="main-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>Button Component — TASK-01</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button variant="primary" disabled>Disabled Primary</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
        <Button variant="ghost" disabled>Disabled Ghost</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button href="/about" variant="primary">Link Button (href)</Button>
      </div>
    </main>
  )
}

function AboutPage() {
  return <main id="main-content" style={{ padding: '2rem' }}><h1>About</h1></main>
}

function ContactPage() {
  return <main id="main-content" style={{ padding: '2rem' }}><h1>Contact</h1></main>
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
