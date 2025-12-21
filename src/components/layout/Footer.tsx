// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { Dumbbell, Heart, Mail } from 'lucide-react';
import React from 'react';
import NewsletterForm from '@/components/common/NewsletterForm'; 

const Footer = () => {
    const emailAddress = "budi.putra.jaya20@gmail.com";

    const subject = "Muscle Worship & Ideal Man Discussion";
    
    const body = "Hi Budi,\n\nI'm very interested in the 'Muscle Worship' and 'Mindset' content on Fitapp. I'd love to discuss the concept of an ideal/dream man further based on your perspective. Do you think I fit the description of the type of man you usually admire?";
    
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // NOTE: The toast here uses react-hot-toast, while your hook uses sonner.
    // It's better to be consistent. I'll remove this toast for simplicity
    // since the hook already provides feedback.

    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Dumbbell className="w-8 h-8 text-emerald-500" />
                            <span className="text-2xl font-bold">Fitapp</span>
                        </div>
                        <p className="text-gray-400">
                            LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/about" className="hover:text-emerald-500 transition">About</Link></li>
                            <li><Link to="/contact" className="hover:text-emerald-500 transition">Contact</Link></li>
                            <li><Link to="/articles" className="hover:text-emerald-500 transition">All Articles</Link></li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Newsletter Subscription */}
                    <div>
                        <h3 className="font-semibold mb-4">Stay Inspired</h3>
                        <p className="text-gray-400 mb-4 text-sm">
                            {/* ENGLISH */}
                            Get the latest articles on fitness and mindset delivered to your inbox.
                        </p>
                        <NewsletterForm />
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        {/* ENGLISH */}
                        <h3 className="font-semibold mb-4">Get In Touch</h3>
                        <p className="text-gray-400 mb-4">
                            Made with <Heart className="inline w-5 h-5 text-red-500" /> for the community.
                        </p>

                        <a 
                            href={mailtoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition"
                        >
                            <Mail className="w-5 h-5" />
                            {emailAddress}
                        </a>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                    © 2025 Fitapp. All rights reserved. Built with passion and purpose.
                </div>
            </div>
        </footer>
    );
};

export default Footer;