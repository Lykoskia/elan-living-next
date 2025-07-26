"use client"

import type React from "react"

import { useState } from "react"
import classNames from "classnames"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Spinner } from "@/components/Spinner"
import { RichText } from "@/lib/richtext"
import type { StrapiRichText } from "@/lib/types/strapi"
import { submitRequestForm } from "@/app/actions/formActions"

interface FormField {
  value: string
  touched: boolean
  isValid: boolean | null
}

interface FormFields {
  contractorFirstName: FormField
  contractorLastName: FormField
  contractorEmail: FormField
  contractorPhone: FormField
}

interface RequestFormProps {
  title?: string
  text: StrapiRichText
  description: string
  contractorFirstName: string
  contractorLastName: string
  contractorEmail: string
  contractorPhone: string
  submit: string
  submitting: string
}

export default function RequestForm(props: RequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formFields, setFormFields] = useState<FormFields>({
    contractorFirstName: { value: "", touched: false, isValid: null },
    contractorLastName: { value: "", touched: false, isValid: null },
    contractorEmail: { value: "", touched: false, isValid: null },
    contractorPhone: { value: "", touched: false, isValid: null },
  })

  const fieldLabels = {
    contractorFirstName: props.contractorFirstName,
    contractorLastName: props.contractorLastName,
    contractorEmail: props.contractorEmail,
    contractorPhone: props.contractorPhone,
  }

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePhoneNumber = (phone: string) => {
    const phonePattern = /^\+?[1-9]\d{6,14}$/
    return phonePattern.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let isValid = value.trim() !== ""

    if (name === "contractorEmail") {
      isValid = validateEmail(value)
    } else if (name === "contractorPhone") {
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

    if (name === "contractorEmail") {
      isValid = validateEmail(value)
    } else if (name === "contractorPhone") {
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
      contractorFirstName: formFields.contractorFirstName.value,
      contractorLastName: formFields.contractorLastName.value,
      contractorEmail: formFields.contractorEmail.value,
      contractorPhone: formFields.contractorPhone.value,
    }

    try {
      const result = await submitRequestForm(formData)

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
          contractorFirstName: { value: "", touched: false, isValid: null },
          contractorLastName: { value: "", touched: false, isValid: null },
          contractorEmail: { value: "", touched: false, isValid: null },
          contractorPhone: { value: "", touched: false, isValid: null },
        })
      }
    } catch (error) {
      toast.error("An error occurred while submitting the form.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center bg-purple-50 rounded-3xl my-12 mx-4 md:mx-8 lg:mx-12">
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
      
      {/* Rich Text Section - Centered above the form */}
      <section className="px-8 lg:px-12 py-6 mx-auto mb-12">
        {props.title && <h2 className="text-[30px] lg:text-[35px] my-4 text-center">{props.title}</h2>}
        <div className="text-gray-800 text-[14px] lg:text-[16px] text-center leading-relaxed lg:mx-8">
          <RichText content={props.text} />
        </div>
      </section>

      <h1 className="text-gray-700 text-xl lg:text-3xl px-10 lg:px-24 my-4 font-semibold">{props.description}</h1>
      
      <form className="w-full max-w-4xl px-4 sm:px-6 lg:px-12 py-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 grid-cols-2">
          <div>
            <label htmlFor="contractorFirstName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.contractorFirstName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="contractorFirstName"
              name="contractorFirstName"
              className={inputClassNames("contractorFirstName")}
              value={formFields.contractorFirstName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("contractorFirstName")}
              required
            />
          </div>
          <div>
            <label htmlFor="contractorLastName" className="block text-gray-700 text-xl font-bold mb-2">
              {props.contractorLastName} <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="contractorLastName"
              name="contractorLastName"
              className={inputClassNames("contractorLastName")}
              value={formFields.contractorLastName.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("contractorLastName")}
              required
            />
          </div>
          <div>
            <label htmlFor="contractorEmail" className="block text-gray-700 text-xl font-bold mb-2">
              {props.contractorEmail} <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              id="contractorEmail"
              name="contractorEmail"
              className={inputClassNames("contractorEmail")}
              value={formFields.contractorEmail.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("contractorEmail")}
              required
            />
          </div>
          <div>
            <label htmlFor="contractorPhone" className="block text-gray-700 text-xl font-bold mb-2">
              {props.contractorPhone} <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              id="contractorPhone"
              name="contractorPhone"
              className={inputClassNames("contractorPhone")}
              value={formFields.contractorPhone.value}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("contractorPhone")}
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