'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'

export default function BookDemoPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    attendees: '1',
    notes: ''
  })

  // Available time slots (12:00 PM - 5:00 PM EST, Thursday/Friday only)
  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = new Date(e.target.value)
    const dayOfWeek = selected.getDay()
    
    // Only allow Thursday (4) and Friday (5)
    if (dayOfWeek === 4 || dayOfWeek === 5) {
      setSelectedDate(e.target.value)
    } else {
      alert('Please select Thursday or Friday only')
    }
  }

  const handleCalendarBooking = async (provider: 'outlook' | 'google' | 'calendly') => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time first')
      return
    }

    // Send email notification first
    try {
      const response = await fetch('/api/send-demo-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedDate,
          selectedTime
        }),
      })

      if (!response.ok) {
        console.error('Failed to send notification email')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const endTime = new Date(dateTime.getTime() + 30 * 60000) // 30 minutes later
    
    const title = encodeURIComponent('Prop Shop AI Demo')
    const description = encodeURIComponent(`
Demo for: ${formData.name} (${formData.company})
Email: ${formData.email}
Phone: ${formData.phone}
Role: ${formData.role}
Attendees: ${formData.attendees}

Notes: ${formData.notes}

Join us for a personalized demo of Prop Shop AI's procurement intelligence platform.
    `)

    let calendarUrl = ''

    switch (provider) {
      case 'outlook':
        // Microsoft Outlook/Office 365 - will go to info@prop-shop.ai
        calendarUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${dateTime.toISOString()}&enddt=${endTime.toISOString()}&location=${encodeURIComponent('Virtual Meeting - Link will be sent')}&to=info@prop-shop.ai`
        break
      case 'google':
        // Google Calendar
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${dateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&location=${encodeURIComponent('Virtual Meeting')}`
        break
      case 'calendly':
        // Calendly integration for matt@prop-shop.ai
        calendarUrl = 'https://calendly.com/matt-prop-shop/30min'
        break
    }

    window.open(calendarUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#2D5BFF] to-[#9AF23A] bg-clip-text text-transparent">
              Book Your Demo
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience how Prop Shop AI can transform your procurement process. 
              Choose your preferred time and we&apos;ll send you a calendar invitation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calendar Selection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Select Your Time</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date (Thursday/Friday Only)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time (EST)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => {
                      const displayTime = new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border transition-colors ${
                            selectedTime === time
                              ? 'bg-[#2D5BFF] border-[#2D5BFF] text-white'
                              : 'bg-white/10 border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {displayTime}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <div className="bg-[#2D5BFF]/20 border border-[#2D5BFF]/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      Selected: {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {new Date(`2000-01-01T${selectedTime}:00`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} EST
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Your Information</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-2">
                      Your Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                      placeholder="Capture Manager, BD Director, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="attendees" className="block text-sm font-medium mb-2">
                      Number of Attendees
                    </label>
                    <select
                      id="attendees"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5+">5+ people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Special Requests or Focus Areas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent resize-none"
                    placeholder="Any specific areas you&apos;d like us to focus on during the demo..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Calendar Integration Buttons */}
          {selectedDate && selectedTime && (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-6">Add to Your Calendar</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleCalendarBooking('outlook')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0078D4] hover:bg-[#0078D4]/90 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.59 11.59L13.5 19.68V4.32l8.09 8.09z"/>
                  </svg>
                  Add to Outlook
                </button>
                
                <button
                  onClick={() => handleCalendarBooking('google')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Add to Google Calendar
                </button>
                
                <button
                  onClick={() => handleCalendarBooking('calendly')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#006BFF] hover:bg-[#006BFF]/90 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Book via Calendly
                </button>
              </div>
              
              <p className="text-sm text-gray-400 mt-4">
                We&apos;ll also send you a confirmation email with meeting details and preparation materials.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
