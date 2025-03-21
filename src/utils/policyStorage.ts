import { SavedPolicy } from "../types/fare";

interface ApiResponse {
  policies: SavedPolicy[];
}

const API_URL = "http://localhost:3002/api";

export const loadPolicies = async (): Promise<SavedPolicy[]> => {
  try {
    console.log(
      "Making API call to load policies from:",
      `${API_URL}/policies`
    );
    const response = await fetch(`${API_URL}/policies`);
    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to load policies:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw policies data from API:", data);

    // Handle both array and object with policies property
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object" && "policies" in data) {
      return (data as ApiResponse).policies;
    }

    console.error("Invalid response format:", data);
    return [];
  } catch (error) {
    console.error("Error loading policies:", error);
    throw error;
  }
};

export const savePolicies = async (policies: SavedPolicy[]): Promise<void> => {
  try {
    console.log("Saving policies to API:", policies);
    const response = await fetch(`${API_URL}/policies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ policies }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to save policies:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Policies saved successfully");
  } catch (error) {
    console.error("Error saving policies:", error);
    throw error;
  }
};
