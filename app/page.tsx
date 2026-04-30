"use client";

import { useState, useEffect, useCallback } from "react";
import { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";
import FilterBar from "@/components/FilterBar";
import ChatPanel from "@/components/ChatPanel";
import CarDetailModal from "@/components/CarDetailModal";
import { getCarImage } from "@/lib/carImages";

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [shortlist, setShortlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("carMatchShortlist");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [searchMode, setSearchMode] = useState<"filter" | "ai">("filter");
  const [showShortlist, setShowShortlist] = useState(false);

  const fetchCars = useCallback(async (params: Record<string, string> = {}, searchText?: string) => {
    setLoading(true);
    setAiSummary("");
    setIsAiSearch(false);

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "budget") query.set(key, value);
    });
    if (searchText) {
      query.set("search", searchText);
    }

    try {
      const res = await fetch(`/api/cars?${query.toString()}`);
      const data = await res.json();
      setCars(data.cars);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiSearch = async (query: string) => {
    setLoading(true);
    setIsAiSearch(true);
    setAiSummary("");

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setCars(data.cars || []);
      setAiSummary(data.summary || "");
    } catch (err) {
      console.error("AI search failed:", err);
      setAiSummary("AI search failed. Falling back to regular search.");
      fetchCars(filters);
    } finally {
      setLoading(false);
    }
  };

  // Load all cars on mount (for chat context)
  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => setAllCars(data.cars));
  }, []);

  useEffect(() => {
    if (searchMode === "filter") {
      fetchCars(filters, search);
    }
  }, [filters, search, searchMode, fetchCars]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setAiSummary("");
    setIsAiSearch(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === "ai") {
      fetchAiSearch(search);
    } else {
      setIsAiSearch(false);
      fetchCars(filters, search);
    }
  };

  const toggleShortlist = (car: Car) => {
    setShortlist((prev) => {
      const updated = prev.includes(car.id)
        ? prev.filter((id) => id !== car.id)
        : [...prev, car.id];
      localStorage.setItem("carMatchShortlist", JSON.stringify(updated));
      return updated;
    });
  };

  const highlightCar = (carId: string) => {
    const car = allCars.find((c) => c.id === carId);
    if (car) setSelectedCar(car);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Header */}
      <header
        className="relative bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 sm:pt-8 sm:pb-32">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-12 sm:mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">CarMatch</h1>
            </div>

            <div className="flex items-center gap-3">
              {shortlist.length > 0 && (
                <button
                  onClick={() => setShowShortlist(true)}
                  className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm border border-white/20 hover:bg-white/25 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {shortlist.length} shortlisted
                </button>
              )}
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Ask AI
              </button>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              Find Your Perfect Car
            </h2>
            <p className="text-white/75 mb-10 text-base sm:text-lg">
              Ask in plain English or search by name — AI finds the best matches from {allCars.length}+ cars
            </p>

            {/* Search mode tabs */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-full p-0.5 flex border border-white/10">
                <button
                  type="button"
                  onClick={() => setSearchMode("filter")}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    searchMode === "filter"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("ai")}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    searchMode === "ai"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Search
                </button>
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl">
                <div className="ml-5 flex items-center">
                  {searchMode === "ai" ? (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    searchMode === "ai"
                      ? 'e.g. "best SUV under 15 lakhs for family"'
                      : "Search by car name, brand, or type..."
                  }
                  className="flex-1 px-5 py-5 text-gray-900 bg-transparent focus:outline-none text-base sm:text-lg"
                />
                <button
                  type="submit"
                  disabled={loading && isAiSearch}
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl mr-2 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading && isAiSearch ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Matching...
                    </>
                  ) : searchMode === "ai" ? (
                    "AI Match"
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Stats Trust Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-8 sm:gap-16 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{allCars.length}+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Cars Listed</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Top Brands</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-blue-600">AI</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Powered Match</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">EV Options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="mb-6">
          <FilterBar onFilterChange={handleFilterChange} activeFilters={filters} />
        </div>

        {/* AI Summary banner */}
        {aiSummary && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">AI Recommendation</p>
              <p className="text-sm text-blue-700 mt-0.5">{aiSummary}</p>
            </div>
            <button
              onClick={() => {
                setAiSummary("");
                setIsAiSearch(false);
                setSearch("");
                fetchCars({});
              }}
              className="text-blue-400 hover:text-blue-600 shrink-0 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {loading ? "Finding the best matches..." : `Showing ${cars.length} cars`}
            {isAiSearch && !loading && " (AI matched)"}
          </p>
        </div>

        {/* Car grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No cars found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setFilters({});
                setSearch("");
                setAiSummary("");
                setIsAiSearch(false);
              }}
              className="mt-4 text-blue-600 text-sm font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onSelect={setSelectedCar}
                isShortlisted={shortlist.includes(car.id)}
                onToggleShortlist={toggleShortlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* Browse by Category */}
      <section className="bg-white border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Find the right type of car for your needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { type: "Hatchback", desc: "City-friendly", carId: "maruti-swift" },
              { type: "Compact SUV", desc: "Best of both", carId: "tata-nexon" },
              { type: "Mid SUV", desc: "Family ready", carId: "hyundai-creta" },
              { type: "Sedan", desc: "Premium comfort", carId: "honda-city" },
              { type: "MPV", desc: "Space for all", carId: "toyota-innova-crysta" },
              { type: "Large SUV", desc: "Go anywhere", carId: "tata-safari" },
            ].map((cat) => {
              const count = allCars.filter((c) => c.body_type === cat.type).length;
              return (
                <button
                  key={cat.type}
                  onClick={() => {
                    handleFilterChange({ bodyType: cat.type });
                    setSearchMode("filter");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[3/4] sm:aspect-[2/3]"
                >
                  <img
                    src={getCarImage(cat.carId)}
                    alt={cat.type}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-5 text-center">
                    <h3 className="font-bold text-white text-sm sm:text-base drop-shadow-md">{cat.type}</h3>
                    <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">{cat.desc}</p>
                    <span className="mt-2 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full border border-white/20">
                      {count} {count === 1 ? "car" : "cars"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Picks */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Picks</h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Most searched cars by our users</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCars
              .filter((c) => ["hyundai-creta", "tata-nexon", "maruti-swift"].includes(c.id))
              .map((car, idx) => (
                <div
                  key={car.id}
                  onClick={() => setSelectedCar(car)}
                  className={`card-hover relative bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer animate-fade-in-up delay-${(idx + 1) * 100}`}
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={getCarImage(car.id)}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>
                        {car.safety_rating >= 4 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {car.safety_rating}★ Safe
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg">{car.name}</h3>
                      <p className="text-white/80 text-sm">{car.price_display}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {car.fuel.join(" / ")}
                      </span>
                      <span>{car.mileage_kmpl ? `${car.mileage_kmpl} kmpl` : `${car.range_km} km`}</span>
                      <span>{car.transmission.join(" / ")}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* EV Spotlight */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Electric Vehicles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Go Electric</h2>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Zero emissions. Maximum performance. The future is here.</p>
            </div>
            <button
              onClick={() => {
                handleFilterChange({ fuelType: "Electric" });
                setSearchMode("filter");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
            >
              View All EVs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {allCars
              .filter((c) => c.fuel.includes("Electric"))
              .map((car) => (
                <div
                  key={car.id}
                  onClick={() => setSelectedCar(car)}
                  className="card-hover bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getCarImage(car.id)}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="text-white font-bold">{car.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-green-400 font-bold">{car.price_display}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm text-gray-300">{car.range_km} km range</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-300">{car.safety_rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-12 sm:py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How CarMatch Works</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">From search to shortlist in three steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                num: "01",
                title: "Describe your needs",
                desc: "Type naturally — \"family SUV under 15 lakhs\" — or use filters for brand, fuel, budget, and more.",
              },
              {
                num: "02",
                title: "AI finds matches",
                desc: "Our AI cross-references specs, reviews, and pricing across 20+ cars to surface the best fits instantly.",
              },
              {
                num: "03",
                title: "Compare & decide",
                desc: "Explore detailed specs, variant pricing, user reviews, and pros & cons. Shortlist favorites to revisit anytime.",
              },
            ].map((item) => (
              <div key={item.num} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <span className="absolute -top-3 -right-1 text-7xl sm:text-8xl font-black text-gray-200 select-none leading-none">{item.num}</span>
                <div className="relative">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-700 mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">CarMatch</span>
            </div>
            <p className="text-sm text-center">AI-powered car discovery. Find, compare, and shortlist the best cars in India.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>Data is indicative. Verify with official dealers before purchase.</p>
            <p>Prices are ex-showroom and may vary by city.</p>
          </div>
        </div>
      </footer>

      {/* Chat FAB (mobile) */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors sm:hidden z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Shortlist Panel */}
      {showShortlist && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowShortlist(false)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">My Shortlist</h3>
                <p className="text-sm text-gray-500">{shortlist.length} car{shortlist.length !== 1 ? "s" : ""} saved</p>
              </div>
              <button
                onClick={() => setShowShortlist(false)}
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Car list */}
            <div className="flex-1 overflow-y-auto">
              {shortlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">No cars shortlisted yet</h4>
                  <p className="text-sm text-gray-500">Tap the heart icon on any car to save it here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {shortlist.map((carId) => {
                    const car = allCars.find((c) => c.id === carId);
                    if (!car) return null;
                    return (
                      <div
                        key={car.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedCar(car);
                          setShowShortlist(false);
                        }}
                      >
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={getCarImage(car.id)}
                            alt={car.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{car.name}</h4>
                          <p className="text-blue-600 font-bold text-xs">{car.price_display}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {car.fuel.join(" / ")} &middot; {car.mileage_kmpl ? `${car.mileage_kmpl} kmpl` : `${car.range_km} km`} &middot; {car.seating} Seater
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist(car);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full shrink-0 cursor-pointer"
                          title="Remove from shortlist"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {shortlist.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShortlist([]);
                    localStorage.removeItem("carMatchShortlist");
                  }}
                  className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear All Shortlisted Cars
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        cars={allCars}
        onHighlightCar={highlightCar}
      />

      {/* Car Detail Modal */}
      <CarDetailModal
        car={selectedCar}
        onClose={() => setSelectedCar(null)}
        isShortlisted={selectedCar ? shortlist.includes(selectedCar.id) : false}
        onToggleShortlist={toggleShortlist}
      />

      {/* Chat overlay backdrop */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:block"
          onClick={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
