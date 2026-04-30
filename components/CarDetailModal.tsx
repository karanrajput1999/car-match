"use client";

import { Car } from "@/lib/types";
import { getCarImage } from "@/lib/carImages";

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (car: Car) => void;
}

export default function CarDetailModal({ car, onClose, isShortlisted, onToggleShortlist }: CarDetailModalProps) {
  if (!car) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{car.name}</h2>
            <p className="text-blue-600 font-semibold">{car.price_display}</p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleShortlist && (
              <button
                onClick={() => onToggleShortlist(car)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isShortlisted
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                <svg className="w-4 h-4" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isShortlisted ? "Shortlisted" : "Shortlist"}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Car image */}
          <div className="rounded-xl overflow-hidden h-56 bg-gray-100">
            <img
              src={getCarImage(car.id)}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Body", value: car.body_type },
              { label: "Fuel", value: car.fuel.join(", ") },
              { label: "Mileage", value: car.mileage_kmpl ? `${car.mileage_kmpl} kmpl` : `${car.range_km}km range` },
              { label: "Safety", value: `${car.safety_rating}/5 NCAP` },
              { label: "Seating", value: `${car.seating} seats` },
              { label: "Engine", value: car.engine_cc ? `${car.engine_cc}cc` : "Electric" },
              { label: "Boot", value: `${car.boot_space_litres}L` },
              { label: "Transmission", value: car.transmission.join(", ") },
            ].map((spec) => (
              <div key={spec.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">{spec.label}</p>
                <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {car.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Best for */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Best For</p>
            <p className="text-sm text-blue-700">{car.best_for}</p>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 text-sm">Pros</h4>
              <ul className="space-y-1.5">
                {car.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2 text-sm">Cons</h4>
              <ul className="space-y-1.5">
                {car.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Variants */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Variants & Pricing</h4>
            <div className="space-y-2">
              {car.variants.map((variant) => (
                <div
                  key={variant.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    variant.is_top
                      ? "border-blue-200 bg-blue-50"
                      : variant.is_base
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                      {variant.is_base && (
                        <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded">Base</span>
                      )}
                      {variant.is_top && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Top</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {variant.fuel_type} | {variant.transmission}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {variant.key_features.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-3">
                    {"\u20B9"}{(variant.price / 100000).toFixed(2)}L
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">User Reviews</h4>
            <div className="space-y-3">
              {car.reviews.map((review, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{review.author}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mb-1">{review.use_case}</p>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
