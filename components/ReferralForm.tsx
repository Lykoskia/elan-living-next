"use client"

import type React from "react"

import { useState } from "react"
import classNames from "classnames"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Spinner } from "@/components/Spinner"
import { submitReferralForm } from "@/app/actions/formActions"

interface FormField {
  value: string
  touched: boolean
  isValid: boolean | null
}

interface FormFields {
  referralFirstName: FormField
  referralLastName: FormField
  referralEmail: FormField
  referralPhone: FormField
  referrerFirstName: FormField
  referrerLastName: FormField
  referrerEmail: FormField
  referrerPhone: FormField
  comment: FormField
}

interface ReferralFormProps {
  description: string
  referralSection?: string
  referralFirstName: string
  referralLastName: string
  referralEmail: string
  referralPhone: string
  referrerSection?: string
  referrerFirstName: string
  referrerLastName: string
  referrerEmail: string
  referrerPhone: string
  comment: string
  submit: string
  submitting: string
}

export default function ReferralForm(props: ReferralFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formFields, setFormFields] = useState<FormFields>({
    // Referee details
    referralFirstName: { value: "", touched: false, isValid: null },
    referralLastName: { value: "", touched: false, isValid: null },
    referralEmail: { value: "", touched: false, isValid: null },
    referralPhone: { value: "", touched: false, isValid: null },
    // Referrer details
    referrerFirstName: { value: "", touched: false, isValid: null },
    referrerLastName: { value: "", touched: false, isValid: null },
    referrerEmail: { value: "", touched: false, isValid: null },
    referrerPhone: { value: "", touched: false, isValid: null },
    // Comment
    comment: { value: "", touched: false, isValid: null },
  })

  const fieldLabels = {
    referralFirstName: props.referralFirstName,
    referralLastName: props.referralLastName,
    referralEmail: props.referralEmail,
    referralPhone: props.referralPhone,
    referrerFirstName: props.referrerFirstName,
    referrerLastName: props.referrerLastName,
    referrerEmail: props.referrerEmail,
    referrerPhone: props.referrerPhone,
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

    // Make comment field always valid (optional)
    if (name === "comment") {
      isValid = true
    } else if (name.includes("Email")) {
      isValid = validateEmail(value)
    } else if (name.includes("Phone")) {
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

    // Make comment field always valid (optional)
    if (name === "comment") {
      isValid = true
    } else if (name.includes("Email")) {
      isValid = validateEmail(value)
    } else if (name.includes("Phone")) {
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

    // Check all fields except comment
    const fieldsToValidate = Object.entries(formFields).filter(([key]) => key !== "comment")
    const isFormValid = fieldsToValidate.every(([_, field]) => field.isValid)

    if (!isFormValid) {
      setIsLoading(false)
      toast.error("Please correct the invalid fields.")
      return
    }

    const formData = {
      referralFirstName: formFields.referralFirstName.value,
      referralLastName: formFields.referralLastName.value,
      referralEmail: formFields.referralEmail.value,
      referralPhone: formFields.referralPhone.value,
      referrerFirstName: formFields.referrerFirstName.value,
      referrerLastName: formFields.referrerLastName.value,
      referrerEmail: formFields.referrerEmail.value,
      referrerPhone: formFields.referrerPhone.value,
      comment: formFields.comment.value,
    }

    try {
      const result = await submitReferralForm(formData)

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
          referralFirstName: { value: "", touched: false, isValid: null },
          referralLastName: { value: "", touched: false, isValid: null },
          referralEmail: { value: "", touched: false, isValid: null },
          referralPhone: { value: "", touched: false, isValid: null },
          referrerFirstName: { value: "", touched: false, isValid: null },
          referrerLastName: { value: "", touched: false, isValid: null },
          referrerEmail: { value: "", touched: false, isValid: null },
          referrerPhone: { value: "", touched: false, isValid: null },
          comment: { value: "", touched: false, isValid: null },
        })
      }
    } catch (error) {
      toast.error("An error occurred while submitting the referral.")
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
          {/* Referee Section */}
          <div className="col-span-2 mb-4">
            <h2 className="text-gray-700 text-xl font-bold mb-4">
              {props.referralSection || "Applicant Information"}
            </h2>
          </div>
          <div>
            <label htmlFor="referralFirstName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referralFirstName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="referralFirstName"
              name="referralFirstName"
              className={inputClassNames("referralFirstName")}
              value={formFields.referralFirstName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referralFirstName")}
              required
            />
          </div>
          <div>
            <label htmlFor="referralLastName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referralLastName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="referralLastName"
              name="referralLastName"
              className={inputClassNames("referralLastName")}
              value={formFields.referralLastName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referralLastName")}
              required
            />
          </div>
          <div>
            <label htmlFor="referralEmail" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referralEmail} <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              id="referralEmail"
              name="referralEmail"
              className={inputClassNames("referralEmail")}
              value={formFields.referralEmail.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referralEmail")}
              required
            />
          </div>
          <div>
            <label htmlFor="referralPhone" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referralPhone} <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              id="referralPhone"
              name="referralPhone"
              className={inputClassNames("referralPhone")}
              value={formFields.referralPhone.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referralPhone")}
              required
            />
          </div>

          {/* Referrer Section */}
          <div className="col-span-2 mt-8 mb-4">
            <h2 className="text-gray-700 text-xl font-bold mb-4">
              {props.referrerSection || "Referrer Information"}
            </h2>
          </div>
          <div>
            <label htmlFor="referrerFirstName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referrerFirstName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="referrerFirstName"
              name="referrerFirstName"
              className={inputClassNames("referrerFirstName")}
              value={formFields.referrerFirstName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referrerFirstName")}
              required
            />
          </div>
          <div>
            <label htmlFor="referrerLastName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referrerLastName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="referrerLastName"
              name="referrerLastName"
              className={inputClassNames("referrerLastName")}
              value={formFields.referrerLastName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referrerLastName")}
              required
            />
          </div>
          <div>
            <label htmlFor="referrerEmail" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referrerEmail} <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              id="referrerEmail"
              name="referrerEmail"
              className={inputClassNames("referrerEmail")}
              value={formFields.referrerEmail.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referrerEmail")}
              required
            />
          </div>
          <div>
            <label htmlFor="referrerPhone" className="block text-gray-700 text-xl font-bold mb-2">
              {props.referrerPhone} <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              id="referrerPhone"
              name="referrerPhone"
              className={inputClassNames("referrerPhone")}
              value={formFields.referrerPhone.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("referrerPhone")}
              required
            />
          </div>

          {/* Comment Section - OPTIONAL */}
          <div className="col-span-2">
            <label htmlFor="comment" className="block text-gray-700 text-xl font-bold mb-2">
              {props.comment}
            </label>
            <textarea
              id="comment"
              name="comment"
              className={`${inputClassNames("comment")} min-h-[120px] resize-y`}
              value={formFields.comment.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("comment")}
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