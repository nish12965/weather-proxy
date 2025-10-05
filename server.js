import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Weather route
app.get("/weather", async (req, res) => {
  const city = req.query.q;
  const clientKey = req.header("x-app-key");

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  // Security check
  if (clientKey !== process.env.CLIENT_APP_KEY) {
    return res.status(403).json({ error: "Unauthorized request" });
  }

  try {
    const apiRes = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(city)}`
    );

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(errorText);
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error("API Fetch Error:", err.message);
    res.status(500).json({ error: "Server error while fetching weather data" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Weather Proxy API is running");
});

app.listen(PORT, () => console.log(`🌤️ Weather proxy running on port ${PORT}`));
