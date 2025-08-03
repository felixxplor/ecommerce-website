'use client'

import React, { useState } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // FAQ Categories
  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'ordering', name: 'Ordering' },
    { id: 'shipping', name: 'Shipping & Delivery' },
    { id: 'returns', name: 'Returns & Refunds' },
    { id: 'products', name: 'Products' },
    { id: 'account', name: 'Account & Payment' },
  ]

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: 'ordering',
      question: 'How do I place an order on your website?',
      answer:
        'To place an order, browse our products and click "Add to Cart" for items you wish to purchase. Once you\'ve added all desired items, click on the cart icon and proceed to checkout. You\'ll need to provide shipping information and payment details to complete your order.',
    },
    {
      id: 2,
      category: 'ordering',
      question: "Can I modify or cancel my order after it's been placed?",
      answer:
        'You can modify or cancel your order within 1 hour of placing it by contacting our customer service team. Once your order has been processed or shipped, it cannot be modified or cancelled. Please reach out to us as soon as possible if you need to make changes.',
    },
    {
      id: 3,
      category: 'shipping',
      question: 'How much does shipping cost?',
      answer:
        'We offer free standard shipping on all orders within Australia, regardless of order value. Express shipping is available at checkout for an additional fee based on your location and order size.',
    },
    {
      id: 4,
      category: 'shipping',
      question: 'How long will it take to receive my order?',
      answer:
        'Standard shipping typically takes 2-7 business days within Australia. Express shipping orders placed before 12:30pm AEST on weekdays are dispatched the same day and usually arrive faster, but delivery times can vary depending on your location.',
    },
    {
      id: 5,
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer:
        "Currently, we only ship within Australia. We're working on expanding our shipping options to include international destinations in the future.",
    },
    {
      id: 6,
      category: 'returns',
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day return policy, which means you have 30 days after receiving your item to request a return. To be eligible for a return, your item must be unused and in the same condition that you received it, with all original packaging and tags attached.',
    },
    {
      id: 7,
      category: 'returns',
      question: 'How do I start a return?',
      answer:
        "To start a return, please email us at returns@gizmooz.com or call our customer service team. We'll provide you with specific instructions and a return shipping address. Please note that you will be responsible for paying the return shipping costs unless the item was defective or damaged.",
    },
    {
      id: 8,
      category: 'returns',
      question: 'How long do refunds take to process?',
      answer:
        "Once we receive and inspect your return, we'll notify you about the status of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days, depending on your payment provider's processing time.",
    },
    {
      id: 9,
      category: 'products',
      question: 'Are your products covered by warranty?',
      answer:
        'Yes, all our products come with a standard 12-month warranty against manufacturing defects. Some premium products may have extended warranty options. The specific warranty details for each product are listed on the product page.',
    },
    {
      id: 10,
      category: 'products',
      question: 'How can I find product specifications?',
      answer:
        'Detailed product specifications are listed on each product page under the "Specifications" tab. This includes dimensions, weight, compatibility information, and technical specifications. If you need additional information, please contact our customer support team.',
    },
    {
      id: 11,
      category: 'account',
      question: 'How do I create an account?',
      answer:
        'You can create an account by clicking on the "Account" icon in the top right corner of our website and selecting "Register." You\'ll need to provide your email address and create a password. Having an account allows you to track orders, save your shipping information, and check order history.',
    },
    {
      id: 12,
      category: 'account',
      question: 'What payment methods do you accept?',
      answer:
        "We accept Visa, Mastercard, American Express, PayPal, AfterPay, and Zip Pay. All payments are processed securely, and we don't store your credit card information on our servers.",
    },
    {
      id: 13,
      category: 'account',
      question: 'Is my personal information secure?',
      answer:
        'Yes, we take data security seriously. Our website uses SSL encryption to protect your personal and payment information. We also have strict data handling protocols and never share your information with third parties without your consent. For more details, please review our Privacy Policy.',
    },
    {
      id: 14,
      category: 'products',
      question: "Can I request a product that's out of stock?",
      answer:
        'Yes, for out-of-stock items, you can sign up to receive email notifications when the product becomes available again. There\'s a "Notify Me" button on the product page for out-of-stock items. If a product is discontinued, it will be marked as such on the website.',
    },
    {
      id: 15,
      category: 'shipping',
      question: 'How can I track my order?',
      answer:
        "Once your order ships, you'll receive a confirmation email with a tracking number and link. You can also track your order by logging into your account and viewing your order history. The tracking information is updated regularly as your package moves through the delivery network.",
    },
  ]

  // Filter FAQs based on search term and active category
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search for questions..."
              className="pl-10 py-6 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Content */}
        <div className="max-w-3xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${faq.id}`}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 font-medium text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-gray-50 text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-600">
                We couldn't find any FAQs matching your search. Please try different keywords or
                browse by category.
              </p>
            </div>
          )}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 max-w-3xl mx-auto bg-blue-50 rounded-xl p-8 border border-blue-100 text-center">
          <h2 className="text-2xl font-serif font-medium mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            If you couldn't find the answer you were looking for, our customer support team is ready
            to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <a href="/contact" className="flex items-center">
                Contact Us
              </a>
            </Button>
            <Button variant="outline" className="border-blue-200 hover:bg-blue-100">
              <a href="mailto:info@gizmooz.com" className="flex items-center">
                Email Support
              </a>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
