import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import axios from "axios";

import { shows } from "@/contexts/movies";
import { CardImage } from "@/components/CardImage";
import { MoviesTable } from "@/components/MoviesTable";
import { Edit } from "@/components/Edit";

export function AddShows() {

    const { movies, setMovies } = useContext(shows);

    const [showForm, setShowForm] = useState(false);

    const {
        register,
        handleSubmit,
        reset
    } = useForm();

    useEffect(() => {

        async function getMovies() {

            const response = await axios.get(
                "http://localhost:5000/api/movies"
            );

            setMovies(response.data);
        }

        getMovies();

    }, []);

    async function addMovie(data) {

        const response = await axios.post(
            "http://localhost:5000/api/movies",
            data
        );

        setMovie([...movies, response.data]);

        reset();

        setShowForm(false);
    }

    return (
        <div className="w-full h-screen">
            <div className="flex justify-between ">
                 <h2 className="text-white capitalize font-bold m-4 text-lg">add <span className="text-[#922B3E] underline">movies</span></h2>
            <button className="text-white bg-[#1d0b10] rounded-xl text-gray-500 p-4 capitalize m-4 cursor-pointer">add movie</button>
            </div>
           
            <MoviesTable />
        </div>
       
    )
}