"use client";

import { Navbar } from "@/components/navbar";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import Image from "next/image";
import PromotionalCampaigns from "@/components/promotional";
import Feedback from "./feedback/page";
import ActiveTeamMembers from "@/components/ActiveTeamMembers";
import { useEffect } from "react";
import ChatBot from "@/components/ChatBot";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes moveGradient {
        0% {
          background-position: 0% 0%;
        }
        50% {
          background-position: 100% 100%;
        }
        100% {
          background-position: 0% 0%;
        }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <section className="relative flex flex-col items-center text-center text-gray-800 dark:text-gray-100 bg-yellow-50 dark:bg-yellow-900 w-full min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col md:flex-row items-center justify-between text-left px-8 md:px-20 py-16 dark:from-yellow-700 dark:via-yellow-800 dark:to-yellow-900">
        {/* Left Side Content */}
        <div className="max-w-xl z-10 animate-fade-in">
          <h1 className="text-5xl font-extrabold uppercase leading-snug text-gray-900 dark:text-yellow-300">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-md">
              Building the Future,
            </span>
            <br /> One Project at a Time
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-yellow-200 animate-fade-in delay-200">
            We specialize in high-quality construction services, ensuring
            durability, efficiency, and modern designs.
          </p>
          <div className="flex gap-4 mt-6 animate-fade-in delay-400">
            <Link
              href="#services"
              className={buttonStyles({
                color: "primary",
                radius: "full",
                size: "lg",
                className:
                  "shadow-lg hover:shadow-xl transition-all duration-300 bg-yellow-500 text-gray-800 hover:bg-yellow-600",
              })}
            >
              Our Services
            </Link>
            <Link
              href="#contact"
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                size: "lg",
                className:
                  "shadow-lg hover:shadow-xl transition-all duration-300 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white",
              })}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="relative w-full md:w-1/2 h-96 md:h-[400px] overflow-hidden rounded-lg shadow-2xl animate-scale-in">
          <Image
            src="/images/homepage.jpg"
            alt="160 Front Street West"
            layout="fill"
            objectFit="cover"
            className="rounded-lg shadow-lg transform transition-transform duration-500 hover:scale-105"
            priority
          />
          {/* Subtle Overlay Effect for Better Visibility */}
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 rounded-lg"></div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="mx-auto text-center px-6">
        {/* Title Section */}
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-transparent bg-clip-text">
            Services Offered
          </span>
        </h2>
        <p className="text-gray-600 dark:text-yellow-200 mt-3 text-lg">
          Choose the right plan that suits your construction business.
        </p>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-10 mt-12 ">
          {[
            {
              title: "Basic Plan",
              description:
                "Great for small contractors and freelancers starting out.",
            },
            {
              title: "Standard Plan",
              description:
                "Perfect for growing construction businesses and startups.",
            },
            {
              title: "Premium Plan",
              description:
                "Ideal for large construction firms managing complex projects.",
            },
          ].map((plan, index) => (
            <div
              key={index}
              className="p-8 bg-white/80 dark:bg-gray-900/80 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg transition-all hover:shadow-xl transform hover:-translate-y-1"
            >
              {/* Plan Title */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-yellow-300 uppercase tracking-wide">
                {plan.title}
              </h3>
              {/* Plan Description */}
              <p className="text-gray-600 dark:text-yellow-200 mt-4 text-base leading-relaxed">
                {plan.description}
              </p>
              {/* CTA Button */}
              <Link
                href="/services"
                className="mt-6 inline-block w-full text-center py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Insights Section */}
      <div className="container mt-10">
        <PromotionalCampaigns />
      </div>
      <div className="container mt-10">
        <Feedback />
      </div>

      <div className="container mt-10">
        {/* ✅ Show Active Team Members */}
        <ActiveTeamMembers />
      </div>

      <ChatBot />
      {/* Contact Section */}
      <div id="contact" className="container mt-0 max-w-4xl text-center px-6">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-yellow-300">
          Contact Us
        </h2>
        <p className="text-gray-600 dark:text-yellow-200 mt-2 max-w-2xl mx-auto text-base">
          Get in touch for a free consultation.
        </p>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 text-gray-800 dark:text-white text-center">          {/* Phone */}
          <a href="tel:+63281234567" className="flex items-center space-x-2">
            📞
            <span className="text-base font-medium">(02) 8123-4567</span>
          </a>

          {/* Email */}
          <a
            href="mailto:ar.buildtech@gmail.com"
            className="flex items-center space-x-2"
          >
            ✉️
            <span className="text-base font-medium">
              ar.buildtech@gmail.com
            </span>
          </a>

          {/* Location */}
          <a
            href="https://www.google.com/maps/place/Campos+Rueda+Building/@14.5599621,121.0131969,19z/data=!3m1!4b1!4m6!3m5!1s0x3397c90b830e5f29:0x89fe307dfecd3c0d!8m2!3d14.5599621!4d121.0131969!16s%2Fg%2F11c24lh1pd?entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 "
          >
            <span>📍 Where to Find Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}
