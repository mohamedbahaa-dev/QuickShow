
import { useParams, Link } from "react-router"
import { useState, useEffect } from "react"
import axios from "axios"

import { AddDay } from "@/components/AddDay"
import { AddTime } from "@/components/AddTime"
import { Trash2 } from "lucide-react"
import { useAuthConfig } from "@/lib/useAuthConfig"
import toast from "react-hot-toast"

function formatDay(iso, locale = "en-US") {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatTime(time) {
  if (!time || typeof time !== "string") {
    return "Invalid time"
  }

  const cleanTime = time.trim()
  const match = cleanTime.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/
  )

  if (!match) {
    return cleanTime
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "Invalid time"
  }

  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
}


export function ShowDays() {
  const { id } = useParams()
  const authConfig = useAuthConfig()

async function handleDeleteTime(showdayId, timeId) {
  if (!window.confirm("Delete this showtime?")) return
  try {
    await axios.delete(`http://localhost:5000/api/showtimes/${timeId}`, await authConfig())
    setTimes((prev) => ({
      ...prev,
      [showdayId]: prev[showdayId].filter((t) => t._id !== timeId),
    }))
    toast.success("Showtime deleted")
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete showtime")
  }
}

  const [movie, setMovie] = useState(null)
  const [dates, setDates] = useState([])
  const [times, setTimes] = useState({})

  // Get movie information
  useEffect(() => {
    async function getMovie() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/movies/${id}`
        )

        setMovie(response.data)
      } catch (error) {
        console.error(
          "Get Movie Error:",
          error.response?.data || error.message
        )
      }
    }

    if (id) getMovie()
  }, [id])

  // Get show days
  useEffect(() => {
    async function getDates() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/movies/${id}/showdays`
        )

        setDates(response.data)
      } catch (error) {
        console.error(
          "Get Show Days Error:",
          error.response?.data || error.message
        )
      }
    }

    if (id) getDates()
  }, [id])

  // Get showtimes for each show day
  useEffect(() => {
    async function getAllTimes() {
      try {
        const results = await Promise.all(
          dates.map(async (day) => {
            const response = await axios.get(
              `http://localhost:5000/api/showdays/${day._id}/showtimes`
            )

            return {
              showdayId: day._id,
              showtimes: response.data,
            }
          })
        )

        setTimes((prev) => {
          const updated = { ...prev }

          results.forEach(({ showdayId, showtimes }) => {
            updated[showdayId] = showtimes
          })

          return updated
        })
      } catch (error) {
        console.error(
          "Get Showtimes Error:",
          error.response?.data || error.message
        )
      }
    }

    if (dates.length > 0) {
      getAllTimes()
    } else {
      setTimes({})
    }
  }, [dates])
async function handleDeleteTime(showdayId, timeId) {
  if (!window.confirm("Delete this showtime?")) return

  try {
    await axios.delete(
      `http://localhost:5000/api/showtimes/${timeId}`,
      await authConfig()
    )

    setTimes((prev) => ({
      ...prev,
      [showdayId]: prev[showdayId].filter((t) => t._id !== timeId),
    }))

    toast.success("Showtime deleted")
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete showtime")
  }
}
  return (
    <div className="m-5 w-full">
      {/* Back */}
      <Link
        to="/admin/addmovies"
        className="bg-[#1d0b10] text-white m-4 rounded-xl hover:opacity-75 duration-300 capitalize p-4 inline-block"
      >
        back to movies
      </Link>

      {/* Movie information */}
      <div className="flex gap-4 mt-4 items-center">
        <img
          src={movie?.posterUrl}
          className="w-[150px] rounded-lg"
          alt={movie?.title || "Movie poster"}
        />

        <div>
          <h1 className="text-white capitalize">
            {movie?.title}
          </h1>

          <p className="text-gray-500 font-bold capitalize text-sm">
            {movie?.genre}. {movie?.duration} min. {movie?.language}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="flex justify-between mt-6 w-full items-center">
        <h2 className="capitalize text-white">
          show days & times
        </h2>

        <AddDay id={id} />
      </div>

      {/* Show days */}
      {dates.map((day) => (
        <div
          key={day._id}
          className="bg-[#1d0b10] mt-3 rounded-xl p-3"
        >
          {/* Day */}
          <div className="flex justify-between items-center">
            <p className="text-white">
              {formatDay(day.date)}
            </p>

            <AddTime id={day._id} />
          </div>

          {/* Showtimes */}
          <div className="mt-3">
            {times[day._id]?.map((time) => (
              <div
                key={time._id}
                className="bg-black/30 text-white p-3 rounded-lg mb-2"
              >
                  <button
    type="button"
    onClick={() => handleDeleteTime(day._id, time._id)}
    className="absolute top-3 right-3 text-red-400 hover:opacity-75 cursor-pointer"
  >
    <Trash2 size={16} />
  </button>
                <p className="font-semibold">
  {formatTime(time.time)}
</p>
                <p className="text-gray-400 text-sm">
                  Hall: {time.hall}
                </p>

                <p className="text-gray-400 text-sm">
                  Seats: {time.totalSeats}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
