"use client"

import type React from "react"

import { useState } from "react"
import classNames from "classnames"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Spinner } from "./Spinner"
import { submitMessageForm } from "@/app/actions/formActions"

interface FormField {
  value: string
  touched: boolean
  isValid: boolean | null
}

interface FormFields {
  firstName: FormField
  lastName: FormField
  email: FormField
  phone: FormField
  comment: FormField
}

interface MessageFormProps {
  description: string
  firstName: string
  lastName: string
  email: string
  phone: string
  comment: string
  submit: string
  submitting: string
}

export default function MessageForm(props: MessageFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formFields, setFormFields] = useState<FormFields>({
    firstName: { value: "", touched: false, isValid: null },
    lastName: { value: "", touched: false, isValid: null },
    email: { value: "", touched: false, isValid: null },
    phone: { value: "", touched: false, isValid: null },
    comment: { value: "", touched: false, isValid: null },
  })

  const fieldLabels = {
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    phone: props.phone,
    comment: props.comment || "Message",
  }

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePhoneNumber = (phone: string) => {
    const phonePattern = /^\+?[1-9]\d{6,14}$/
    return phonePattern.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let isValid = value.trim() !== ""

    if (name === "email") {
      isValid = validateEmail(value)
    } else if (name === "phone") {
      isValid = validatePhoneNumber(value)
    }

    setFormFields({
      ...formFields,
      [name]: { ...formFields[name as keyof FormFields], value, isValid },
    })
  }

  const handleInputBlur = (name: keyof FormFields) => {
    const value = formFields[name].value
    let isValid = value.trim() !== ""

    if (name === "email") {
      isValid = validateEmail(value)
    } else if (name === "phone") {
      isValid = validatePhoneNumber(value)
    }

    setFormFields({
      ...formFields,
      [name]: { ...formFields[name], touched: true, isValid },
    })
  }

  const inputClassNames = (fieldName: keyof FormFields) =>
    classNames("w-full px-3 py-2 border-2 rounded-md bg-white", {
      "border-darkgray": formFields[fieldName].isValid === null && !formFields[fieldName].touched,
      "border-darkgreen": formFields[fieldName].isValid === true,
      "border-darkred": formFields[fieldName].isValid === false,
      "focus:border-navy": !formFields[fieldName].value && formFields[fieldName].touched,
      "hover:bg-darkgray": true,
      "focus:bg-darkgray": true,
      "focus:shadow-blue": true,
      "hover:shadow-blue": true,
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const isFormValid = Object.values(formFields).every((field) => field.isValid)

    if (!isFormValid) {
      setIsLoading(false)
      toast.error("Please correct the invalid fields.")
      return
    }

    const formData = {
      firstName: formFields.firstName.value,
      lastName: formFields.lastName.value,
      email: formFields.email.value,
      phone: formFields.phone.value,
      comment: formFields.comment.value,
    }

    try {
      const result = await submitMessageForm(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          <div>
            <div>
              <strong>Uspješno ispunjena forma! Odgovorit ćemo Vam u najkraćem mogućem roku!</strong>
              <br />
              <br />
            </div>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <strong>{fieldLabels[key as keyof typeof fieldLabels] || key}:</strong> {value}
              </div>
            ))}
          </div>,
        )
        setFormFields({
          firstName: { value: "", touched: false, isValid: null },
          lastName: { value: "", touched: false, isValid: null },
          email: { value: "", touched: false, isValid: null },
          phone: { value: "", touched: false, isValid: null },
          comment: { value: "", touched: false, isValid: null },
        })
      }
    } catch (error) {
      toast.error("An error occurred while sending your message.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center bg-purple-50 rounded-3xl py-12 my-12 mx-4 md:mx-8 lg:mx-12">
      <ToastContainer
        position="bottom-right"
        autoClose={30000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="light"
      />
      {isLoading && <Spinner />}
      <h1 className="text-gray-700 text-xl lg:text-3xl px-10 lg:px-24 my-4 font-semibold">{props.description}</h1>
      <form className="w-full max-w-4xl px-4 sm:px-6 lg:px-12 py-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.firstName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={inputClassNames("firstName")}
              value={formFields.firstName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("firstName")}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.lastName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={inputClassNames("lastName")}
              value={formFields.lastName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("lastName")}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-xl font-bold mb-2">
              {props.email} <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={inputClassNames("email")}
              value={formFields.email.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("email")}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 text-xl font-bold mb-2">
              {props.phone} <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={inputClassNames("phone")}
              value={formFields.phone.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("phone")}
              required
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="comment" className="block text-gray-700 text-xl font-bold mb-2">
              {props.comment} <span className="text-red-700">*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              className={`${inputClassNames("comment")} min-h-[120px] resize-y`}
              value={formFields.comment.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("comment")}
              required
            />
          </div>
          <div className="flex justify-center col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-4 my-8 rounded-full focus:outline-none focus:shadow-outline uppercase`}
            >
              {isLoading ? props.submitting : props.submit}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}