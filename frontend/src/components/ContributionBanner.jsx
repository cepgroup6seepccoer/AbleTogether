import React from "react";

export default function ContributionBanner() {
  return (
    <section className="w-full bg-blue-50 py-6 lg:py-8 px-4 lg:px-8" aria-label="Contribute section">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-xl lg:text-2xl font-bold text-blue-800 mb-3 lg:mb-4">
          Help make India more accessible!
        </h2>
        <p className="text-base lg:text-lg text-blue-700 mb-6 lg:mb-8">
          Add a new accessible place, submit a review, or report an issue to help others.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="bg-blue-700 text-white px-4 lg:px-6 py-3 rounded-lg text-base lg:text-lg font-semibold hover:bg-blue-800 transition-colors" 
            aria-label="Add New Accessible Place"
          >
            Add New Accessible Place
          </button>
          <button 
            className="bg-green-700 text-white px-4 lg:px-6 py-3 rounded-lg text-base lg:text-lg font-semibold hover:bg-green-800 transition-colors" 
            aria-label="Submit Review or Report Issue"
          >
            Submit Review / Report Issue
          </button>
        </div>
      </div>
    </section>
  );
} 