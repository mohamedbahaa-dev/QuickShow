import { API } from "@/config/api"
import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router"
import { useAuth } from "@clerk/react"
import axios from "axios"

export function AdminGuard() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [status, setStatus] = useState("loading") // loading | admin | denied

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setStatus("denied"); return }

    let cancelled = false
    async function checkAdmin() {
      try {
        const token = await getToken()
        const { data } = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled) setStatus(data.isAdmin ? "admin" : "denied")
      } catch (error) {
        if (!cancelled) setStatus("denied")
      }
    }
    checkAdmin()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, getToken])

  if (status === "loading") {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">Checking permissions...</div>
  }
  if (status === "denied") return <Navigate to="/" replace />
  return <Outlet />
}