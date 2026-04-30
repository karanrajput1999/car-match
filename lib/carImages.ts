const CAR_IMAGE_MAP: Record<string, string> = {
  "maruti-swift": "/cars/maruti-suzuki-swift.avif",
  "hyundai-i20": "/cars/hyundai-i20.avif",
  "tata-tiago": "/cars/tata-tiago.avif",
  "maruti-alto-k10": "/cars/maruti-suzuki-alto-k10.avif",
  "renault-kwid": "/cars/renault-kwid.avif",
  "tata-nexon": "/cars/tata-nexon.avif",
  "hyundai-venue": "/cars/hyundai-venue.webp",
  "maruti-brezza": "/cars/maruti-suzuki-brezza.avif",
  "kia-sonet": "/cars/kia-sonet.avif",
  "hyundai-creta": "/cars/hyundai-creta.avif",
  "kia-seltos": "/cars/kia-seltos.avif",
  "tata-harrier": "/cars/tata-harrier.avif",
  "honda-city": "/cars/honda city.jpg",
  "hyundai-verna": "/cars/hyundai-verna.avif",
  "maruti-ertiga": "/cars/maruti-suzuki-ertiga.avif",
  "toyota-innova-crysta": "/cars/toyota-innova-crysta.avif",
  "tata-safari": "/cars/tata-safari.avif",
  "tata-nexon-ev": "/cars/tata-nexon ev.webp",
  "mg-zs-ev": "/cars/mg-zs-ev.avif",
  "hyundai-creta-ev": "/cars/hyundai-creta-electric.avif",
};

export function getCarImage(carId: string): string {
  return CAR_IMAGE_MAP[carId] || "/cars/placeholder.jpg";
}
