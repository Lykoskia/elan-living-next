"use server"

import { Resend } from "resend"
import { formatFormData } from "@/utils/emailTemplates"
import { validateEmail, validatePhoneNumber, sanitizeInput } from "@/utils/validation"

const resend = new Resend(process.env.RESEND_API_KEY || "")

interface JobFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  comment: string
}

interface MessageFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  comment: string
}

interface ReferralFormData {
  referralFirstName: string
  referralLastName: string
  referralEmail: string
  referralPhone: string
  referrerFirstName: string
  referrerLastName: string
  referrerEmail: string
  referrerPhone: string
  comment: string
}

interface RequestFormData {
  contractorFirstName: string
  contractorLastName: string
  contractorEmail: string
  contractorPhone: string
}

export async function submitJobForm(formData: JobFormData) {

  try {
    const { firstName, lastName, email, phone, comment } = formData

    if (!firstName || !lastName || !email || !phone || !comment) {
      return { error: "All fields are required" }
    }

    if (!validateEmail(email)) {
      return { error: "Invalid email format" }
    }

    if (!validatePhoneNumber(phone)) {
      return { error: "Invalid phone number format" }
    }

    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      comment: sanitizeInput(comment),
    }

    await resend.emails.send({
      from: "posao@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova prijava za posao",
      html: formatFormData(sanitizedData, "job"),
    })

    console.log("Sanitized form data:", sanitizedData)
    return { message: "Job application submitted successfully" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to submit job application" }
  }
}

export async function submitMessageForm(formData: MessageFormData) {

  try {
    const { firstName, lastName, email, phone, comment } = formData

    if (!firstName || !lastName || !email || !phone || !comment) {
      return { error: "All fields are required" }
    }

    if (!validateEmail(email)) {
      return { error: "Invalid email format" }
    }

    if (!validatePhoneNumber(phone)) {
      return { error: "Invalid phone number format" }
    }

    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      comment: sanitizeInput(comment),
    }

    await resend.emails.send({
      from: "kontakt@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova kontakt poruka",
      html: formatFormData(sanitizedData, "message"),
    })

    console.log("Sanitized form data:", sanitizedData)
    return { message: "Message sent successfully" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to send message" }
  }
}

export async function submitReferralForm(formData: ReferralFormData) {

  try {
    const {
      referralFirstName,
      referralLastName,
      referralEmail,
      referralPhone,
      referrerFirstName,
      referrerLastName,
      referrerEmail,
      referrerPhone,
      comment,
    } = formData

    // Comment is now optional - removed from required fields
    const requiredFields = [
      referralFirstName,
      referralLastName,
      referralEmail,
      referralPhone,
      referrerFirstName,
      referrerLastName,
      referrerEmail,
      referrerPhone,
      // comment removed from here - now optional
    ]

    if (requiredFields.some((field) => !field)) {
      return { error: "All required fields must be filled" }
    }

    if (!validateEmail(referralEmail)) {
      return { error: "Invalid applicant email format" }
    }

    if (!validateEmail(referrerEmail)) {
      return { error: "Invalid referrer email format" }
    }

    if (!validatePhoneNumber(referralPhone)) {
      return { error: "Invalid applicant phone number format" }
    }

    if (!validatePhoneNumber(referrerPhone)) {
      return { error: "Invalid referrer phone number format" }
    }

    const sanitizedData = {
      referralFirstName: sanitizeInput(referralFirstName),
      referralLastName: sanitizeInput(referralLastName),
      referralEmail: sanitizeInput(referralEmail),
      referralPhone: sanitizeInput(referralPhone),
      referrerFirstName: sanitizeInput(referrerFirstName),
      referrerLastName: sanitizeInput(referrerLastName),
      referrerEmail: sanitizeInput(referrerEmail),
      referrerPhone: sanitizeInput(referrerPhone),
      comment: sanitizeInput(comment || ""), // Handle empty comment gracefully
    }

    await resend.emails.send({
      from: "preporuke@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova preporuka za njegovateljicu",
      html: formatFormData(sanitizedData, "referral"),
    })

    console.log("Sanitized form data:", sanitizedData)
    return { message: "Referral submitted successfully" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to submit referral" }
  }
}

export async function submitRequestForm(formData: RequestFormData) {

  try {
    const { contractorFirstName, contractorLastName, contractorEmail, contractorPhone } = formData

    if (!contractorFirstName || !contractorLastName || !contractorEmail || !contractorPhone) {
      return { error: "All fields are required" }
    }

    if (!validateEmail(contractorEmail)) {
      return { error: "Invalid email format" }
    }

    if (!validatePhoneNumber(contractorPhone)) {
      return { error: "Invalid phone number format" }
    }

    const sanitizedData = {
      contractorFirstName: sanitizeInput(contractorFirstName),
      contractorLastName: sanitizeInput(contractorLastName),
      contractorEmail: sanitizeInput(contractorEmail),
      contractorPhone: sanitizeInput(contractorPhone),
    }

    await resend.emails.send({
      from: "prijava@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova prijava za njegu",
      html: formatFormData(
        {
          firstName: sanitizedData.contractorFirstName,
          lastName: sanitizedData.contractorLastName,
          email: sanitizedData.contractorEmail,
          phone: sanitizedData.contractorPhone,
        },
        "request",
      ),
    })

    console.log("Sanitized form data:", sanitizedData)
    return { message: "Application submitted successfully" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to submit application" }
  }
}