import { Logo } from "@/components/layout/Logo";
import { Link } from "react-router";

export function Footer() {
  const links = [
    { id: 1, name: "Home", link: "/home" },
    { id: 2, name: "About Us", link: "/about" },
    { id: 3, name: "Contact Us", link: "/contact" },
    { id: 4, name: "Privacy Policy", link: "/privacy" },
  ];

  return (
    <footer className="bg-[#090A10]">

      {/* Main Footer */}
      <div className="flex justify-between max-md:flex-col items-center border-b border-gray-500 p-6">

        {/* Logo + Description */}
        <div className="max-md:flex max-md:flex-col max-md:items-center">

          <Logo />

          <p className="mt-6 text-xs text-white max-w-sm max-md:text-[10px] max-md:text-center">
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>

          {/* App Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <img
              src="/googlePlay.svg"
              alt="Google Play"
              className="w-auto h-9"
            />

            <img
              src="/appStore.svg"
              alt="App Store"
              className="w-auto h-9"
            />
          </div>

        </div>

        {/* Company */}
        <div className="flex flex-col items-center p-5 text-center">

          <h3 className="capitalize text-white mb-2 -mx-3 text-xs">
            Company
          </h3>

          <ul className="max-md:flex max-md:flex-col max-md:items-center">
            {links.map((item) => (
              <li
                key={item.id}
                className="text-white text-xs mt-2"
              >
                <Link
                  to={item.link}
                  className="hover:text-gray-400 transition-colors duration-300"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

        </div>

        {/* Get In Touch */}
        <div className="p-3 mt-6 max-md:flex max-md:flex-col max-md:items-center">

          <h3 className="text-white capitalize text-xs mb-3">
            Get In Touch
          </h3>

          <p className="text-white text-xs mb-3">
            +1-234-567-890
          </p>

          <p className="text-white text-xs mb-3">
            contact@example.com
          </p>

        </div>

      </div>

      {/* Copyright */}
      <div>
        <p className="pt-4 text-center text-xs pb-5 text-gray-500">
          Copyright 2026 © GreatStack. All Right Reserved.
        </p>
      </div>

    </footer>
  );
}