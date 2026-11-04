import { useContext, useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "@clerk/react"
import {
  DollarSign,
  Play,
  Users,
  ChartNoAxesCombined,
  FaceSlightlyFrowning,
} from "lucide-react"

import { shows } from "@/contexts/movies"
import { CardImage } from "@/components/CardImage"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthConfig } from "@/lib/useAuthConfig"
import { formatDay, formatMoney } from "@/lib/format"

export function Dashboard() {
  const { movies, setMovies } = useContext(shows)
  const { userId: myId } = useAuth()
  const authConfig = useAuthConfig()

  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: 0,
    totalUsers: 0,
  })
  const [users, setUsers] = useState([])

  const cards = [
    { id: 1, name: "total bookings", value: stats.totalBookings, icon: <ChartNoAxesCombined color="white" /> },
    { id: 2, name: "total revenue", value: formatMoney(stats.totalRevenue), icon: <DollarSign color="white" /> },
    { id: 3, name: "active shows", value: movies.length, icon: <Play color="white" /> },
    { id: 4, name: "total users", value: stats.totalUsers, icon: <Users color="white" /> },
  ]

  useEffect(() => {
    async function getMovies() {
      const response = await axios.get("http://localhost:5000/api/movies")
      setMovies(response.data)
    }

    async function getAdminData() {
      try {
        const config = await authConfig()
        const [statsRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/stats", config),
          axios.get("http://localhost:5000/api/admin/users", config),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard data")
      }
    }

    getMovies()
    getAdminData()
  }, [])

  // حظر / فك حظر
  async function handleBan(u) {
    const action = u.banned ? "unban" : "ban"
    const label = u.banned ? "Unblock" : "Block"

    if (!window.confirm(`${label} ${u.name || u.email}?`)) return

    try {
      await axios.post(
        `http://localhost:5000/api/admin/users/${u.clerkId}/${action}`,
        {},
        await authConfig()
      )

      setUsers((prev) =>
        prev.map((x) =>
          x.clerkId === u.clerkId ? { ...x, banned: !u.banned } : x
        )
      )
      toast.success(u.banned ? "User unblocked" : "User blocked")
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed")
    }
  }

  // ترقية لأدمن / إزالة صلاحية الأدمن
  async function handleRole(u) {
    const makeAdmin = u.role !== "admin"
    const name = u.name || u.email

    const message = makeAdmin
      ? `Make ${name} an admin? They will get full access to the dashboard.`
      : `Remove admin access from ${name}?`

    if (!window.confirm(message)) return

    try {
      await axios.post(
        `http://localhost:5000/api/admin/users/${u.clerkId}/role`,
        { role: makeAdmin ? "admin" : "user" },
        await authConfig()
      )

      setUsers((prev) =>
        prev.map((x) =>
          x.clerkId === u.clerkId
            ? { ...x, role: makeAdmin ? "admin" : "user" }
            : x
        )
      )
      toast.success(makeAdmin ? "User is now admin" : "Admin access removed")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change role")
    }
  }

  // حذف نهائي
  async function handleDeleteUser(u) {
    if (
      !window.confirm(
        `Delete ${u.name || u.email} permanently? This cannot be undone.`
      )
    )
      return

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/users/${u.clerkId}`,
        await authConfig()
      )

      setUsers((prev) => prev.filter((x) => x.clerkId !== u.clerkId))
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
      toast.success("User deleted")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user")
    }
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h2 className="text-white capitalize font-bold m-4 text-lg">
        admin <span className="text-[#922B3E] underline">dashboard</span>
      </h2>

      <div className="flex justify-between flex-wrap gap-2 w-full max-xs:flex-col max-md:items-center">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border border-red-500/30 bg-[#1d0b10] p-4 w-[calc(50%-4px)] flex justify-between items-center max-sm:w-full"
          >
            <div className="text-white text-md">
              <p>{card.name}</p>
              <p className="font-bold">{card.value}</p>
            </div>
            {card.icon}
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="mt-6">
        <h2 className="text-white capitalize">users</h2>

        <div className="mt-3 overflow-x-auto rounded-xl">
          <Table className="min-w-[950px] bg-[#1d0b10] text-gray-500">
            <TableHeader className="border-none">
              <TableRow>
                {["user", "email", "role", "bookings", "spent", "joined", "actions"].map((h) => (
                  <TableHead key={h} className="text-center capitalize">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No users yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.clerkId} className="border-red-500/10">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.imageUrl && (
                          <img src={u.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                        )}
                        <span className="text-white text-sm">{u.name || "Unknown"}</span>
                        {u.banned && (
                          <span className="text-red-400 text-[10px] border border-red-400/50 rounded px-1">
                            blocked
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{u.email}</TableCell>
                    <TableCell className="text-center">
                      <span className={u.role === "admin" ? "text-[#922B3E] font-bold" : ""}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-white">{u.bookings}</TableCell>
                    <TableCell className="text-center text-white">{formatMoney(u.spent)}</TableCell>
                    <TableCell className="text-center text-xs">{formatDay(u.createdAt)}</TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      {u.owner || u.clerkId === myId ? (
                        <span className="text-xs">-</span>
                      ) : (
                        <div className="flex justify-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleRole(u)}
                            className="text-xs text-green-400 hover:opacity-75 cursor-pointer"
                          >
                            {u.role === "admin" ? "Remove admin" : "Make admin"}
                          </button>

                          {u.role !== "admin" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleBan(u)}
                                className="text-xs text-yellow-400 hover:opacity-75 cursor-pointer"
                              >
                                {u.banned ? "Unblock" : "Block"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="text-xs text-red-400 hover:opacity-75 cursor-pointer"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Now shows */}
      <div className="mt-6">
        <h2 className="text-white capitalize">now shows</h2>
        {movies.length === 0 ? (
          <div className="flex items-center flex-col">
            <FaceSlightlyFrowning className="text-gray-400 w-[250px] h-[250px] max-sm:w-20 max-sm:h-20" />
            <h2 className="text-gray-500 capitalize font-bold">nothing to show</h2>
          </div>
        ) : (
          <div className="flex mt-3 flex-wrap gap-10 ">
            {movies.map((movie) => (
              <CardImage
                key={movie._id}
                logo={movie.posterUrl}
                title={movie.title}
                description={movie.description}
                rating={movie.rating}
                id={movie._id}
                role={"admin"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}