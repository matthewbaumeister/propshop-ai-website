'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    budget: '',
    timeline: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // For now, we'll use a simple mailto link
      // In production, you'd want to use a proper email service like SendGrid, Resend, or Supabase Edge Functions
      const mailtoLink = `mailto:info@prop-shop.ai?subject=Contact from ${encodeURIComponent(formData.name)} - ${encodeURIComponent(formData.company)}&body=${encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Phone: ${formData.phone}
Budget: ${formData.budget}
Timeline: ${formData.timeline}

Message:
${formData.message}
      `)}`

      window.location.href = mailtoLink
      setSubmitStatus('success')
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#2D5BFF] to-[#9AF23A] bg-clip-text text-transparent">
              Let&apos;s Build Something
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ready to transform your procurement process? Get in touch and let&apos;s discuss how Prop Shop AI can help you win more contracts.
            </p>
          </div>

          {/* Contact Form */}
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get Started</h2>
              <p className="text-gray-300 mb-8">
                Whether you&apos;re a small business looking to compete or a prime contractor seeking efficiency, we&apos;re here to help you succeed in government contracting.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2D5BFF] to-[#9AF23A] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-300">info@prop-shop.ai</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FF7A29] to-[#9AF23A] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Response Time</h3>
                    <p className="text-gray-300">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label htmlFor="budget" className="block text-sm font-medium mb-2">
                      Budget Range
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="Under $10k">Under $10k</option>
                      <option value="$10k - $50k">$10k - $50k</option>
                      <option value="$50k - $100k">$50k - $100k</option>
                      <option value="$100k - $500k">$100k - $500k</option>
                      <option value="$500k+">$500k+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium mb-2">
                      Timeline
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="Immediate">Immediate</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Tell us about your needs *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:border-transparent resize-none"
                    placeholder="Describe your current procurement challenges, specific opportunities you&apos;re pursuing, or how you&apos;d like to use Prop Shop AI..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#2D5BFF] to-[#9AF23A] text-white font-semibold py-4 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                {submitStatus === 'success' && (
                  <div className="text-green-400 text-center py-2">
                    Message sent successfully! We&apos;ll get back to you within 24 hours.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="text-red-400 text-center py-2">
                    There was an error sending your message. Please try again or email us directly at info@prop-shop.ai
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
