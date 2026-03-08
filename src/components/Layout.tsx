import { Outlet } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <>
      <Header />
      <main id="main-content" style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
