import { BrowserRouter, Routes, Route } from 'react-router'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<main className="text-red-500">Home — Mars Mission Fund</main>} />
        <Route path="/about" element={<main className="text-red-500">About — Mars Mission Fund</main>} />
        <Route path="/contact" element={<main className="text-red-500">Contact — Mars Mission Fund</main>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
