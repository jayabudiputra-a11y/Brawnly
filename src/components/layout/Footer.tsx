import { Link } from 'react-router-dom';
import { Dumbbell, Heart, Mail } from 'lucide-react';
import React from 'react';
import NewsletterForm from '@/components/common/NewsletterForm'; 

const Footer = () => {
    const emailAddress = "budi.putra.jaya20@gmail.com";
    const subject = "Muscle Worship & Ideal Man Discussion";
    const body = "Hi Budi,\n\nI'm very interested in the 'Muscle Worship' and 'Mindset' content on Fitapp. I'd love to discuss the concept of an ideal/dream man further based on your perspective. Do you think I fit the description of the type of man you usually admire?";
    
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return (
        <footer className="bg-gray-900 text-white py-12 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Dumbbell className="w-8 h-8 text-emerald-500" />
                            {/* Logo Fitapp dengan efek pelangi agar selaras */}
                            <span className="text-2xl font-black bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Fitapp
                            </span>
                        </div>
                        <p className="text-gray-400">
                            LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 border-b border-gray-800 pb-2">Quick Links</h3>
                        <ul className="space-y-2">
                            {/* Link menggunakan warna pelangi yang berbeda saat hover */}
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-red-400 transition-colors duration-300">About</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Contact</Link>
                            </li>
                            <li>
                                <Link to="/articles" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">All Articles</Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Newsletter Subscription */}
                    <div>
                        <h3 className="font-semibold mb-4">Stay Inspired</h3>
                        <p className="text-gray-400 mb-4 text-sm">
                            Get the latest articles on fitness and mindset delivered to your inbox.
                        </p>
                        <NewsletterForm />
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Get In Touch</h3>
                        <p className="text-gray-400 mb-4 italic">
                            Made with <Heart className="inline w-5 h-5 text-red-500 animate-pulse" /> for the community.
                        </p>

                        <a 
                            href={mailtoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all duration-300 group"
                        >
                            <Mail className="w-5 h-5 group-hover:scale-110" />
                            <span className="truncate">{emailAddress}</span>
                        </a>
                    </div>
                </div>

                {/* Garis pemisah dengan gradasi pelangi tipis */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8" />

                <div className="text-center text-gray-500 text-sm">
                    © 2025 <span className="font-bold">Fitapp</span>. All rights reserved. 
                    <p className="mt-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-medium">
                        Built with passion and purpose.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;