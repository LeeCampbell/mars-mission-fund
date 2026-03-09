import { BrowserRouter, Route, Routes } from 'react-router'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { StatCard } from './components/ui/StatCard'
import { SectionLabel } from './components/ui/SectionLabel'
import { Badge } from './components/ui/Badge'
import { ProgressBar } from './components/ui/ProgressBar'

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
      <h2>Card Component — TASK-02</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '800px' }}>
        <Card>
          <h3 style={{ margin: 0 }}>Card without accent</h3>
          <p style={{ margin: '0.5rem 0 0' }}>Standard card surface with subtle border.</p>
        </Card>
        <Card accent>
          <h3 style={{ margin: 0 }}>Card with accent</h3>
          <p style={{ margin: '0.5rem 0 0' }}>Top gradient accent bar visible above.</p>
        </Card>
      </div>
      <h2>StatCard Component — TASK-03</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '800px' }}>
        <StatCard label="Total Raised" value="$2.4M" subText="+12% this month" subVariant="positive" />
        <StatCard label="Active Missions" value="18" subText="Steady" subVariant="neutral" />
        <StatCard label="Backers" value="9,342" />
      </div>
      <h2>SectionLabel Component — TASK-04</h2>
      <SectionLabel number="01" title="IDENTITY" />
      <SectionLabel number="02" title="MISSION" />
      <h2>Badge Component — TASK-05</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Badge variant="funded">Funded</Badge>
        <Badge variant="active">Active</Badge>
        <Badge variant="new">New</Badge>
      </div>
      <h2>ProgressBar Component — TASK-06</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        <ProgressBar value={0} label="0% funded" />
        <ProgressBar value={50} label="50% funded" />
        <ProgressBar value={75} label="75% funded" />
        <ProgressBar value={100} complete label="100% funded" />
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
