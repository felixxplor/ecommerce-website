'use client'

import React, { useState } from 'react'
import { FormEvent } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Mail, MapPin, Phone } from 'lucide-react'

export default function ContactUs() {
  // Define an interface for the form data
  interface ContactFormData {
    name: string
    email: string
    phone: string
    subject: string
    message: string
    inquiryType: string
  }

  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: '',
  })

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      inquiryType: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError('')

    try {
      // This would be replaced with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Clear form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: '',
      })

      setFormSubmitted(true)
    } catch (error) {
      // console.error('Error submitting contact form:', error)
      setFormError('There was a problem sending your message. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text">Contact Us</h1>
            <p className="text-gray-600 text-lg">
              Have questions about our products or services? We're here to help!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Information Cards */}
          {/* <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-4 flex items-center justify-center">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <CardContent className="p-6 text-center">
              <h3 className="font-medium text-lg mb-2">Phone</h3>
              <p className="text-gray-600 mb-4">Call us during business hours</p>
              <a
                href="tel:1300123456"
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                1300 123 456
              </a>
            </CardContent>
          </Card> */}

          <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-50 p-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <CardContent className="p-6 text-center">
              <h3 className="font-medium text-lg mb-2">Email</h3>
              <p className="text-gray-600 mb-4">We'll respond as soon as possible</p>
              <a
                href="mailto:info@gizmooz.com"
                className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
              >
                info@gizmooz.com
              </a>
            </CardContent>
          </Card>

          {/* <Card className="overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-50 p-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <CardContent className="p-6 text-center">
              <h3 className="font-medium text-lg mb-2">Office</h3>
              <p className="text-gray-600 mb-4">Visit our headquarters</p>
              <address className="text-green-600 not-italic">
                123 Tech Avenue
                <br />
                Sydney, NSW 2000
                <br />
                Australia
              </address>
            </CardContent>
          </Card> */}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          {/* <div>
            <h2 className="text-2xl font-serif font-medium mb-6">Send Us a Message</h2>

            {formSubmitted ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700 mb-4">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => setFormSubmitted(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700">{formError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(02) 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select
                      onValueChange={handleSelectChange}
                      value={formData.inquiryType}
                      required
                    >
                      <SelectTrigger id="inquiryType">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="returns">Returns & Refunds</SelectItem>
                        <SelectItem value="shipping">Shipping Question</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's your message about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full py-6" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div> */}

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-serif font-medium mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-lg mb-2">What are your business hours?</h3>
                <p className="text-gray-600">
                  Our customer support team is available Monday to Friday, 9am to 5pm AEST. We're
                  closed on public holidays.
                </p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-lg mb-2">How long does shipping take?</h3>
                <p className="text-gray-600">
                  We offer free standard shipping on all orders, which typically takes 2-7 business
                  days. Express shipping is available at checkout for an additional fee.
                </p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-lg mb-2">What is your return policy?</h3>
                <p className="text-gray-600">
                  We offer a 30-day return policy on most items. Please visit our
                  <a
                    href="/return-policy"
                    className="text-blue-600 hover:text-blue-800 transition-colors ml-1"
                  >
                    Return Policy
                  </a>{' '}
                  page for more details.
                </p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-lg mb-2">Do you ship internationally?</h3>
                <p className="text-gray-600">
                  Currently, we only ship within Australia. We're working on expanding our shipping
                  options to international customers soon.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">How can I track my order?</h3>
                <p className="text-gray-600">
                  Once your order ships, you'll receive a confirmation email with tracking
                  information. You can also check your order status in your account dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
