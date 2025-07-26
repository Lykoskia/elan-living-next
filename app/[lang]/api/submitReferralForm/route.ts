import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { formatFormData } from "@/utils/emailTemplates"
import { validateEmail, validatePhoneNumber, sanitizeInput } from "@/utils/validation"

const resend = new Resend(process.env.RESEND_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = body

    // Basic input validation
    const requiredFields = [
      referralFirstName,
      referralLastName,
      referralEmail,
      referralPhone,
      referrerFirstName,
      referrerLastName,
      referrerEmail,
      referrerPhone,
      comment,
    ]

    if (requiredFields.some((field) => !field)) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Email validation
    if (!validateEmail(referralEmail)) {
      return NextResponse.json({ error: "Invalid applicant email format" }, { status: 400 })
    }

    if (!validateEmail(referrerEmail)) {
      return NextResponse.json({ error: "Invalid referrer email format" }, { status: 400 })
    }

    // Phone validation
    if (!validatePhoneNumber(referralPhone)) {
      return NextResponse.json({ error: "Invalid applicant phone number format" }, { status: 400 })
    }

    if (!validatePhoneNumber(referrerPhone)) {
      return NextResponse.json({ error: "Invalid referrer phone number format" }, { status: 400 })
    }

    // Sanitizing user inputs
    const sanitizedData = {
      referralFirstName: sanitizeInput(referralFirstName),
      referralLastName: sanitizeInput(referralLastName),
      referralEmail: sanitizeInput(referralEmail),
      referralPhone: sanitizeInput(referralPhone),
      referrerFirstName: sanitizeInput(referrerFirstName),
      referrerLastName: sanitizeInput(referrerLastName),
      referrerEmail: sanitizeInput(referrerEmail),
      referrerPhone: sanitizeInput(referrerPhone),
      comment: sanitizeInput(comment),
    }

    // Send email
    await resend.emails.send({
      from: "preporuke@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova preporuka za njegovateljicu",
      html: formatFormData(sanitizedData, "referral"),
    })

    console.log("Sanitized form data:", sanitizedData)
    return NextResponse.json({ message: "Referral submitted successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to submit referral" }, { status: 500 })
  }
}
