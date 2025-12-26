import Button from "@/components/ui/Button";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const emailTarget = "budiputrajaya@outlook.com";

  const buildOutlookUrl = () => {
    const subject = encodeURIComponent("🌈 Question: Am I your ideal man? ✨");

    const body = encodeURIComponent(
      `Hi Budi,\n\nMy name is ${formData.name} (${formData.email}).\n\n${formData.message}\n\n🌈 Stay Colorful! 🌈`
    );

    return `https://outlook.live.com/mail/0/deeplink/compose?to=${emailTarget}&subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    window.open(buildOutlookUrl(), "_blank");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 transition-colors duration-300">
      <h1 className="text-4xl font-black mb-8 flex gap-x-2">
        <span className="text-red-500">Contact</span>
        <span className="text-blue-500">Me</span>
      </h1>

      <div className="p-6 mb-8 bg-white dark:bg-gray-800 border-2 border-dashed border-emerald-400 rounded-xl shadow-lg">
        <p className="text-lg font-bold flex flex-wrap gap-x-1">
          <span className="text-orange-500">Or</span>
          <span className="text-yellow-600 dark:text-yellow-400">send</span>
          <span className="text-green-500">directly</span>
          <span className="text-blue-500">to:</span>
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent ml-1">
            {emailTarget}
          </span>
        </p>

        <a
          href={`https://outlook.live.com/mail/0/deeplink/compose?to=${emailTarget}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
        >
          📧 Open Outlook Compose
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:text-white transition-colors"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 dark:text-white transition-colors"
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-5 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-pink-500 dark:text-white transition-colors resize-none"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 hover:opacity-90 text-white font-black py-4 px-8 rounded-xl shadow-xl transform active:scale-95 transition-all"
        >
          🚀 Send Message via Outlook
        </Button>
      </form>
    </div>
  );
};

export default Contact;
