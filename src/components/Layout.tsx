import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'

const mainStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 64px)',
  // 64px matches the sticky header height; page components may add their own padding
}

const routeTitles: Record<string, string> = {
  '/': 'Home — Mars Mission Fund',
  '/about': 'About — Mars Mission Fund',
  '/contact': 'Contact — Mars Mission Fund',
}

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    const title = routeTitles[location.pathname] ?? 'Mars Mission Fund'
    document.title = title
  }, [location.pathname])

  return (
    <>
      <Header />
      <main id="main-content" style={mainStyle}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
