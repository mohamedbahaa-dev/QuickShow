export function Movies(){
      const {
    register,
    watch,
  } = useForm()

let search=watch("text")

let movies =useLoaderData()

let navigate=useNavigate()
const [hoveredCard, setHoveredCard] = useState(null);

        useEffect(() => {
  const timer = setTimeout(() => {
    navigate(`/movies?search=${encodeURIComponent(search || "")}`);
  }, 200);

  return () => clearTimeout(timer);
}, [search]);
        return(
            <>
            <div className="overflow-hidden p-2 bg-[#000000] p-10">
                {/* Search */}
<div className="flex justify-center mt-8">
  <div className="relative w-full max-w-xl">

    {/* Search Icon */}
    <span className="absolute left-4 top-1/2 -translate-y-1/2">
      <Search className=" "/>
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
        transition-all
        duration-300
  
      "
    />

  </div>
</div>
                <h1 className="text-white text-sm mb-3">Now showing</h1>
                <div  className="grid  grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 justify-items-start">
                    {movies.map((item)=>{
                        return(
                            <CardImage logo={item?.poster_path} title={item?.original_title} 
                            description={item?.overview} rating={item?.vote_average.toFixed(2)} id={item.id}   hoveredCard={hoveredCard}
  setHoveredCard={setHoveredCard} />
                        )
                    })}
                </div>
            </div>
            </>
        )
    
}
import axios from "axios"
import { useEffect } from "react"
import { useState } from "react"
import { CardImage } from "./CardImage"
import { Link } from "react-router"
import { Search } from "lucide-react"
import { useLoaderData } from "react-router"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router";
