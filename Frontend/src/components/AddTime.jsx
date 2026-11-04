
import { useState } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddTime({ id }) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      time: "",
      period: "",
      hall: "",
      totalseats: "",
      price: "",
    },
  })


async function onSubmit(data) {
  const url = `http://localhost:5000/api/showdays/${id}/showtimes`

  try {
    const [hours, minutes] = data.time.split(":").map(Number)

    let convertedHours = hours

    if (data.period === "PM" && hours !== 12) {
      convertedHours += 12
    }

    if (data.period === "AM" && hours === 12) {
      convertedHours = 0
    }

    const formattedTime =
      `${String(convertedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`

    const payload = {
      time: formattedTime,
      hall: data.hall.trim(),
      totalSeats: Number(data.totalseats),
      price: Number(data.price),
    }

    const response = await axios.post(url, {
      showtimes: [payload],
    })

    console.log(response.data)

    toast.success("Showtime added successfully")
    reset()
    setOpen(false)
  } catch (error) {
    console.error(
      "Add Showtime Error:",
      error.response?.data || error.message
    )

    toast.error(
      error.response?.data?.message ||
        "Failed to add showtime"
    )
  }
}

  function handleOpenChange(value) {
    setOpen(value)

    if (!value) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="text-white hover:opacity-75 duration-300 transition-opacity capitalize bg-black p-4 rounded-xl border-none cursor-pointer"
          >
            add showtime
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm bg-[#1d0b10]">
        <DialogHeader>
          <DialogTitle className="text-white capitalize">
            add showtime
          </DialogTitle>

          <DialogDescription className="text-white capitalize">
            add a new showtime
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <FieldGroup className="text-white capitalize">
            {/* Time */}
            <Field>
              <Label htmlFor="time">time</Label>

              <Input
                id="time"
                type="text"
                placeholder="e.g. 06:30"
                className="text-white"
                {...register("time", {
                  required: "Time is required",
                  pattern: {
                    value: /^(0?[1-9]|1[0-2]):[0-5]\d$/,
                    message: "Enter time in 12-hour format, e.g. 06:30",
                  },
                })}
              />

              {errors.time && (
                <p className="text-sm text-red-400">
                  {errors.time.message}
                </p>
              )}
            </Field>

            {/* AM / PM */}
            <Field>
              <Label htmlFor="period">AM or PM</Label>

              <select
                id="period"
                {...register("period", {
                  required: "Please choose AM or PM",
                })}
                className="bg-[#1d0b10] text-white border border-white/20 rounded-md p-2"
              >
                <option value="">Choose</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>

              {errors.period && (
                <p className="text-sm text-red-400">
                  {errors.period.message}
                </p>
              )}
            </Field>

            {/* Hall */}
            <Field>
              <Label htmlFor="hall">hall</Label>

              <Input
                id="hall"
                type="text"
                placeholder="e.g. Hall 1"
                className="text-white"
                {...register("hall", {
                  required: "Hall is required",
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Hall cannot be empty",
                })}
              />

              {errors.hall && (
                <p className="text-sm text-red-400">
                  {errors.hall.message}
                </p>
              )}
            </Field>

            {/* Total Seats */}
            <Field>
              <Label htmlFor="totalseats">total seats</Label>

              <Input
                id="totalseats"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 90"
                className="text-white"
                {...register("totalseats", {
                  required: "Total seats is required",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "There must be at least one seat",
                  },
                  validate: (value) =>
                    Number.isInteger(value) ||
                    "Total seats must be a whole number",
                })}
              />

              {errors.totalseats && (
                <p className="text-sm text-red-400">
                  {errors.totalseats.message}
                </p>
              )}
            </Field>

            {/* Ticket Price */}
            <Field>
              <Label htmlFor="price">ticket price (EGP)</Label>

              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 150"
                className="text-white"
                {...register("price", {
                  required: "Ticket price is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "Price must be greater than zero",
                  },
                  validate: (value) =>
                    Number.isFinite(value) ||
                    "Enter a valid ticket price",
                })}
              />

              {errors.price && (
                <p className="text-sm text-red-400">
                  {errors.price.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="text-white border-none cursor-pointer"
                >
                  Cancel
                </Button>
              }
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white border-none cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
