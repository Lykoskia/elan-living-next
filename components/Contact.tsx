"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import classNames from "classnames"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Spinner } from "./Spinner"
import { RichText } from "@/lib/richtext"
import { StrapiRichText } from "@/lib/types/strapi"

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

interface ContactProps {
  title1?: string
  richtext1?: StrapiRichText
  icon1Image?: {
    url: string
    alternativeText?: string
  }
  icon1Label?: string
  icon1Link?: string
  icon1Target?: "_self" | "_blank"
  icon2Image?: {
    url: string
    alternativeText?: string
  }
  icon2Label?: string
  icon2Link?: string
  icon2Target?: "_self" | "_blank"
  title2?: string
  richtext2?: StrapiRichText
  icon3Image?: {
    url: string
    alternativeText?: string
  }
  icon3Label?: string
  icon3Link?: string
  icon3Target?: "_self" | "_blank"
  icon4Image?: {
    url: string
    alternativeText?: string
  }
  icon4Label?: string
  icon4Link?: string
  icon4Target?: "_self" | "_blank"
  title3?: string
  richtext3?: StrapiRichText
  formTitle: string
  fieldFirstName: string
  fieldLastName: string
  fieldEmail: string
  fieldPhone: string
  fieldComment: string
  submitButtonText: string
  submitButtonLoadingText: string
  successMessage: string
}

export default function Contact(props: ContactProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formFields, setFormFields] = useState<FormFields>({
    firstName: { value: "", touched: false, isValid: null },
    lastName: { value: "", touched: false, isValid: null },
    email: { value: "", touched: false, isValid: null },
    phone: { value: "", touched: false, isValid: null },
    comment: { value: "", touched: false, isValid: null },
  })

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePhoneNumber = (phone: string) => {
    const phonePattern = /^(\+\d{7,15}|00\d{7,15}|[0-9]\d{6,14})$/;
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
      const response = await fetch("/api/submitMessageForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const fieldLabels = {
          firstName: props.fieldFirstName,
          lastName: props.fieldLastName,
          email: props.fieldEmail,
          phone: props.fieldPhone,
          comment: props.fieldComment,
        }

        toast.success(
          <div>
            <div>
              <strong>{props.successMessage}</strong>
              <br />
              <br />
            </div>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <strong>{fieldLabels[key as keyof typeof fieldLabels]}:</strong> {value}
              </div>
            ))}
          </div>
        )
        setFormFields({
          firstName: { value: "", touched: false, isValid: null },
          lastName: { value: "", touched: false, isValid: null },
          email: { value: "", touched: false, isValid: null },
          phone: { value: "", touched: false, isValid: null },
          comment: { value: "", touched: false, isValid: null },
        })
      } else {
        const error = await response.json()
        toast.error(error.message || "There was an issue sending your message. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred while sending your message.")
    }
    setIsLoading(false)
  }

  const renderIcon = (
    image?: { url: string; alternativeText?: string },
    label?: string,
    link?: string,
    target?: "_self" | "_blank"
  ) => {
    if (!image) return null

    // Add your Strapi base URL
    const imageUrl = image.url.startsWith('http')
      ? image.url
      : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${image.url}`

    const iconElement = (
      <Image
        src={imageUrl}
        alt={image.alternativeText || label || "Icon"}
        width={32}
        height={32}
      />
    )

    return (
      <div className="flex items-center gap-2 mb-4">
        {link ? (
          <a href={link} target={target || "_self"} rel="noopener noreferrer">
            {iconElement}
          </a>
        ) : (
          iconElement
        )}
        {label && <span>{label}</span>}
      </div>
    )
  }

  return (
    <section className="px-8 lg:px-12 mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mt-24">
        {/* Left Side */}
        <div className="space-y-8">
          {/* First section */}
          {(props.title1 || props.richtext1) && (
            <div>
              {props.title1 && (
                <h2 className="text-[30px] lg:text-[35px] my-4 font-bold">{props.title1}</h2>
              )}
              {props.richtext1 && (
                <div className="text-gray-800 pl-8 text-[14px] lg:text-[16px] text-left mb-6">
                  <RichText content={props.richtext1} />
                </div>
              )}
            </div>
          )}

          {/* First icon group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 items-start justify-start">
            {renderIcon(props.icon1Image, props.icon1Label, props.icon1Link, props.icon1Target)}
            {renderIcon(props.icon2Image, props.icon2Label, props.icon2Link, props.icon2Target)}
          </div>

          {/* Second section */}
          {(props.title2 || props.richtext2) && (
            <div>
              {props.title2 && (
                <h2 className="text-[30px] lg:text-[35px] my-4 font-bold">{props.title2}</h2>
              )}
              {props.richtext2 && (
                <div className="text-gray-800 pl-8 text-[14px] lg:text-[16px] text-left mb-6">
                  <RichText content={props.richtext2} />
                </div>
              )}
            </div>
          )}

          {/* Second icon group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 items-start justify-start">
            {renderIcon(props.icon3Image, props.icon3Label, props.icon3Link, props.icon3Target)}
            {renderIcon(props.icon4Image, props.icon4Label, props.icon4Link, props.icon4Target)}
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-8">
          {/* Third section */}
          {(props.title3 || props.richtext3) && (
            <div>
              {props.title3 && (
                <h2 className="text-[30px] lg:text-[35px] my-4 font-bold">{props.title3}</h2>
              )}
              {props.richtext3 && (
                <div className="text-gray-800 pl-8 text-[14px] lg:text-[16px] text-left">
                  <RichText content={props.richtext3} />
                </div>
              )}
            </div>
          )}

          {/* Contact Form */}
          <div className="bg-purple-50 rounded-3xl py-12 px-8">
            <h3 className="text-gray-700 text-xl lg:text-3xl mb-8 font-semibold text-center">
              {props.formTitle}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 text-xl font-bold mb-2">
                    {props.fieldFirstName} <span className="text-red-700">*</span>
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
                    {props.fieldLastName} <span className="text-red-700">*</span>
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
                    {props.fieldEmail} <span className="text-red-700">*</span>
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
                    {props.fieldPhone} <span className="text-red-700">*</span>
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
                    {props.fieldComment} <span className="text-red-700">*</span>
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
                    className={`${isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-700"
                      } text-white font-bold py-2 px-4 my-8 rounded-full focus:outline-none focus:shadow-outline uppercase`}
                  >
                    {isLoading ? props.submitButtonLoadingText : props.submitButtonText}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}