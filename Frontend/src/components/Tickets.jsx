import { Clock9 } from "lucide-react";
import {SeatRow} from"./SeatRow"
import { useState } from "react";
import toast from "react-hot-toast";
export function Tickets() {
    const times = ["10AM", "11AM", "12PM"];

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    const seats = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [booking,setBooking]=useState({time:"",seats:[]});
    const blockedSeats=["A1","B2"]
    console.log(booking)
    function handleClick(){
        if(booking.time&&booking.seats.length!==0){
           
        }
        else{
            toast.error("plase select your time and seats")
        }
    }

    function handleTime(time){
    setBooking({...booking,time:time})
    }

    function handleSeat(row, seat) {
        const seatName = row + seat;

        setBooking({
            ...booking,
            seats: booking.seats.includes(seatName)
                ? booking.seats.filter((item) => item !== seatName)
                : [...booking.seats, seatName]
        });
    }
    
    return (
        <div
            className="
                min-h-screen
                overflow-x-hidden
                bg-[radial-gradient(circle_at_top,_#2a1015_0%,_#0b0b0b_40%,_#000000_100%)]
                px-3
                py-8
                sm:px-6
                lg:px-10
               
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    w-full
                    max-w-7xl
                    flex-col
                    gap-8
                    lg:flex-row
                    lg:items-start
                    lg:gap-12
                "
            >

                {/* ================= TIMINGS ================= */}
                <div className="w-full lg:w-auto">
                    <div
                        className="
                            mx-auto
                            mt-10
                            w-full
                            max-w-sm
                            rounded-lg
                            border
                            border-red-500/30
                            bg-[#1d0b10]
                            px-5
                            py-5
                            text-white
                            sm:px-7
                            lg:mx-0
                            lg:mt-20
                            lg:w-52
                        "
                    >
                        <h2 className="mb-3 text-sm font-bold">
                            Available Timings
                        </h2>

                        <div className="flex flex-wrap gap-2 lg:flex-col">
                            {times.map((time) => (
                                <button onClick={()=>handleTime(time)}
                                    key={time}
                                    className={
                                        `
                                        flex
                                        flex-1
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-md
                                        p-2
                                        text-sm
                                        font-bold
                                        cursor-pointer
                                       
                                        transition
                                        lg:justify-start
                                        ${time===booking.time?"bg-red-500":" hover:bg-red-500/10"}
                                         ${time===booking.time?"":" hover:opacity-75 "}
                                        
                                       
                                        
                                    `
                                    }
                                >
                                    <Clock9 size={17} />
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ================= SEATS ================= */}
                <div
                    className="
                        relative
                        mt-5
                        w-full
                        min-w-0
                        text-center
                        lg:mt-20
                    "
                >

                    {/* Glow */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -z-10
                            left-1/2
                            top-0
                            h-40
                            w-40
                            -translate-x-1/2
                            rounded-full
                            bg-red-500/20
                            blur-3xl
                            sm:h-52
                            sm:w-52
                        "
                    />

                    <h2 className="text-lg font-bold text-white sm:text-xl">
                        Select your seat
                    </h2>

                    {/* Screen */}
                    <img
                        src="/screenImage.svg"
                        alt="Cinema screen"
                        className="
                            mx-auto
                            mt-5
                            w-[75%]
                            max-w-md
                        "
                    />

                    <p className="mt-1 text-xs font-bold text-gray-500">
                        SCREEN SIDE
                    </p>

                    {/* ================= ALL SEATS ================= */}
                    <div className="mx-auto mt-8 w-full max-w-3xl overflow-x-scroll">

                        {/* A - B */}
                        <div className="flex flex-col items-center gap-2">
                            {rows.slice(0, 2).map((row) => (
                                <SeatRow
                                    key={row}
                                    row={row}
                                    seats={seats}
                                    handleSeat={handleSeat}
                                    booking={booking}
                                    blockedSeats={blockedSeats}
                                />
                            ))}
                        </div>

                        {/* C - F */}
                        <div
                            className="
                                mt-8
                                flex
                                justify-center
                                gap-3
                                sm:gap-6
                                md:gap-12
                            "
                        >
                            {/* C - D */}
                            <div className="flex flex-col gap-2">
                                {rows.slice(2, 4).map((row) => (
                                    <SeatRow
                                        key={row}
                                        row={row}
                                        seats={seats}
                                        handleSeat={handleSeat}
                                        booking={booking}
                                         blockedSeats={blockedSeats}
                                    />
                                ))}
                            </div>

                            {/* E - F */}
                            <div className="flex flex-col gap-2">
                                {rows.slice(4, 6).map((row) => (
                                    <SeatRow
                                        key={row}
                                        row={row}
                                        seats={seats}
                                        handleSeat={handleSeat}
                                        booking={booking}
                                         blockedSeats={blockedSeats}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* G - J */}
                        <div
                            className="
                                mt-8
                                flex
                                justify-center
                                gap-3
                                sm:gap-6
                                md:gap-12
                            "
                        >
                            {/* G - H */}
                            <div className="flex flex-col gap-2">
                                {rows.slice(6, 8).map((row) => (
                                    <SeatRow
                                        key={row}
                                        row={row}
                                        seats={seats}
                                        handleSeat={handleSeat}
                                        booking={booking}
                                         blockedSeats={blockedSeats}
                                    />
                                ))}
                            </div>

                            {/* I - J */}
                            <div className="flex flex-col gap-2">
                                {rows.slice(8, 10).map((row) => (
                                    <SeatRow
                                        key={row}
                                        row={row}
                                        seats={seats}
                                        handleSeat={handleSeat}
                                        booking={booking}
                                         blockedSeats={blockedSeats}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Checkout */}
                    
                    <button onClick={handleClick}
                        className="
                            mt-12
                            rounded-full
                            bg-red-500
                            px-7
                            py-3
                            text-sm
                            font-bold
                            text-white
                            cursor-pointer
                            hover:bg-red-600
                            transition
                            sm:px-10
                            sm:py-3
                        "
                    >

                        Proceed to Checkout →
                    </button>

                </div>
            </div>
        </div>
    );
}