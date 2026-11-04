import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthConfig } from "@/lib/useAuthConfig"
import { formatDay, formatTime, formatMoney, formatDateTime } from "@/lib/format"

export function ListBooking() {
  const authConfig = useAuthConfig()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function getBookings() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/bookings",
          await authConfig()
        )
        setBookings(response.data)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    getBookings()
  }, [])

  // بحث بالاسم أو الإيميل أو اسم الفيلم
  const query = search.trim().toLowerCase()
  const filtered = bookings.filter(
    (b) =>
      !query ||
      b.user.name.toLowerCase().includes(query) ||
      b.user.email.toLowerCase().includes(query) ||
      b.movie.toLowerCase().includes(query)
  )

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex justify-between items-center flex-wrap gap-2 m-4">
        <h2 className="text-white capitalize font-bold text-lg">
          list <span className="text-[#922B3E] underline">bookings</span>
        </h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, email or movie..."
          className="bg-[#1d0b10] text-white text-sm rounded-md px-3 py-2 outline-none border border-red-500/30 w-[260px] max-sm:w-full"
        />
      </div>

      <div className="m-4 overflow-x-auto rounded-xl">
        <Table className="min-w-[1000px] bg-[#1d0b10] text-gray-500">
          <TableHeader className="border-none">
            <TableRow>
              {["user", "movie", "date", "time", "hall", "seats", "total", "status", "booked at"].map(
                (h) => (
                  <TableHead key={h} className="text-center capitalize">
                    {h}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b._id} className="border-red-500/10">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {b.user.imageUrl && (
                        <img
                          src={b.user.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="text-left">
                        <p className="text-white text-sm">
                          {b.user.name || "Unknown user"}
                        </p>
                        <p className="text-xs">{b.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white">{b.movie}</TableCell>
                  <TableCell className="text-center">{formatDay(b.date)}</TableCell>
                  <TableCell className="text-center">{formatTime(b.time)}</TableCell>
                  <TableCell className="text-center">{b.hall}</TableCell>
                  <TableCell className="text-center text-white">
                    {b.seats.join(", ")}
                  </TableCell>
                  <TableCell className="text-center text-white">
                    {formatMoney(b.totalPrice)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        b.status === "confirmed" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {b.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {formatDateTime(b.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}