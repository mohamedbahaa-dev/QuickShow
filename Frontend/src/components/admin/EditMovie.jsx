import { API } from "@/config/api"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import toast from "react-hot-toast"

import { shows } from "@/contexts/movies"
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
import { Pencil } from "lucide-react"
import { useAuthConfig } from "@/lib/useAuthConfig"

export function EditMovie({
  title,
  posterUrl,
  description,
  duration,
  genre,
  language,
  id,
}) {
  const { setMovies } = useContext(shows)
  const authConfig = useAuthConfig()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title,
      description,
      duration,
      genre,
      language,
    },
  })

  const logoFile = watch("posterUrl")

  const preview = logoFile?.[0]
    ? URL.createObjectURL(logoFile[0])
    : posterUrl

  async function onSubmit(data) {
    try {
      const formData = new FormData()

      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("duration", data.duration)
      formData.append("genre", data.genre)
      formData.append("language", data.language)

      // فقط لو اختار صورة جديدة
      if (data.posterUrl?.[0]) {
        formData.append("posterUrl", data.posterUrl[0])
      }

 const response = await axios.put(
  `${API}/movies/${id}`,
  formData,
  await authConfig()
)

      // استبدال الفيلم القديم بالفيلم المعدل
      setMovies((prev) =>
        prev.map((movie) =>
          movie._id === id ? response.data : movie
        )
      )

      toast.success("Film edited successfully")

      reset()
      setOpen(false)
    } catch (error) {
      toast.error("Failed to edit film")
      console.log(error)
    }
  }

  function handleOpenChange(value) {
    setOpen(value)

    if (value) {
      // عند فتح Edit نضع البيانات القديمة في الفورم
      reset({
        title,
        description,
        duration,
        genre,
        language,
      })
    }

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
            className="text-white border-none cursor-pointer"
          >
            <Pencil />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm bg-[#1d0b10]">
        <DialogHeader>
          <DialogTitle className="text-white capitalize">
            edit movie
          </DialogTitle>

          <DialogDescription className="text-white capitalize">
            edit your movie now
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <FieldGroup className="text-white capitalize">

            <Field>
              <Label htmlFor="title">title</Label>

              <Input
                id="title"
                {...register("title")}
              />
            </Field>

            <Field>
              <Label htmlFor="description">description</Label>

              <Input
                id="description"
                {...register("description")}
              />
            </Field>

            <Field>
              <Label htmlFor="poster">poster</Label>

              <Input
                id="poster"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                {...register("posterUrl")}
              />

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-32 object-cover rounded mt-2"
                />
              )}
            </Field>

            <Field>
              <Label htmlFor="duration">duration</Label>

              <Input
                id="duration"
                {...register("duration")}
              />
            </Field>

            <Field>
              <Label htmlFor="genre">genre</Label>

              <Input
                id="genre"
                {...register("genre")}
              />
            </Field>

            <Field>
              <Label htmlFor="language">language</Label>

              <Input
                id="language"
                {...register("language")}
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