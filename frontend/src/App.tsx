import { useEffect } from 'react'
import { useEVRPStore } from './lib/evrp-store'
import { checkAuth } from './lib/auth-service'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function App() {
  const isAuthenticated = useEVRPStore((s) => s.isAuthenticated)
  const isCheckingAuth = useEVRPStore((s) => s.isCheckingAuth)
  const setAuthenticated = useEVRPStore((s) => s.setAuthenticated)
  const setCheckingAuth = useEVRPStore((s) => s.setCheckingAuth)

  useEffect(() => {
    checkAuth().then((ok) => {
      setAuthenticated(ok)
      setCheckingAuth(false)
    })
  }, [setAuthenticated, setCheckingAuth])

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground text-sm">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <HomePage />
}

export default App
