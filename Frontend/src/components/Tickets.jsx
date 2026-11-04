
import { SeatRow } from "./SeatRow";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router";
import { useAuth } from "@clerk/react";

const API = "http://localhost:5000/api";
const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seats = [1, 2, 3, 4, 5, 6, 7, 8, 9];



export function Tickets() {
  const { dateId } = useParams();
  const { getToken } = useAuth();
  const[times,setTimes]=useState([]);
  const[booking,setBooking]=useState({time_id:"",time:"",seats:[]});
  const[bookedSeats,setBookedSeats]=useState([]);
  const[heldSeats,setHeldseats]=useState([]);
  const[expire,setExpire]=useState(null);
  const[timeLeft,setTimeLeft]=useState(0);
  const ticketPrice = booking.price ?? 0;
  const totalPrice = booking.seats.length * ticketPrice;


async function sendAuth() {
  const token = await getToken();
  return { headers: { Authorization: `Bearer ${token}` } };
}
  useEffect(()=>{
    async function getTimes() {
      try {
        const response = await axios.get(`${API}/showdays/${dateId}/showtimes`);
        setTimes(response.data);
        console.log(response.data)
      } catch (error) {
        console.log(error);
      }
    }
    getTimes();
  },[dateId])
const getSeats = useCallback(async (id) => {
  try {
    const response = await axios.get(`${API}/showtimes/${id}/seats`, await sendAuth());
    const { bookedSeats, heldByOthers, heldByMe, myExpiresAt } = response.data;
    setBookedSeats(bookedSeats);
    setHeldseats(heldByOthers);
    setExpire(myExpiresAt);
    setBooking((prev) =>
      prev.time_id === id ? { ...prev, seats: heldByMe } : prev
    );
  } catch (error) {
    console.log(error);
  }
}, [getToken]);

 useEffect(() => {
    if (!expire) {
      setTimeLeft(null)
      return
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.round((new Date(expire).getTime() - Date.now()) / 1000)
      )
      setTimeLeft(left)
     
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expire, booking.time_id, getSeats])


   useEffect(() => {
    if (!booking.time_id) return;
    getSeats(booking.time_id);
    const interval = setInterval(() => getSeats(booking.time_id), 5000);
    return () => clearInterval(interval);
  }, [booking.time_id, getSeats]);



  function getRow( row,
  seats,
  handleSeat,
  booking,
  bookedSeats,
  heldSeats){
    return <SeatRow row={row} seats={seats} handleSeat={handleSeat} booking={booking}  bookedSeats={bookedSeats} heldSeats={heldSeats}/>

  }

 
async function handleSeat(row, number) {
  const seat = `${row}${number}`;

  if (!booking.time_id) {
    toast.error("Please select a showtime first");
    return;
  }

  const isSelected = booking.seats.includes(seat);

  try {
    const config = await sendAuth();

    if (isSelected) {
      // الـ route: DELETE /api/holds/:showtimeId/:seat
      await axios.delete(`${API}/holds/${booking.time_id}/${seat}`, config);
    } else {
      // الـ route: POST /api/holds  و seats لازم array
      await axios.post(
        `${API}/holds`,
        { showtimeId: booking.time_id, seats: [seat] },
        config
      );
    }

    await getSeats(booking.time_id);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Could not update seat. Please try again."
    );
    await getSeats(booking.time_id);
  }
}

