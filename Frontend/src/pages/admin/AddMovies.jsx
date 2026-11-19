import { API } from "@/config/api"
import { useContext, useEffect } from "react";
import axios from "axios";

import { shows } from "@/contexts/movies";
import { MoviesTable } from "@/components/admin/MoviesTable";
import { AddMovie } from "@/components/admin/AddMovie";

export function AddMovies() {
  const { setMovies } = useContext(shows);

  useEffect(() => {
    async function getMovies() {
      const response = await axios.get(`${API}/movies`);
      setMovies(response.data);
    }

    getMovies();
  }, []);

  return (
    <div className="w-full h-screen overflow-x-scroll">
      <div className="flex justify-between max-md:flex-col max-md:items-center">
        <h2 className="text-white capitalize font-bold m-4 text-lg">
          add <span className="text-[#922B3E] underline">movies</span>
        </h2>
        <div className="m-4">
          <AddMovie />
        </div>
      </div>

      <MoviesTable />
    </div>
  );
}