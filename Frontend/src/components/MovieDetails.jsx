import { useLoaderData, useParams, Link } from "react-router";
import { Star, Play } from "lucide-react";
import { useState } from "react";
import { Shows } from "./Shows";
import { useUser } from "@clerk/react";
import toast from "react-hot-toast";
export function MovieDetails() {
  /* we will use api for daes in tuis compentent*/
  let data = useLoaderData();

  let { id } = useParams();

  let {isSignedIn}=useUser();
  let [choosed,setChossed]=useState(false)
let [colr,setColor]=useState(false)
const [hoveredCard, setHoveredCard] = useState(null);
  const cast = data.credits.cast.slice(0, 6);

  // Available dates
  const dates = [
    "2027-10-20",
    "2027-10-21",
    "2027-10-22",
    "2027-10-23",
    "2027-10-24",
    "2027-10-25",
  ];


  const [currentIndex, setCurrentIndex] = useState(0);


  const [selectedDate, setSelectedDate] = useState(dates[0]);

 
  const currentDate = new Date(dates[currentIndex]);

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2a1015_0%,_#0b0b0b_40%,_#000000_100%)] px-4 py-8 sm:px-6 lg:px-10">

        {/* Movie information */}
        <div className="mx-auto flex max-w-6xl flex-col gap-8 p-5 sm:p-8 md:flex-row">

          {/* Poster */}
          <div className="flex shrink-0 justify-center md:justify-start">
            <img
              src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
              alt={data.title}
              className="
                w-52
                rounded-2xl
                object-cover
                sm:w-60
                md:w-64
              "
            />
          </div>

          {/* Movie information */}
          <div className="flex flex-1 flex-col justify-center">

            {/* Language */}
            <span
              className="
                mb-4
                w-fit
                rounded-full
                border border-red-400/20
                bg-red-500/10
                px-3
                py-1
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-red-400
              "
            >
              {data.spoken_languages?.[0]?.name || "Unknown language"}
            </span>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold capitalize text-white sm:text-3xl md:text-4xl">
              {data.title}
            </h1>

            {/* Rating */}
            <span className="flex items-center gap-1 capitalize text-gray-400">
              <Star className="w-[20px] fill-red-500 text-red-500" />
              {data.vote_average.toFixed(2)} user rating
            </span>

            {/* Description */}
            <p className="max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
              {data.overview}
            </p>

            {/* Release date */}
            <p className="mt-6 text-sm font-semibold text-gray-300">
              <span className="text-red-400">
                Released:
              </span>{" "}
              {data.release_date}
            </p>

            {/* Additional buttons */}
            <div className="mt-4 flex items-center gap-2">

              {/* Watch Trailer */}
              <button
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-1
                  rounded-sm
                  bg-[#101828]
                  p-2
                  text-xs
                  capitalize
                  text-white
                  transition-opacity
                  duration-300
                  hover:opacity-75
                "
              >
                <Play />
                watch trailer
              </button>

              {/* Buy Tickets */}
              <a
                href="#book"
                className="
                  cursor-pointer
                  rounded-sm
                  bg-red-500
                  p-2
                  text-xs
                  font-bold
                  text-white
                "
              >
                Buy Tickets
              </a>

            </div>
          </div>
        </div>

        {/* Cast */}
        <div className="p-2">

          <h2 className="text-white capitalize">
            Your Favorite Cast
          </h2>

          <div className="flex flex-wrap justify-center gap-7 p-3">

            {cast.map((actor) => (
              <div
                key={actor.id}
                className="w-24 text-center"
              >
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : "/profile-placeholder.png"
                  }
                  alt={actor.name}
                  className="h-20 w-20 rounded-full object-cover"
                />

                <p className="mt-2 text-sm font-semibold text-white">
                  {actor.name}
                </p>
              </div>
            ))}

          </div>

          {/* Choose Date */}
          <div
            className="
              relative
              mx-4
              mt-10
              overflow-hidden
              rounded-lg
              border
              border-red-500/30
              bg-[#1d0b10]
              p-4
              sm:mx-6
              lg:mx-10
            "
          >

            {/* Title */}
            <h2 className="text-lg font-bold text-white">
              Choose Date
            </h2>

            <div className="mt-6 flex items-center justify-between">

              {/* Date selector */}
              <div className="flex items-center gap-8">

                {/* Left arrow */}
                <button
                  onClick={() => {
                    if (currentIndex > 0) {
                      const newIndex = currentIndex - 1;

                      setCurrentIndex(newIndex);
                      setSelectedDate(dates[newIndex]);
                    }
                  }}
                  className="
                    text-3xl
                    text-white
                    transition-opacity
                    duration-300
                    hover:opacity-60 
                    cursor-pointer
                  "
                >
                  ‹
                </button>

                {/* Date */}
                <button
                  onClick={() => {
                    setSelectedDate(dates[currentIndex]);
                    setChossed(prev=>!prev)
                    setColor(color=>!color)
                  }}
                  className={`
                    flex
                    h-14
                    w-14
                    flex-col
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-red-500
                    text-sm
                    text-white
                    transition
                    hover:bg-red-500/10
                     cursor-pointer
                     ${choosed?"bg-[red]":""}
                  `}
                >

                  {/* Day */}
                  <span className="font-semibold">
                    {currentDate.getDate()}
                  </span>

                  {/* Month */}
                  <span>
                    {currentDate.toLocaleString("en-US", {
                      month: "short",
                    })}
                  </span>

                </button>

                {/* Right arrow */}
                <button
                  onClick={() => {
                    if (currentIndex < dates.length - 1) {
                      const newIndex = currentIndex + 1;

                      setCurrentIndex(newIndex);
                      setSelectedDate(dates[newIndex]);
                    }
                  }}
                  className="
                    text-3xl
                    text-white
                    transition-opacity
                    duration-300
                    hover:opacity-60
                     cursor-pointer
                  "
                >
                  ›
                </button>

              </div>
              <div id="book">
                   {isSignedIn?(
                choosed?(
                           <Link
                to={`/movies/${id}/${selectedDate}`}
                className="
                  mb-10
                  cursor-pointer
                  rounded-md
                  bg-pink-500
                  p-3
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-pink-400
                "
              >
                Book Now
              </Link>
                ):(
                        <button
                    onClick={()=>toast.error("you should choose date first")}
                className="
                  mb-10
                  cursor-pointer
                  rounded-md
                  bg-pink-500
                  p-3
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-pink-400
                "
              >
                Book Now
              </button>
              
                )
              ):(
                    <button
                    onClick={()=>toast.error("you should sign in first")}
                className="

                  mb-10
                  cursor-pointer
                  rounded-md
                  bg-pink-500
                  p-3
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-pink-400
                "
              >
                Book Now
              </button>
              )}

              </div>

              {/* Book Now */}
           
            </div>
          </div>

          {/* Recommended movies */}
          <div className="p-4">
            <Shows title="you may also like" />
          </div>

        </div>
      </div>
    </>
  );
}