
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Pencil, Trash2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useContext } from "react"
import { shows } from "@/contexts/movies"

export function MoviesTable() {
    const { movies, setMovies } = useContext(shows);
  
  
   async function handleDelete(id) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/movies/${id}`
    );

    if (response.status === 200) {
      toast.success("Movie is deleted successfully");

      const moviesResponse = await axios.get(
                "http://localhost:5000/api/movies"
            );

      setMovies(moviesResponse.data);
    }
  } catch (error) {
    toast.error("Error while deleting the movie");
    console.log(error);
  }
}
  return (
    <div className="w-full overflow-x-auto rounded-xl">
      <Table className="min-w-[1100px] bg-[#1d0b10] text-gray-500">

        <TableCaption>
          A list of your recent movies.
        </TableCaption>

        <TableHeader className="border-none">
          <TableRow>

            <TableHead className="w-[100px] text-center capitalize">
              logo
            </TableHead>

            <TableHead className="text-center capitalize">
              title
            </TableHead>

            <TableHead className="capitalize ">
              description
            </TableHead>

            <TableHead className="text-center capitalize">
              duration
            </TableHead>

            <TableHead className="text-center capitalize">
              genre
            </TableHead>

            <TableHead className="text-center capitalize">
              language
            </TableHead>

            <TableHead className="text-center capitalize">
              rating
            </TableHead>

            <TableHead className="text-center capitalize">
              actions
            </TableHead>

          </TableRow>
        </TableHeader>

        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie._id}>

              {/* Logo */}
              <TableCell className="text-center">
                <img
                  src={movie.logo}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded mx-auto"
                />
              </TableCell>

              {/* Title */}
              <TableCell className="text-center">
                {movie.title}
              </TableCell>

              {/* Description */}
              <TableCell className="max-w-[300px]">
                <p className="line-clamp-2">
                  {movie.description}
                </p>
              </TableCell>

              {/* Duration */}
              <TableCell className="text-center">
                {movie.duration}
              </TableCell>

              {/* Genre */}
              <TableCell className="text-center">
                {movie.genre}
              </TableCell>

              {/* Language */}
              <TableCell className="text-center">
                {movie.language}
              </TableCell>

              {/* Rating */}
              <TableCell className="text-center">
                {movie.rating}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex justify-center items-center gap-3">

                  <button
                    className="p-2 rounded-md hover:bg-blue-500/20 transition cursor-pointer"
                    onClick={() => console.log("Edit", movie._id)}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    className="p-2 rounded-md hover:bg-red-500/20 cursor-pointer text-red-400 transition"
                    onClick={()=>handleDelete(movie._id)}
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>
              Total Movies
            </TableCell>

            <TableCell className="text-center">
              {movies.length}
            </TableCell>
          </TableRow>
        </TableFooter>

      </Table>
    </div>
  )
}

