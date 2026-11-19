import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router";
import { Show, SignInButton, UserButton,useUser} from '@clerk/react'
import toast from "react-hot-toast";
export function Header() {
 

  const [menuOpen, setMenuOpen] = useState(false);
    const { isSignedIn } = useUser()


  const headerItems = [
    { id: 1, name: "Home", link: "/home" },
    { id: 2, name: "Movies", link: "/movies" },
  ];

  return (
    <div className="fixed top-0 left-0 z-[1000] w-full">

      {/* Top Header */}
      <div className="flex w-full items-center justify-between">

        {/* Logo */}
        <Logo />

        {/* Desktop Navbar */}
        <header className="hidden md:block bg-slate-800/60 border border-white/20 rounded-full p-1">
          <ul className="flex gap-4">
      {headerItems.map((item) => {
  return item.name === "MyTickets" && !isSignedIn ? (
    <li key={item.id}>
      <button
        onClick={() => toast.error("You should sign in first")}
        className="text-[11px] text-white font-semibold hover:opacity-75 transition-opacity duration-300 cursor-pointer"
      >
        MyTickets
      </button>
    </li>
  ) : (
    <li key={item.id}>
      <Link
        to={item.link}
        className="text-[11px] text-white font-semibold hover:opacity-75 transition-opacity duration-300"
      >
        {item.name}
      </Link>
    </li>
  );
})}
          </ul>
        </header>

        {/* Right Side */}
        <div className="flex items-center">
        <Show when="signed-out">
  <SignInButton mode="modal">
    <Button
      className="bg-[oklch(63.7%_0.237_25.331)] rounded-xl px-5 py-1 mr-4 text-[11px] text-white cursor-pointer hover:opacity-75 transition-opacity duration-300 capitalize font-semibold"
    >
      Login
    </Button>
  </SignInButton>
</Show>

<Show when="signed-in">
  <div className="p-3">
      <UserButton/>
  </div>
</Show>
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className=" hidden max-sm:flex   w-10 h-10 mr-1 bg-[#06172b] flex flex-col justify-center gap-[5px] px-2.5 cursor-pointer rounded-lg"
          >
            <span className="w-full h-[2px] bg-white rounded-full"></span>
            <span className="w-full h-[2px] bg-white rounded-full"></span>
            <span className="w-full h-[2px] bg-white rounded-full"></span>
          </button>

          {/* Login */}
         
        </div>
      </div>

      {/* Mobile Navbar */}
      {menuOpen && (
        <nav className="hidden max-sm:block mx-4 mt-2 bg-slate-900/95 border border-white/20 rounded-xl">
          <ul className="flex flex-col items-center gap-5 py-5">

         {headerItems.map((item) => (
  <li key={item.id}>
    {item.name === "MyTickets" && !isSignedIn ? (
      <button
        onClick={() => {
          toast.error("You should sign in first");
          setMenuOpen(false);
        }}
        className="text-white text-sm font-semibold hover:text-gray-400 transition-colors duration-300 cursor-pointer"
      >
        MyTickets
      </button>
    ) : (
      <Link
        to={item.link}
        onClick={() => setMenuOpen(false)}
        className="text-white text-sm font-semibold hover:text-gray-400 transition-colors duration-300"
      >
        {item.name}
      </Link>
    )}
  </li>
))}

          </ul>
        </nav>
      )}

    </div>
  );
}