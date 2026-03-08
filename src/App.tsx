import { BrowserRouter, Routes, Route } from 'react-router'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<p>Home — coming soon</p>} />
        <Route path="/about" element={<p>About — coming soon</p>} />
        <Route path="/contact" element={<p>Contact — coming soon</p>} />
      </Routes>
    </BrowserRouter>
  )
}
