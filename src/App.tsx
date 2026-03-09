import { BrowserRouter, Routes, Route } from 'react-router';

function HomePage() {
  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <h1>About</h1>
    </main>
  );
}

function ContactPage() {
  return (
    <main>
      <h1>Contact</h1>
    </main>
  );
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
  );
}
