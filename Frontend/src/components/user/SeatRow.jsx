export function SeatRow({
  row,
  seats,
  handleSeat,
  booking,
  bookedSeats,
  heldSeats,
}) {
  return (
    <div className="flex gap-1 sm:gap-2">
      {seats.map((number) => {
        const seatName = row + number;
        const isBooked = bookedSeats?.includes(seatName); // محجوز نهائياً
        const isHeld = heldSeats?.includes(seatName); // محجوز مؤقتاً من حد تاني
        const isMine = booking?.seats.includes(seatName); // اخترته أنا

        let style = "cursor-pointer text-gray-300 hover:bg-red-500/20";
        if (!booking.time_id || isBooked) {
          style = "cursor-not-allowed bg-gray-700 text-gray-500";
        } else if (isHeld) {
          style = "cursor-not-allowed bg-green-600 text-white";
        } else if (isMine) {
          style = "cursor-pointer bg-red-500 text-white";
        }

        return (
          <button
            key={number}
            // المحجوز مؤقتاً مش disabled عشان نقدر نعرض رسالة "on hold" عند الضغط
            disabled={!booking.time_id || isBooked}
            onClick={() => handleSeat(row, number)}
            title={isHeld ? "On hold" : isBooked ? "Booked" : seatName}
            className={`flex aspect-square w-7 items-center justify-center rounded border border-red-500/60 text-[9px] sm:w-8 sm:text-xs ${style}`}
          >
            {seatName}
          </button>
        );
      })}
    </div>
  );
}