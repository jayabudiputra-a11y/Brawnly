import { Link } from 'react-router-dom';
import { Dumbbell, Heart, Mail, ShieldCheck, Scale, FileText, ExternalLink } from 'lucide-react';
import React, { useEffect } from 'react';
import NewsletterForm from '@/components/common/NewsletterForm'; 
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage';
import { registerSW } from '@/pwa/swRegister';

const Footer = () => {
    const emailAddress = "bbudi6621@gmail.com";
    const subject = "Brawnly Editorial / Ideal Man Discussion";
    const body = "Hi Budi,\n\nI'm very interested in the 'Muscle Worship' and 'Mindset' content on Brawnly. I'd love to discuss the concept of an ideal/dream man further based on your perspective.";

    useEffect(() => {
        registerSW();
    }, []);

    const handleDirectGmail = async () => {
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        await setCookieHash("contact_intent");
        mirrorQuery({ type: "CONTACT_CLICK", target: emailAddress, ts: Date.now() });

        const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${encodedSubject}&body=${encodedBody}`;
        const mailtoUrl = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = mailtoUrl;
        } else {
            window.open(gmailWebUrl, '_blank');
        }
    };

    return (
        <footer className="bg-gray-900 text-white py-16 transition-colors duration-300 border-t-4 border-black">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Dumbbell className="w-8 h-8 text-emerald-500" />
                            <span className="text-3xl font-black uppercase tracking-tighter italic bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Brawnly
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness. 
                            Operating at the intersection of Tech and Physical Performance.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 border-b border-gray-800 pb-2">
                            Standards & Legal
                        </h2>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/ethics" className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-all font-bold uppercase text-[11px] tracking-widest group">
                                    <Scale size={14} className="group-hover:rotate-12 transition-transform" /> 
                                    Editorial Ethics
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="flex items-center gap-2 text-gray-300 hover:text-emerald-500 transition-all font-bold uppercase text-[11px] tracking-widest group">
                                    <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" /> 
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-all font-bold uppercase text-[11px] tracking-widest group">
                                    <FileText size={14} className="group-hover:-translate-y-0.5 transition-transform" /> 
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Stay Inspired</h2>
                        <div className="mb-4">
                             <NewsletterForm />
                        </div>
                        <p className="text-gray-400 text-[10px] font-serif italic leading-tight">
                            Latest protocols synced to your local archive weekly.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Direct Contact</h2>
                        <p className="text-gray-400 mb-6 italic text-xs flex items-center gap-1">
                            Made with <Heart className="inline w-4 h-4 text-red-500 animate-pulse" /> in Medan, 2026.
                        </p>

                        <button 
                            onClick={handleDirectGmail}
                            className="w-full inline-flex items-center justify-between px-4 py-3 border border-gray-700 rounded-none bg-gray-800/50 text-gray-300 hover:text-white hover:bg-black hover:border-emerald-500 transition-all duration-500 group"
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-emerald-500 group-hover:animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Open Gmail Direct</span>
                            </div>
                            <ExternalLink size={12} className="opacity-30 group-hover:opacity-100" />
                        </button>
                        <p className="text-[8px] text-gray-600 mt-2 uppercase tracking-tighter">
                            Bypassing generic mailto via Gmail Interface
                        </p>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-12" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    <div>
                        © 2026 <span className="text-white">Brawnly.online</span>. All Protocols Logged.
                    </div>
                    <div className="flex gap-8">
                        <Link to="/about" className="hover:text-white transition-colors">About</Link>
                        <Link to="/articles" className="hover:text-white transition-colors">Archive</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic">
                        Built for the community.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;