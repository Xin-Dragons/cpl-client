import { createContext, useContext, useState } from "react";

const TimeframeContext = createContext(null);

export const TimeframeProvider: FC = ({ children }) => {
  const [days, setDays] = useState(0);

  return <TimeframeContext.Provider value={{ days, setDays }}>
    { children }
  </TimeframeContext.Provider>
}

export const useTimeframe = () => {
  return useContext(TimeframeContext);
}