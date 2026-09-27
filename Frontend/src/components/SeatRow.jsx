export function SeatRow({
  row,
  seats,
  handleSeat,
  booking,
  blockedSeats
}) {
  return (
    <div className="flex gap-1 sm:gap-2">
      {seats.map((number) => {
        const seatName = row + number;
        const isBlocked = blockedSeats.includes(seatName);

        return (
          <button
            key={number}
            disabled={!booking.time || isBlocked}
            onClick={() => handleSeat(row, number)}
            className={`
              flex aspect-square w-7 items-center justify-center
              rounded border border-red-500/60 text-[9px]
              sm:w-8 sm:text-xs

              ${
                !booking.time || isBlocked
                  ? "cursor-not-allowed bg-gray-700 text-gray-500"
                  : `cursor-pointer text-gray-300 ${ booking.seats.includes(seatName)
                  ? "bg-red-500 text-white"
                  : "hover:bg-red-500/20"}`
              }

            
            `}
          >
            {seatName}
          </button>
        );
      })}
    </div>
  );
}