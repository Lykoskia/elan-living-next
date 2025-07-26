import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { formatFormData } from "@/utils/emailTemplates"
import { validateEmail, validatePhoneNumber, sanitizeInput } from "@/utils/validation"

const resend = new Resend(process.env.RESEND_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorFirstName, contractorLastName, contractorEmail, contractorPhone } = body

    // Basic input validation
    if (!contractorFirstName || !contractorLastName || !contractorEmail || !contractorPhone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!validateEmail(contractorEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!validatePhoneNumber(contractorPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Sanitizing user inputs
    const sanitizedData = {
      contractorFirstName: sanitizeInput(contractorFirstName),
      contractorLastName: sanitizeInput(contractorLastName),
      contractorEmail: sanitizeInput(contractorEmail),
      contractorPhone: sanitizeInput(contractorPhone),
    }

    // Send email
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
    return NextResponse.json({ message: "Application submitted successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
