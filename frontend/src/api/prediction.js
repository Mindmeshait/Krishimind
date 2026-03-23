import axios from "axios";

// Backend base URL (local or deployed)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch price prediction from backend
 * @param {string} crop
 * @param {string} mandi
 * @param {number} days
 * @returns {object|null}
 */
export const fetchPrediction = async (crop, mandi, days) => {
  try {
    const payload = {
      crop,
      market: mandi,
      state: "Maharashtra",
      district: "Nashik",
      days_ahead: days,
      include_weather: true,
      include_sentiment: true,
    };

    const res = await axios.post(`${API_URL}/predict`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // prevents hanging
    });

    return res.data;

  } catch (err) {
    console.error("❌ Prediction API Error:", err?.response?.data || err.message);
    return null;
  }
};