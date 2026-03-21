import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const fetchPrediction = async (crop, mandi, days) => {
  try {
    const res = await axios.post(`${API_URL}/predict`, {
      crop: crop,
      market: mandi,
      state: "Maharashtra",
      district: "Nashik",
      days_ahead: days,
      include_weather: true,
      include_sentiment: true
    });

    return res.data;

  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
};