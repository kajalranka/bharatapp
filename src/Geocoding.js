import axios from 'axios'

const getGeocode = async (address) => {
  try {
    const response = await axios.get("https://api.olamaps.io/places/v1/geocode", {
      params: { address, language: "en", api_key: "mDIY4H8lcrmBxVD9evbW3AMhBg3twGlCHds9vANS" },
    });

    console.log("🔍 Geocode API Full Response:", response.data);

    if (response.data.status === "ok" && response.data.geocodingResults.length > 0) {
      const firstResult = response.data.geocodingResults[0];

      console.log("✅ Extracted First Geocoding Result:", firstResult);

      // Extract coordinates properly from the `geometry` object
      const latitude = firstResult.geometry?.location?.lat;
      const longitude = firstResult.geometry?.location?.lng;

      console.log("📌 Extracted Latitude:", latitude);
      console.log("📌 Extracted Longitude:", longitude);

      // Ensure valid coordinates before returning
      if (latitude !== undefined && longitude !== undefined) {
        return { lat: latitude, lng: longitude };
      } else {
        console.error("❌ Latitude or Longitude is missing in API response.");
        return null;
      }
    } else {
      console.error("❌ No valid geocode results found.");
      return null;
    }
  } catch (error) {
    console.error("❌ Geocoding API Error:", error);
    return null;
  }
};


export default getGeocode;
