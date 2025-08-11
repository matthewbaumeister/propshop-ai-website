import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone, role, attendees, notes, selectedDate, selectedTime } = await request.json()

    // Email content for the notification
    const emailContent = `
New Demo Booking Request

Name: ${name}
Email: ${email}
Company: ${company}
Phone: ${phone || 'Not provided'}
Role: ${role || 'Not provided'}
Attendees: ${attendees}
Date: ${selectedDate}
Time: ${selectedTime} EST

Notes: ${notes || 'No special requests'}

---
This notification was sent from the Prop Shop AI demo booking system.
    `

    // Send email using SendGrid
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: 'info@prop-shop.ai',
                name: 'Prop Shop AI'
              }
            ],
            subject: `New Demo Request: ${name} from ${company}`
          }
        ],
        from: {
          email: 'noreply@prop-shop.ai',
          name: 'Prop Shop AI'
        },
        content: [
          {
            type: 'text/plain',
            value: emailContent
          },
          {
            type: 'text/html',
            value: emailContent.replace(/\n/g, '<br>')
          }
        ]
      }),
    })

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text()
      console.error('SendGrid error:', errorText)
      throw new Error('Failed to send email notification')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo request submitted successfully'
    })

  } catch (error) {
    console.error('Error processing demo request:', error)
    return NextResponse.json(
      { error: 'Failed to process demo request' },
      { status: 500 }
    )
  }
}
