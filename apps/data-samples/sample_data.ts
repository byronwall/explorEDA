import { Command } from "commander";
import { createObjectCsvWriter } from "csv-writer";
import { mkdirSync, existsSync } from "fs";
import path from "path";

// Data generation utilities
const generateRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const generateTimestamp = (startDate: Date, endDate: Date) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

// Data generators for different types
const generators = {
  basic_numbers: (rows: number) => {
    const headers = [
      { id: "id", title: "ID" },
      { id: "value", title: "Value" },
      { id: "squared", title: "Squared" },
      { id: "cubed", title: "Cubed" },
      { id: "sqrt", title: "Square Root" },
      { id: "log", title: "Natural Log" },
      { id: "sin", title: "Sine" },
      { id: "cos", title: "Cosine" },
      { id: "even", title: "Is Even" },
    ];

    const data = Array.from({ length: rows }, (_, i) => {
      const baseValue = i + 1;
      return {
        id: baseValue,
        value: generateRandomInt(1, 100),
        squared: Math.pow(baseValue, 2),
        cubed: Math.pow(baseValue, 3),
        sqrt: Math.sqrt(baseValue).toFixed(3),
        log: Math.log(baseValue).toFixed(3),
        sin: Math.sin(baseValue).toFixed(3),
        cos: Math.cos(baseValue).toFixed(3),
        even: baseValue % 2 === 0 ? "true" : "false",
      };
    });

    return { headers, data };
  },

  time_series: (rows: number) => {
    const headers = [
      { id: "timestamp", title: "Timestamp" },
      { id: "value", title: "Value" },
      { id: "trend", title: "Trend" },
      { id: "day_of_week", title: "Day of Week" },
      { id: "is_weekend", title: "Is Weekend" },
      { id: "is_holiday", title: "Is Holiday" },
      { id: "season", title: "Season" },
      { id: "quarter", title: "Quarter" },
      { id: "month", title: "Month" },
      { id: "week_number", title: "Week Number" },
      { id: "hour_of_day", title: "Hour of Day" },
      { id: "peak_hours", title: "Peak Hours" },
    ];

    const seasons = ["Winter", "Spring", "Summer", "Fall"];
    const holidays = [
      "2023-01-01",
      "2023-12-25",
      "2023-07-04",
      "2023-11-24",
      "2023-05-29",
      "2023-09-04",
      "2023-02-14",
      "2023-10-31",
    ];

    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");

    const data = Array.from({ length: rows }, () => {
      const timestamp = generateTimestamp(startDate, endDate);
      const hour = timestamp.getHours();
      const month = timestamp.getMonth();
      const dayOfWeek = timestamp.getDay();
      const dateStr = timestamp.toISOString().split("T")[0];

      return {
        timestamp: timestamp.toISOString(),
        value: generateRandomFloat(0, 1000).toFixed(2),
        trend: generateRandomFloat(-1, 1).toFixed(3),
        day_of_week: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][dayOfWeek],
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6 ? "true" : "false",
        is_holiday: holidays.includes(dateStr) ? "true" : "false",
        season: seasons[Math.floor(month / 3)],
        quarter: Math.floor(month / 3) + 1,
        month: timestamp.toLocaleString("default", { month: "long" }),
        week_number: Math.ceil(timestamp.getDate() / 7),
        hour_of_day: hour,
        peak_hours: hour >= 9 && hour <= 17 ? "true" : "false",
      };
    });

    return { headers, data };
  },

  geospatial: (rows: number) => {
    const headers = [
      { id: "id", title: "ID" },
      { id: "latitude", title: "Latitude" },
      { id: "longitude", title: "Longitude" },
      { id: "elevation", title: "Elevation" },
      { id: "distance_from_equator", title: "Distance from Equator (km)" },
      { id: "hemisphere", title: "Hemisphere" },
      { id: "terrain_type", title: "Terrain Type" },
      { id: "population_density", title: "Population Density" },
      { id: "climate_zone", title: "Climate Zone" },
      { id: "water_proximity", title: "Water Proximity (km)" },
      { id: "urban_rural", title: "Urban/Rural" },
      { id: "risk_zone", title: "Natural Risk Zone" },
    ];

    const terrainTypes = [
      "Mountain",
      "Desert",
      "Forest",
      "Plains",
      "Coastal",
      "Wetland",
    ];
    const climateZones = [
      "Tropical",
      "Temperate",
      "Continental",
      "Polar",
      "Mediterranean",
      "Arid",
    ];
    const riskZones = ["Low", "Medium", "High", "Extreme"];

    const data = Array.from({ length: rows }, (_, i) => {
      const lat = generateRandomFloat(-90, 90);
      const long = generateRandomFloat(-180, 180);

      return {
        id: i + 1,
        latitude: lat.toFixed(6),
        longitude: long.toFixed(6),
        elevation: generateRandomInt(0, 8848),
        distance_from_equator: Math.abs(lat * 111).toFixed(2),
        hemisphere: lat >= 0 ? "Northern" : "Southern",
        terrain_type:
          terrainTypes[generateRandomInt(0, terrainTypes.length - 1)],
        population_density: generateRandomInt(0, 1000),
        climate_zone:
          climateZones[generateRandomInt(0, climateZones.length - 1)],
        water_proximity: generateRandomInt(0, 1000),
        urban_rural: generateRandomFloat(0, 1) > 0.7 ? "Urban" : "Rural",
        risk_zone: riskZones[generateRandomInt(0, riskZones.length - 1)],
      };
    });

    return { headers, data };
  },

  categorical: (rows: number) => {
    const headers = [
      { id: "id", title: "ID" },
      { id: "category", title: "Category" },
      { id: "subcategory", title: "Subcategory" },
      { id: "size", title: "Size" },
      { id: "color", title: "Color" },
      { id: "material", title: "Material" },
      { id: "brand", title: "Brand" },
      { id: "price_range", title: "Price Range" },
      { id: "rating", title: "Rating" },
      { id: "in_stock", title: "In Stock" },
      { id: "shipping_weight", title: "Shipping Weight" },
      { id: "age_group", title: "Age Group" },
    ];

    const categories = ["Electronics", "Clothing", "Food", "Home", "Sports"];
    const subcategories = {
      Electronics: ["Phones", "Laptops", "Tablets", "Accessories"],
      Clothing: ["Shirts", "Pants", "Dresses", "Shoes"],
      Food: ["Snacks", "Beverages", "Frozen", "Fresh"],
      Home: ["Furniture", "Decor", "Kitchen", "Bath"],
      Sports: ["Equipment", "Apparel", "Accessories", "Nutrition"],
    };
    const colors = [
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Purple",
      "Black",
      "White",
    ];
    const materials = [
      "Plastic",
      "Metal",
      "Cotton",
      "Leather",
      "Glass",
      "Wood",
    ];
    const brands = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
    const priceRanges = ["Budget", "Mid-range", "Premium", "Luxury"];
    const ageGroups = ["Children", "Teens", "Adults", "Seniors"];

    const data = Array.from({ length: rows }, (_, i) => {
      const category = categories[generateRandomInt(0, categories.length - 1)];
      const subcategoryList =
        subcategories[category as keyof typeof subcategories];

      return {
        id: i + 1,
        category,
        subcategory:
          subcategoryList[generateRandomInt(0, subcategoryList.length - 1)],
        size: ["Small", "Medium", "Large"][generateRandomInt(0, 2)],
        color: colors[generateRandomInt(0, colors.length - 1)],
        material: materials[generateRandomInt(0, materials.length - 1)],
        brand: brands[generateRandomInt(0, brands.length - 1)],
        price_range: priceRanges[generateRandomInt(0, priceRanges.length - 1)],
        rating: generateRandomInt(1, 5),
        in_stock: generateRandomFloat(0, 1) > 0.3 ? "true" : "false",
        shipping_weight: generateRandomFloat(0.1, 20).toFixed(2),
        age_group: ageGroups[generateRandomInt(0, ageGroups.length - 1)],
      };
    });

    return { headers, data };
  },

  correlated: (rows: number) => {
    const headers = [
      { id: "temperature", title: "Temperature (°C)" },
      { id: "humidity", title: "Humidity (%)" },
      { id: "ice_cream_sales", title: "Ice Cream Sales" },
      { id: "beach_visitors", title: "Beach Visitors" },
      { id: "energy_consumption", title: "Energy Consumption (kWh)" },
      { id: "air_quality", title: "Air Quality Index" },
      { id: "outdoor_activities", title: "Outdoor Activities" },
      { id: "water_consumption", title: "Water Consumption (L)" },
      { id: "sunscreen_sales", title: "Sunscreen Sales" },
      { id: "restaurant_visitors", title: "Restaurant Visitors" },
      { id: "mood_index", title: "Mood Index" },
      { id: "productivity_score", title: "Productivity Score" },
    ];

    const data = Array.from({ length: rows }, () => {
      const temperature = generateRandomFloat(0, 40);
      const humidity = generateRandomFloat(30, 90);
      const baseActivity = temperature * (1 - humidity / 200);

      return {
        temperature: temperature.toFixed(1),
        humidity: humidity.toFixed(1),
        ice_cream_sales: Math.max(
          0,
          Math.round(temperature * 10 + generateRandomFloat(-50, 50))
        ),
        beach_visitors: Math.max(
          0,
          Math.round(temperature * 25 + generateRandomFloat(-100, 100))
        ),
        energy_consumption: Math.round(
          temperature * 15 + humidity * 5 + generateRandomFloat(-100, 100)
        ),
        air_quality: Math.min(
          150,
          Math.max(
            0,
            Math.round(
              100 -
                temperature * 1.5 -
                humidity * 0.5 +
                generateRandomFloat(-20, 20)
            )
          )
        ),
        outdoor_activities: Math.max(
          0,
          Math.round(baseActivity * 10 + generateRandomFloat(-20, 20))
        ),
        water_consumption: Math.round(
          temperature * 20 + humidity * 10 + generateRandomFloat(-200, 200)
        ),
        sunscreen_sales: Math.max(
          0,
          Math.round(temperature * 8 + generateRandomFloat(-30, 30))
        ),
        restaurant_visitors: Math.max(
          0,
          Math.round(baseActivity * 15 + generateRandomFloat(-50, 50))
        ),
        mood_index: Math.min(
          10,
          Math.max(1, Math.round(baseActivity + generateRandomFloat(-2, 2)))
        ),
        productivity_score: Math.min(
          100,
          Math.max(
            0,
            Math.round(
              80 -
                temperature * 0.5 -
                humidity * 0.3 +
                generateRandomFloat(-10, 10)
            )
          )
        ),
      };
    });

    return { headers, data };
  },

  shop_operations: (rows: number) => {
    const headers = [
      { id: "order", title: "Order" },
      { id: "order_date", title: "Order Date" },
      { id: "region", title: "Region" },
      { id: "channel", title: "Channel" },
      { id: "category", title: "Category" },
      { id: "product", title: "Product" },
      { id: "customer_segment", title: "Customer Segment" },
      { id: "units", title: "Units" },
      { id: "unit_price", title: "Unit Price" },
      { id: "discount", title: "Discount" },
      { id: "revenue", title: "Revenue" },
      { id: "cost", title: "Cost" },
      { id: "margin", title: "Margin" },
      { id: "fulfilled", title: "Fulfilled" },
      { id: "returned", title: "Returned" },
      { id: "delivery_days", title: "Delivery Days" },
    ];
    const random = createSeededRandom(0x5eeded);
    const regions = ["North", "South", "East", "West"];
    const channels = ["Web", "Store", "Wholesale"];
    const products = [
      { category: "Home", name: "Desk Lamp", price: 32, cost: 0.52 },
      { category: "Home", name: "Storage Bin", price: 18, cost: 0.47 },
      { category: "Outdoors", name: "Trail Bottle", price: 24, cost: 0.44 },
      { category: "Outdoors", name: "Camp Chair", price: 74, cost: 0.58 },
      { category: "Kitchen", name: "Chef Pan", price: 46, cost: 0.55 },
      { category: "Electronics", name: "USB Hub", price: 28, cost: 0.63 },
    ];
    const segments = ["Consumer", "Small Business", "Enterprise"];
    const data = Array.from({ length: rows }, (_, index) => {
      const date = new Date(Date.UTC(2024, 0, 1 + (index % 366)));
      const product = products[index % products.length];
      const returned = index % 37 === 0 || random() < 0.025;
      const outlier = index === 111 || index === 333;
      const seasonalMultiplier = [
        0.75, 0.8, 0.9, 1, 1.1, 1.15, 1.25, 1.2, 1.05, 0.95, 0.85, 0.8,
      ][date.getUTCMonth()];
      const units = outlier
        ? 180 + index - 111
        : Math.max(
            1,
            Math.round(
              (1 + Math.floor(random() ** 2 * 28)) * seasonalMultiplier
            )
          );
      const unitPrice = product.price * (0.94 + random() * 0.12);
      const discountValue = [0, 0.05, 0.1, 0.2][index % 4];
      const discount = index % 79 === 0 ? null : discountValue;
      const effectiveDiscount = discount ?? 0;
      const revenue = units * unitPrice * (1 - effectiveDiscount);
      const cost = revenue * product.cost;
      const deliveryDays =
        index % 61 === 0 ? null : 1 + Math.floor(random() * (returned ? 9 : 6));

      return {
        order: index + 1,
        order_date: date.toISOString().slice(0, 10),
        region: regions[index % regions.length],
        channel: channels[index % channels.length],
        category: product.category,
        product: product.name,
        customer_segment: segments[index % segments.length],
        units,
        unit_price: unitPrice.toFixed(2),
        discount: discount === null ? null : discount.toFixed(2),
        revenue: revenue.toFixed(2),
        cost: cost.toFixed(2),
        margin: (revenue - cost).toFixed(2),
        fulfilled: returned || random() > 0.08 ? "true" : "false",
        returned: returned ? "true" : "false",
        delivery_days: deliveryDays,
      };
    });

    return { headers, data };
  },

  lorenz_3d: (rows: number) => {
    const headers = [
      { id: "run_id", title: "Run ID" },
      { id: "time", title: "Time" },
      { id: "x", title: "X" },
      { id: "y", title: "Y" },
      { id: "z", title: "Z" },
    ];

    // Lorenz system parameters
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.01; // Time step for integration

    // Function to compute one step of Lorenz system
    const lorenzStep = (x: number, y: number, z: number) => {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;
      return { dx, dy, dz };
    };

    // Generate 5 runs with slightly different initial conditions
    const data: any[] = [];
    const runsPerPoint = Math.ceil(rows / 5); // Divide points among 5 runs

    for (let run = 0; run < 5; run++) {
      // Slightly different starting positions for each run
      let x = 1 + Math.random() * 0.4;
      let y = 1 + Math.random() * 0.4;
      let z = 1 + Math.random() * 0.4;

      for (let i = 0; i < runsPerPoint; i++) {
        const time = i * dt;

        // Record current position
        data.push({
          run_id: run + 1,
          time: time.toFixed(3),
          x: x.toFixed(3),
          y: y.toFixed(3),
          z: z.toFixed(3),
        });

        // Compute next position
        const { dx, dy, dz } = lorenzStep(x, y, z);
        x += dx;
        y += dy;
        z += dz;
      }
    }

    return { headers, data };
  },
};

