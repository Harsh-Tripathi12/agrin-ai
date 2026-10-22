import { createContext, useContext, useState, useEffect } from "react";

const FarmContext = createContext();

const STORAGE_KEY = "agrin_farm_context_data";

export function FarmProvider({ children }) {
  const [farmer, setFarmer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        name: parsed.name || "",
        phone: parsed.phone || localStorage.getItem("agrin_farmer_phone") || "",
        location: parsed.location || "",
        experience: parsed.experience || "",
        crop: parsed.crop || "",
        landSize: parsed.landSize || "",
        soilType: parsed.soilType || "",
      };
    } catch {
      return {
        name: "",
        phone: localStorage.getItem("agrin_farmer_phone") || "",
        location: "",
        experience: "",
        crop: "",
        landSize: "",
        soilType: "",
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farmer));
      if (farmer.phone) localStorage.setItem("agrin_farmer_phone", farmer.phone);
    } catch (e) {
      console.warn("Could not save farm context:", e);
    }
  }, [farmer]);

  const updateFarmer = (data) => {
    if (data?.phone) localStorage.setItem("agrin_farmer_phone", data.phone);
    setFarmer((previous) => ({
      ...previous,
      ...data,
    }));
  };

  return (
    <FarmContext.Provider
      value={{
        farmer,
        updateFarmer,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}