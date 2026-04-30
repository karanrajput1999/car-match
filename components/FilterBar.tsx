"use client";

import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filters: Record<string, string>) => void;
  activeFilters: Record<string, string>;
}

const BUDGET_OPTIONS = [
  { label: "Under 5L", value: "0-500000" },
  { label: "5-10L", value: "500000-1000000" },
  { label: "10-15L", value: "1000000-1500000" },
  { label: "15-20L", value: "1500000-2000000" },
  { label: "20L+", value: "2000000-99999999" },
];

const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Kia", "Honda", "Toyota", "MG", "Renault"];
const MODELS: Record<string, string[]> = {
  "Maruti Suzuki": ["Swift", "Alto K10", "Brezza", "Ertiga"],
  "Hyundai": ["i20", "Venue", "Creta", "Verna", "Creta Electric"],
  "Tata": ["Tiago", "Nexon", "Harrier", "Safari", "Nexon EV"],
  "Kia": ["Sonet", "Seltos"],
  "Honda": ["City"],
  "Toyota": ["Innova Crysta"],
  "MG": ["ZS EV"],
  "Renault": ["Kwid"],
};
const BODY_TYPES = ["Hatchback", "Compact SUV", "Mid SUV", "Sedan", "MPV", "Large SUV"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"];
const TRANSMISSIONS = ["Manual", "Automatic", "AMT", "DCT", "CVT", "IVT"];

// Filters that use vertical checkbox list with search
const LIST_FILTERS = ["brand", "model", "bodyType"];
// Filters that use horizontal pills (few short options)
const PILL_FILTERS = ["fuelType", "transmission"];

export default function FilterBar({ onFilterChange, activeFilters }: FilterBarProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key]?.split(",").filter(Boolean) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...activeFilters, [key]: updated.join(",") });
  };

  const setBudget = (value: string) => {
    const current = activeFilters.budget;
    if (current === value) {
      const { budget: _, ...rest } = activeFilters;
      void _;
      onFilterChange({ ...rest, budgetMin: "", budgetMax: "" });
    } else {
      const [min, max] = value.split("-");
      onFilterChange({ ...activeFilters, budget: value, budgetMin: min, budgetMax: max });
    }
  };

  const isActive = (key: string, value: string) => {
    return activeFilters[key]?.split(",").includes(value);
  };

  const clearAll = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v);

  const selectedBrands = activeFilters.brand?.split(",").filter(Boolean) || [];
  const availableModels = selectedBrands.length > 0
    ? selectedBrands.flatMap((b) => MODELS[b] || [])
    : Object.values(MODELS).flat();

  const getItems = (key: string): string[] => {
    if (key === "brand") return BRANDS;
    if (key === "model") return availableModels;
    if (key === "bodyType") return BODY_TYPES;
    if (key === "fuelType") return FUEL_TYPES;
    if (key === "transmission") return TRANSMISSIONS;
    return [];
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      brand: "Brand", model: "Model", budget: "Budget",
      bodyType: "Body Type", fuelType: "Fuel", transmission: "Transmission",
    };
    return labels[key] || key;
  };

  const filterSections = [
    { key: "brand" }, { key: "model" }, { key: "budget" },
    { key: "bodyType" }, { key: "fuelType" }, { key: "transmission" },
  ];

  const activeCount = (key: string) => {
    if (key === "budget") return activeFilters.budget ? 1 : 0;
    return activeFilters[key]?.split(",").filter(Boolean).length || 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Filter section tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-500 mr-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {filterSections.map((section) => {
          const count = activeCount(section.key);
          return (
            <button
              key={section.key}
              onClick={() => {
                setExpandedFilter(expandedFilter === section.key ? null : section.key);
                setFilterSearch("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                expandedFilter === section.key
                  ? "bg-blue-600 text-white"
                  : count > 0
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getLabel(section.key)}
              {count > 0 && (
                <span className={`text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${
                  expandedFilter === section.key ? "bg-white/25" : "bg-blue-600 text-white"
                }`}>
                  {count}
                </span>
              )}
              {expandedFilter === section.key ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-700 ml-auto font-medium cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ---- LIST FILTERS: Brand, Model, Body Type ---- */}
      {expandedFilter && LIST_FILTERS.includes(expandedFilter) && (() => {
        const items = getItems(expandedFilter);
        const filtered = filterSearch
          ? items.filter((item) => item.toLowerCase().includes(filterSearch.toLowerCase()))
          : items;

        return (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Search input */}
            <div className="relative mb-2">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder={`Search ${getLabel(expandedFilter).toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                autoFocus
              />
            </div>
            {/* Vertical checkbox list */}
            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {filtered.length > 0 ? filtered.map((item) => {
                const checked = isActive(expandedFilter, item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      checked ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 bg-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFilter(expandedFilter, item);
                      }}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${checked ? "font-medium text-blue-700" : "text-gray-700"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFilter(expandedFilter, item);
                      }}
                    >
                      {item}
                    </span>
                  </label>
                );
              }) : (
                <p className="text-sm text-gray-400 px-3 py-2">No matches found</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* ---- PILL FILTERS: Fuel, Transmission ---- */}
      {expandedFilter && PILL_FILTERS.includes(expandedFilter) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {getItems(expandedFilter).map((item) => (
            <button
              key={item}
              onClick={() => toggleFilter(expandedFilter, item)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                isActive(expandedFilter, item)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* ---- BUDGET FILTER ---- */}
      {expandedFilter === "budget" && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudget(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                activeFilters.budget === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
