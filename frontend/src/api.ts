import axios from "axios";

const API_URL = "http://localhost:5050/trends";

export const fetchTrends = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching trends:", error);
    return [];
  }
};
