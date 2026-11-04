
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

import {Trash2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useContext } from "react"
import { shows } from "@/contexts/movies"
import { EditMovie } from "./EditMovie"
import { Link } from "react-router"
import { useAuthConfig } from "@/lib/useAuthConfig"

export function MoviesTable() {
    const { movies, setMovies } = useContext(shows);
    const authConfig = useAuthConfig();
  
  
   async function handleDelete(id) {
  try {
  const response = await axios.delete(
  `http://localhost:5000/api/movies/${id}`,
  await authConfig()
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

            <TableHead className="capitalize text-center ">
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
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded mx-auto"
                />
              </TableCell>

              {/* Title */}
              <TableCell className="text-center">
                {movie.title}
              </TableCell>

              {/* Description */}
              <TableCell className="max-w-[300px] text-center">
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

              {/* Actions */}
              <TableCell>
                <div className="flex justify-center items-center gap-3">

                <EditMovie title={movie.title} description={movie.description} posterUrl={movie.posterUrl}
                duration={movie.duration} genre={movie.genre} langauge={movie.language} id={movie._id}/>
                  <button
                    className="p-2 rounded-md hover:bg-red-500/20 cursor-pointer text-red-400 transition"
                    onClick={()=>handleDelete(movie._id)}
                  >
                    <Trash2 size={17} />
                  </button>
                  <Link to={`/admin/showdays/${movie._id}`} className="bg-[black] p-4 rounded-xl hover:opacity-25 duration-300 transition-opacity">manage shows</Link>

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

