import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { Star, Play } from "lucide-react";
import axios from "axios";
import { Shows } from "./Shows";
import { useUser } from "@clerk/react";
import toast from "react-hot-toast";

export function MovieDetails() {
  const { id } = useParams();

  const { isSignedIn } = useUser();

  // Movie data from our backend
  const [data, setData] = useState(null);

  // Show days of the movie from our backend
  const [showDays, setShowDays] = useState([]);

  // Date states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");


  // Is the date chosen?
  const [chosen, setChosen] = useState(false);

  // Get movie from backend
  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/movies/${id}`
        );

        setData(response.data);
      } catch (error) {
        console.log(error);
      }
    }

    getData();
  }, [id]);

  // Get show days of the movie
  useEffect(() => {
    async function getShowDays() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/movies/${id}/showdays`
        );

        setShowDays(response.data);
        setCurrentIndex(0);
        setSelectedDate("");
        setChosen(false);
      } catch (error) {
        console.log(error);
      }
    }

    getShowDays();
  }, [id]);

  // Show loading while API request is running
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Can be undefined if there are no show days yet
  const currentShowDay = showDays[currentIndex];
  console.log(currentShowDay)

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2a1015_0%,_#0b0b0b_40%,_#000000_100%)] px-4 py-8 sm:px-6 lg:px-10">
        {/* Movie information */}
        <div className="mx-auto flex max-w-6xl flex-col gap-8 p-5 sm:p-8 md:flex-row">
          {/* Poster */}
          <div className="flex shrink-0 justify-center md:justify-start">
            <img
              src={data?.posterUrl}
              alt={data?.title}
              className="w-52 rounded-2xl object-cover sm:w-60 md:w-64"
            />
          </div>

          {/* Movie information */}
          <div className="flex flex-1 flex-col justify-center">
            {/* Language */}
            <span className="mb-4 w-fit rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
              {data?.language || "Unknown language"}
            </span>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold capitalize text-white sm:text-3xl md:text-4xl">
              {data?.title}
            </h1>

            {/* Rating */}
            <span className="flex items-center gap-1 text-gray-400">
              <Star className="w-[20px] fill-red-500 text-red-500" />
              {data.rating} user rating
            </span>

            {/* Description */}
            <p className="max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
              {data.description}
            </p>

            {/* Genre */}
            <p className="mt-4 text-sm font-semibold text-gray-300">
              <span className="text-red-400">Genre:</span> {data?.genre}
            </p>

            {/* Duration */}
            <p className="mt-2 text-sm font-semibold text-gray-300">
              <span className="text-red-400">Duration:</span> {data?.duration}{" "}
              minutes
            </p>

            {/* Additional buttons */}
            <div className="mt-4 flex items-center gap-2">
              {/* Watch Trailer */}
              <button className="flex cursor-pointer items-center gap-1 rounded-sm bg-[#101828] p-2 text-xs capitalize text-white transition-opacity duration-300 hover:opacity-75">
                <Play />
                watch trailer
              </button>

              {/* Buy Tickets */}
              <a
                href="#book"
                className="cursor-pointer rounded-sm bg-red-500 p-2 text-xs font-bold text-white"
              >
                Buy Tickets
              </a>
            </div>
          </div>
        </div>

        {/* Choose Date */}
        <div
          id="book"
          className="relative mx-4 mt-10 overflow-hidden rounded-lg border border-red-500/30 bg-[#1d0b10] p-4 sm:mx-6 lg:mx-10"
        >
          {/* Title */}
          <h2 className="text-lg font-bold text-white">Choose Date</h2>

          <div className="mt-6 flex items-center justify-between">
            {/* Date selector */}
            <div className="flex items-center gap-8">
              {/* Left arrow */}
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    setChosen(false);
                  }
                }}
                className="cursor-pointer text-3xl text-white transition-opacity duration-300 hover:opacity-60"
              >
                ‹
              </button>

              {/* Date */}
              {currentShowDay ? (
                <button
                  onClick={() => {
                    // keep only YYYY-MM-DD in case the API returns a full ISO string
                    setSelectedDate(String(currentShowDay._id));
                    setChosen(true);
                  }}
                  className={`flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-md border border-red-500 text-sm text-white transition hover:bg-red-500/10 ${
                    chosen ? "bg-red-500" : ""
                  }`}
                >
                  {/* Day */}
                  <span className="font-semibold">
                    {new Date(currentShowDay.date).getDate()}
                  </span>

                  {/* Month */}
                  <span>
                    {new Date(currentShowDay.date).toLocaleString("en-US", {
                      month: "short",
                    })}
                  </span>
                </button>
              ) : (
                <p className="text-sm text-gray-400">No show days available</p>
              )}

              {/* Right arrow */}
              <button
                onClick={() => {
                  if (currentIndex < showDays.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setChosen(false);
                  }
                }}
                className="cursor-pointer text-3xl text-white transition-opacity duration-300 hover:opacity-60"
              >
                ›
              </button>
            </div>

            {/* Book Now */}
            <div>
              {isSignedIn ? (
                chosen ? (
                  <Link
                    to={`/movies/${id}/${selectedDate}`}
                    className="mb-10 cursor-pointer rounded-md bg-pink-500 p-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-400"
                  >
                    Book Now
                  </Link>
                ) : (
                  <button
                    onClick={() => toast.error("You should choose date first")}
                    className="mb-10 cursor-pointer rounded-md bg-pink-500 p-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-400"
                  >
                    Book Now
                  </button>
                )
              ) : (
                <button
                  onClick={() => toast.error("You should sign in first")}
                  className="mb-10 cursor-pointer rounded-md bg-pink-500 p-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-400"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recommended movies */}
        <div className="p-4">
          <Shows title="you may also like" />
        </div>
      </div>
    </>
  );
}