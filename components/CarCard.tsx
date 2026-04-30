"use client";

import { Car } from "@/lib/types";
import { getCarImage } from "@/lib/carImages";

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (car: Car) => void;
}

export default function CarCard({ car, onSelect, isShortlisted, onToggleShortlist }: CarCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover cursor-pointer group"
      onClick={() => onSelect(car)}
    >
      {/* Car image */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={getCarImage(car.id)}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Shortlist button */}
        {onToggleShortlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist(car);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isShortlisted
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-400 hover:text-red-500"
            }`}
          >
            <svg className="w-4 h-4" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Safety badge */}
        <div className={`absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded-full ${
          car.safety_rating >= 4 ? "bg-green-500" : car.safety_rating === 3 ? "bg-yellow-500" : "bg-red-500"
        }`}>
          {car.safety_rating} / 5 Safe
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Rating */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {car.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-xs font-semibold text-gray-700">{car.safety_rating}/5</span>
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        <p className="text-blue-600 font-bold text-sm mb-3">{car.price_display}</p>

        {/* Specs strip */}
        <div className="bg-gray-50 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 uppercase tracking-wide">Fuel</span>
            <span className="text-gray-700 font-medium">{car.fuel.join(" / ")}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 uppercase tracking-wide">Mileage</span>
            <span className="text-gray-700 font-medium">
              {car.mileage_kmpl ? `${car.mileage_kmpl} kmpl` : `${car.range_km} km range`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 uppercase tracking-wide">Transmission</span>
            <span className="text-gray-700 font-medium">{car.transmission.join(" / ")}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 uppercase tracking-wide">Seats</span>
            <span className="text-gray-700 font-medium">{car.seating} Seater</span>
          </div>
        </div>

      </div>
    </div>
  );
}
