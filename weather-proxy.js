// weather-proxy.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

// Load API key securely
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
if (!WEATHER_API_KEY) {
  console.error("WEATHER_API_KEY is missing in environment!");
  process.exit(1);
}

// Helper function to fetch JSON from WeatherAPI
async function fetchWeatherAPI(endpoint) {
  try {
    const response = await fetch(endpoint, { timeout: 8000 });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`WeatherAPI responded with ${response.status}: ${text}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("WeatherAPI Fetch Error:", err.message);
    throw err;
  }
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🌦️ OpenWx Weather Proxy is running",
    endpoints: ["/weather?q=City", "/forecast?q=City", "/forecast7?q=City"],
  });
});

// --- Current Weather Endpoint ---
app.get("/weather", async (req, res) => {
  const query = req.query.q || "auto:ip";
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
    query
  )}&aqi=no`;

  try {
    const data = await fetchWeatherAPI(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch current weather" });
  }
});

// --- Forecast Endpoint (3 or custom days) ---
app.get("/forecast", async (req, res) => {
  const query = req.query.q || "auto:ip";
  const days = req.query.days || 3; // Default 3-day
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
    query
  )}&days=${days}&aqi=no&alerts=no`;

  try {
    const data = await fetchWeatherAPI(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch forecast" });
  }
});

// 7-Day Forecast Endpoint 
app.get("/forecast7Days", async (req, res) => {
  const query = req.query.q || "auto:ip";
  const days=req.query.days || 7;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
    query
  )}&days=${days}&aqi=no&alerts=no`;

  try {
    const data = await fetchWeatherAPI(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch 7-day forecast" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`OpenWx Proxy running on port ${PORT}`);
});
