import { createContext, useContext, useState } from "react";

const FarmContext = createContext();

export function FarmProvider({ children }) {
  const [farmer, setFarmer] = useState({
    name: "",
    location: "",
    experience: "",
    crop: "",
    landSize: "",
    soilType: "",
  });

  const updateFarmer = (data) => {
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