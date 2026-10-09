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
        telegramChatId: parsed.telegramChatId || localStorage.getItem("agrin_telegram_chat_id") || "",
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
        telegramChatId: localStorage.getItem("agrin_telegram_chat_id") || "",
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
      if (farmer.telegramChatId) localStorage.setItem("agrin_telegram_chat_id", farmer.telegramChatId);
    } catch (e) {
      console.warn("Could not save farm context:", e);
    }
  }, [farmer]);

  const updateFarmer = (data) => {
    if (data?.phone) localStorage.setItem("agrin_farmer_phone", data.phone);
    if (data?.telegramChatId) localStorage.setItem("agrin_telegram_chat_id", data.telegramChatId);
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