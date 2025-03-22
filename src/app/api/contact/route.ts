// app/api/contact/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, inquiryType } = body

    // Validate required fields
    if (!name || !email || !subject || !message || !inquiryType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Configure email transporter
    // NOTE: For production, use your actual SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASSWORD || 'your-password',
      },
    })

    // Email options
    const mailOptions = {
      from: `"Gizmooz Contact Form" <${process.env.SMTP_USER || 'noreply@gizmooz.com'}>`,
      to: process.env.CONTACT_EMAIL || 'info@gizmooz.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Inquiry Type: ${inquiryType}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4361ee;">New Contact Form Submission</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; width: 30%;"><strong>Name:</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <a href="mailto:${email}" style="color: #4361ee;">${email}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || 'Not provided'}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Inquiry Type:</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${inquiryType}</td>
    </tr>
  </table>
  
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
    <h3 style="margin-top: 0; color: #333;">Message:</h3>
    <p style="white-space: pre-line;">${message}</p>
  </div>
  
  <p style="color: #666; font-size: 12px; margin-top: 30px;">
    This email was sent from the contact form on gizmooz.com
  </p>
</div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
