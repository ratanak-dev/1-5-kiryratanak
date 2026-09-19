"use client"
import * as React from "react"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

const genderOptions = ["Male","Female"];

const signUpSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    gender: z.enum(genderOptions, {
    errorMap: () => ({ message: "Please select a valid gender" })
  }),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Invalid date of birth",
      }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DatePickerInput({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : new Date("2025-06-01")
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    if (!value) {
      setDate(undefined)
      setMonth(undefined)
      return
    }

    const parsed = new Date(value)
    if (isValidDate(parsed)) {
      setDate(parsed)
      setMonth(parsed)
    }
  }, [value])

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor="date-required">Date of Birth</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={value}
          placeholder="June 01, 2025"
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            const nextValue = e.target.value
            const parsedDate = new Date(nextValue)
            onChange(nextValue)

            if (isValidDate(parsedDate)) {
              setDate(parsedDate)
              setMonth(parsedDate)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id="date-picker"
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(selectedDate) => {
                  if (!selectedDate) return

                  setDate(selectedDate)
                  onChange(formatDate(selectedDate))
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </Field>
  )
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    gender: "",
    dateOfBirth: formatDate(new Date("2025-06-01")),
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: "" }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = signUpSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const normalizedErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] ?? ""])
      )
      setErrors(normalizedErrors)
      return
    }

    setErrors({})
    console.log("Validated form:", result.data)
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange("name")}
                aria-invalid={Boolean(errors.name)}
                required
              />
              {errors.name ? <p className="text-sm text-red-500">{errors.name}</p> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange("email")}
                aria-invalid={Boolean(errors.email)}
                required
              />
              {errors.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Input
                id="gender"
                name="gender"
                type="text"
                placeholder="Male"
                value={formData.gender}
                onChange={handleChange("gender")}
                aria-invalid={Boolean(errors.gender)}
                required
              />
              {errors.gender ? <p className="text-sm text-red-500">{errors.gender}</p> : null}
            </Field>
            <DatePickerInput
              value={formData.dateOfBirth}
              onChange={(value) => {
                setFormData((previous) => ({ ...previous, dateOfBirth: value }))
                setErrors((previous) => ({ ...previous, dateOfBirth: "" }))
              }}
              error={errors.dateOfBirth}
            />
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                aria-invalid={Boolean(errors.password)}
                required
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {errors.password ? <p className="text-sm text-red-500">{errors.password}</p> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                aria-invalid={Boolean(errors.confirmPassword)}
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
              {errors.confirmPassword ? (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              ) : null}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