// Size presets
const sizePresets = {
  tiny: 100,
  small: 1000,
  medium: 10000,
  large: 100000,
  huge: 1000000,
  fixture: 500,
};

const program = new Command();

program
  .name("sample-data-generator")
  .description("Generate sample CSV data files with various types and sizes")
  .option("-t, --type <type>", "Data type to generate", "basic_numbers")
  .option(
    "-s, --size <size>",
    "Size preset (tiny, small, medium, large, huge, fixture)",
    "small"
  )
  .option("-o, --output <dir>", "Output directory", "output");

program.parse(process.argv);
const options = program.opts();

// Ensure output directory exists
if (!existsSync(options.output)) {
  mkdirSync(options.output, { recursive: true });
}

async function generateFile() {
  const dataType = options.type;
  const size = sizePresets[options.size as keyof typeof sizePresets];

  if (!generators[dataType as keyof typeof generators]) {
    console.error(`Invalid data type: ${dataType}`);
    console.log("Available types:", Object.keys(generators).join(", "));
    process.exit(1);
  }

  const { headers, data } =
    generators[dataType as keyof typeof generators](size);

  const outputFile = path.join(
    options.output,
    dataType === "shop_operations"
      ? "shop-operations.csv"
      : `${dataType}_${options.size}.csv`
  );

  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: headers,
  });

  console.log(`Generating ${size} rows of ${dataType} data...`);
  await csvWriter.writeRecords(data);
  console.log(`File generated: ${outputFile}`);
}

generateFile().catch(console.error);
