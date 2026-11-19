import { API } from "@/config/api"
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
import { useAuthConfig } from "@/lib/useAuthConfig"

export function AddDay({ id }) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const authConfig = useAuthConfig()

  async function onSubmit(data) {
    const url = `${API}/movies/${id}/showdays`
    try {
      await axios.post(url, { date: data.date }, await authConfig())
      toast.success("date is added sucessfully")
      reset()
      setOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "failed to added date")
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
            className="text-white hover:opacity-25 duration-300 transition-opacity capitalize bg-[#1d0b10] p-4 rounded-xl border-none cursor-pointer"
          >
            add date
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm bg-[#1d0b10]">
        <DialogHeader>
          <DialogTitle className="text-white capitalize">
            add your date
          </DialogTitle>

          <DialogDescription className="text-white capitalize">
            add your date now
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <FieldGroup className="text-white capitalize">
            <Field>
              <Label htmlFor="date">date</Label>

              <Input
                id="date"
                {...register("date", { required: true })}
                type="date"
              />
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
              className="text-white border-none cursor-pointer"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}