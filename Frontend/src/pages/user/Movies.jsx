import { API } from "@/config/api"

import axios from "axios"
import { useEffect, useState } from "react"
import { CardImage } from "@/components/common/CardImage"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"

export function Movies() {
  const [movies, setMovies] = useState([])

  const {
    register,
    watch,
  } = useForm()

  const search = watch("text")

  // Get movies from your backend
  useEffect(() => {
    async function getMovies() {
      try {
        const response = await axios.get(
          `${API}/movies`
        )

        setMovies(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    getMovies()
  }, [])

  // Filter movies when searching
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes((search || "").toLowerCase())
  )

  return (
    <div className="overflow-hidden p-10 bg-[#000000]">

      {/* Search */}
      <div className="flex justify-center mt-8">
        <div className="relative w-full max-w-xl">

          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search />
          </span>

          <input
            {...register("text")}
            type="text"
            placeholder="Search for a movie..."
            className="
              w-full
              h-12
              rounded-full
              border
              border-white/20
              bg-white/10
              pl-12
              pr-5
              text-sm
              text-white
              placeholder:text-gray-400
              outline-none
              backdrop-blur-md
            "
          />

        </div>
      </div>

      <h1 className="text-white text-sm mb-3 mt-5">
        Now showing
      </h1>

      <div className="
      flex flex-wrap gap-10
      ">

        {filteredMovies.map((item) => (
          <CardImage
            key={item._id}
            logo={item.posterUrl}
            title={item.title}
            description={item.description}
            rating={item.rating}
            id={item._id}
            role="user"
          />
        ))}

      </div>

    </div>
  )
}
