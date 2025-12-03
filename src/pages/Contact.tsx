// src/pages/Contact.tsx
import Button from "@/components/ui/Button"
import { useState } from "react"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const emailTarget = "budiputrajaya@outlook.com"

  // Outlook Deep-Link (tanpa mailto)
  const buildOutlookUrl = () => {
    const subject = encodeURIComponent(`Message from ${formData.name}`)
    const body = encodeURIComponent(
      `From: ${formData.name} (${formData.email})\n\n${formData.message}`
    )

    return `https://outlook.live.com/owa/?path=/mail/action/compose&to=${emailTarget}&subject=${subject}&body=${body}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Open Outlook Web Compose
    window.open(buildOutlookUrl(), "_blank")
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Contact me</h1>

      {/* INFO BOX */}
      <div className="p-5 mb-8 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-lg">
          Or send directly to:
          <span className="font-semibold text-emerald-700 ml-1">
            {emailTarget}
          </span>
        </p>

        <a
          href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=${emailTarget}`}
          target="_blank"
          className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Open Outlook Compose
        </a>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
          required
        />

        <Button type="submit" className="w-full md:w-auto">
          Send Message via Outlook
        </Button>
      </form>
    </div>
  )
}

export default Contact
