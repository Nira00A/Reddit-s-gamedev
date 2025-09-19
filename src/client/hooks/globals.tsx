import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the shape of the context's value
type GlobalContextType = {
  exportedImg: string;
  setExportedImg: Dispatch<SetStateAction<string>>;
}

// Create the context with a default value of null and apply the type
const GlobalContext = createContext<GlobalContextType | null>(null);

// Define the type for the provider's props
interface GlobalProviderProps {
  children: ReactNode;
}

export default function GlobalProvider({ children }: GlobalProviderProps) {
  // Explicitly type the state
  const [exportedImg, setExportedImg] = useState<string>('');

  useEffect(() => {
    console.log(exportedImg);
  }, [exportedImg]);

  return (
    <GlobalContext.Provider value={{ exportedImg, setExportedImg }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to consume the context
export const useGlobal = () => {
  const context = useContext(GlobalContext);

  // This check ensures the hook is used within a GlobalProvider
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  
  return context;
};