import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

const TITLE_MAP: Record<string, string> = {
  '/': 'Mars Mission Fund',
  '/about': 'About — Mars Mission Fund',
  '/contact': 'Contact — Mars Mission Fund',
};

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    document.title = TITLE_MAP[location.pathname] ?? 'Mars Mission Fund';
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