async function handlePayNow(billingData) {
  if (!booking.time_id || booking.seats.length === 0) {
    toast.error("plase choose seats and time first")
    return;
  }

  try {
    const config = await sendAuth();

    const response = await axios.post(
      `${API}/bookings/paymob/checkout`,
      {
        showtimeId: booking.time_id,
        seats: booking.seats,
        billingData,
      },
      config
    );

    const { clientSecret, publicKey } = response.data;

    const checkoutUrl = new URL(
      'https://accept.paymob.com/unifiedcheckout/'
    );

    checkoutUrl.searchParams.set('publicKey', publicKey);
    checkoutUrl.searchParams.set('clientSecret', clientSecret);

    window.location.assign(checkoutUrl.toString());
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "an error now please try again"
    );
  }
}

   const mm = String(Math.floor((timeLeft ?? 0) / 60)).padStart(2, "0")
  const ss = String((timeLeft ?? 0) % 60).padStart(2, "0");


 

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#2a1015_0%,_#0b0b0b_40%,_#000000_100%)] px-3 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* ================= TIMINGS ================= */}
        <div className="w-full lg:w-auto">
          <div className="mx-auto mt-10 w-full max-w-sm rounded-lg border border-red-500/30 bg-[#1d0b10] px-5 py-5 text-white sm:px-7 lg:mx-0 lg:mt-20 lg:w-52">
            <h2 className="mb-3 text-sm font-bold text-center">Available Timings</h2>

            <div className="flex flex-wrap gap-4 justify-center lg:flex-col">
               {times?.map((time)=>(
          <button key={time._id} className={`text-white font-bold cursor-pointer ${time.time===booking.time?"bg-red-500 rounded-md p-2":""} hover:opacity-25 duration-300 transition:opacity`} onClick={() => {
  setBooking({
    time: time.time,
    time_id: time._id,
    price:time.price,
    seats: []
  });

  setExpire(null);
  setBookedSeats([]);
  setHeldseats([]);
}}>
            {time.time}
            </button>

           ))}
              
            </div>
          </div>
        </div>

        {/* ================= SEATS ================= */}
        <div className="relative mt-5 w-full min-w-0 text-center lg:mt-20">
          {/* Glow */}
          <div className="pointer-events-none absolute -z-10 left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl sm:h-52 sm:w-52" />

          <h2 className="text-lg font-bold text-white sm:text-xl">
            Select your seat
          </h2>

          {/* Timer */}
           {timeLeft !== null && (
            <p className="mt-2 font-bold text-red-500">
              {mm}:{ss}
            </p>
          )}
        
          {/* Screen */}
          <img
            src="/screenImage.svg"
            alt="Cinema screen"
            className="mx-auto mt-5 w-[75%] max-w-md"
          />

          <p className="mt-1 text-xs font-bold text-gray-500">SCREEN SIDE</p>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-red-500/60" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-500" /> Yours
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-green-600" /> On hold
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-gray-700" /> Booked
            </span>
          </div>

          {/* ================= ALL SEATS ================= */}
          <div className="mx-auto mt-8 w-full max-w-3xl overflow-x-scroll">
            {/* A - B */}
            <div className="flex flex-col items-center gap-2">
              {getRow(rows.slice(0,1),seats,handleSeat,booking,bookedSeats,heldSeats)}
              {getRow(rows.slice(1,2),seats,handleSeat,booking,bookedSeats,heldSeats)}
              
            </div>

            {/* C - F */}
          
<div className="mt-8 flex justify-center gap-3 sm:gap-6 md:gap-12">
  <div className="flex flex-col gap-2">
    {getRow(rows.slice(2, 3), seats, handleSeat, booking, bookedSeats, heldSeats)}
    {getRow(rows.slice(3, 4), seats, handleSeat, booking, bookedSeats, heldSeats)}
  </div>

  <div className="flex flex-col gap-2">
    {getRow(rows.slice(4, 5), seats, handleSeat, booking, bookedSeats, heldSeats)}
    {getRow(rows.slice(5, 6), seats, handleSeat, booking, bookedSeats, heldSeats)}
  </div>
</div>

            {/* G - J */}
            <div className="mt-8 flex justify-center gap-3 sm:gap-6 md:gap-12">
              <div className="flex flex-col gap-2">{getRow(rows.slice(6,7),seats,handleSeat,booking,bookedSeats,heldSeats)}
                {getRow(rows.slice(7,8),seats,handleSeat,booking,bookedSeats,heldSeats)}
              </div>
              <div className="flex flex-col gap-2">
                {getRow(rows.slice(8,9),seats,handleSeat,booking,bookedSeats,heldSeats)}
                {getRow(rows.slice(9,10),seats,handleSeat,booking,bookedSeats,heldSeats)}
              </div>
            </div>
          </div>

{/* Booking Summary */}
<div className="mx-auto mt-8 w-full max-w-md rounded-xl border border-red-500/30 bg-[#1d0b10] p-5 text-white">
  <h3 className="text-lg font-bold">Booking Summary</h3>

  <div className="mt-4 flex justify-between">
    <span className="text-gray-400">Ticket Price</span>
    <span>{ticketPrice} EGP</span>
  </div>

  <div className="mt-3 flex justify-between">
    <span className="text-gray-400">Selected Seats</span>
    <span>
      {booking.seats.length > 0
        ? booking.seats.join(", ")
        : "No seats selected"}
    </span>
  </div>

  <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
    <span className="font-bold">Total</span>
    <span className="text-xl font-bold text-red-500">
      {totalPrice} EGP
    </span>
  </div>
</div>

          {/* Checkout */}
          <button onClick={handlePayNow}
           
            className="mt-12 rounded-full bg-red-500 px-7 py-3 text-sm font-bold text-white cursor-pointer hover:bg-red-600 transition sm:px-10 sm:py-3"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}