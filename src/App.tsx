import { Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect, lazy, Suspense } from "react";

import Layout from "@/components/layout/Layout";
import IframeA11yFixer from "@/components/common/IframeA11yFixer";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import type { AuthPageLayoutProps } from "@/types";

const Home = lazy(() => import("@/pages/Home"));
const Articles = lazy(() => import("@/pages/Articles"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage").catch(() => { window.location.reload(); return { default: () => null as any }; }));
const Category = lazy(() => import("@/pages/Category"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Author = lazy(() => import("@/pages/Author"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Profile = lazy(() => import("@/pages/Profile"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Library = lazy(() => import("@/pages/Library"));

const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Ethics = lazy(() => import("@/pages/Ethics"));

const SignUpForm = lazy(() => import("@/components/SignUpForm"));
const SignInForm = lazy(() => import("@/components/common/SignInForms"));

const AuthLayout: React.FC<AuthPageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-green-500 selection:text-black transition-colors duration-300">
      <IframeA11yFixer />
      <ScrollToTopButton />

      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="subscribe" element={<Subscription />} />
            <Route path="profile" element={<Profile />} />
            <Route path="library" element={<Library />} />
            <Route path="article/:slug" element={<ArticlePage />} />
            <Route path="category/:slug" element={<Category />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="author" element={<Author />} />
            <Route path="auth/callback" element={<AuthCallback />} />

            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="ethics" element={<Ethics />} />
          </Route>

          <Route
            path="/signup"
            element={
              <AuthLayout title="Join Brawnly">
                <SignUpForm />
              </AuthLayout>
            }
          />

          <Route
            path="/signin"
            element={
              <AuthLayout title="Welcome Back">
                <SignInForm />
              </AuthLayout>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;