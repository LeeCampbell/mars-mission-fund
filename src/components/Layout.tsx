import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/contact': 'Contact',
}

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    const page = pageTitles[location.pathname] ?? 'Page'
    document.title = `${page} | Mars Mission Fund`
  }, [location.pathname])

  return (
    <>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        style={{ paddingTop: 'var(--header-height)' }}
      >
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
