const REGIONS = ["West", "East", "North", "South"];
const PRODUCTS = ["Lamp", "Desk", "Chair", "Shelf"];

/** A repeatable number in [0, 1) for each seed. */
function random(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** 200 sales, as a host app would load them from its own API. */
export const sales = Array.from({ length: 200 }, (_, i) => {
  const price = Math.round((8 + random(i) * 40) * 100) / 100;
  const day = 1 + Math.floor(random(i + 500) * 180);
  return {
    Region: REGIONS[Math.floor(random(i + 100) * 4)]!,
    Product: PRODUCTS[Math.floor(random(i + 200) * 4)]!,
    Price: price,
    Rating: Math.round((2.2 + price / 25 + random(i + 300) * 1.5) * 10) / 10,
    Units: 1 + Math.floor(random(i + 400) * 9),
    Date: new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10),
  };
});
