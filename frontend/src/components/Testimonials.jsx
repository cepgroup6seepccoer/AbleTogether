import React from "react";

const testimonials = [
  {
    name: "Ravi",
    quote: "AccessMap helped me find a wheelchair-friendly park for my mother. Thank you!",
  },
  {
    name: "Fatima",
    quote: "I love how easy it is to add new places and help others.",
  },
  {
    name: "Priya",
    quote: "The accessibility filters make it so easy to find exactly what I need.",
  },
  {
    name: "Amit",
    quote: "Great app for finding accessible places in my neighborhood.",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-white py-6 lg:py-8 px-4 lg:px-8" aria-label="User testimonials">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg lg:text-xl font-bold mb-6 lg:mb-8 text-center">What our users say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="bg-gray-100 rounded-lg p-4 lg:p-6">
              <p className="text-sm lg:text-lg italic text-gray-700 mb-3 lg:mb-4">"{t.quote}"</p>
              <footer className="text-right font-semibold text-sm lg:text-base text-gray-600">- {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
} 