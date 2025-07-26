import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { formatFormData } from "@/utils/emailTemplates"
import { validateEmail, validatePhoneNumber, sanitizeInput } from "@/utils/validation"

const resend = new Resend(process.env.RESEND_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, comment } = body

    // Basic input validation
    if (!firstName || !lastName || !email || !phone || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Sanitizing user inputs
    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      comment: sanitizeInput(comment),
    }

    // Send email
    await resend.emails.send({
      from: "kontakt@elan-living.com",
      to: "team@elan-living.com",
      subject: "Nova kontakt poruka",
      html: formatFormData(sanitizedData, "message"),
    })

    console.log("Sanitized form data:", sanitizedData)
    return NextResponse.json({ message: "Message sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
