import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { useContext } from "react";

import { Shows } from "./Shows";
import { Link } from "react-router";
export function Home() {
  return (
    <>
      {/* Hero Section */}
      <div
        className="
          min-h-screen
          bg-[url('/background.png')]
          bg-cover
          bg-center
          bg-no-repeat
          overflow-hidden
        "
      >
        <Header />

        <div className="min-h-screen flex items-center px-5 sm:px-8 md:px-12 lg:px-20">
          
          <div className="w-full max-w-xl">

            <h2
              className="
                text-white
                font-bold
                text-3xl
                sm:text-4xl
                md:text-5xl
                lg:text-6xl
                leading-tight
              "
            >
              Book Your Movie Tickets Now!
            </h2>

            <p
              className="
                mt-4
                text-gray-300
                text-sm
                sm:text-base
                md:text-lg
                leading-relaxed
                max-w-lg
              "
            >
              Enjoy the latest movies on the big screen. Explore our selection
              of films, check showtimes, choose your favorite seats, and book
              your tickets easily.
            </p>

            <Button
              className="
                bg-[oklch(63.7%_0.237_25.331)]
                rounded-xl
                px-5
                py-2
                mt-5
                text-xs
                text-white
                cursor-pointer
                hover:opacity-75
                transition-opacity
                duration-300
                capitalize
                font-semibold
              "
            >
              <Link to={"/movies"}>Explore Movies</Link>
            </Button>

          </div>

       
        </div>
      </div>

      {/* Shows Section */}
      <div className="bg-[#090A10] w-full">
        <Shows />
      </div>
    </>
  );
}
