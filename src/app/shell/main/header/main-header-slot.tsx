import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type MainHeaderSlotContextValue = {
  element: HTMLDivElement | null;
  setElement: Dispatch<SetStateAction<HTMLDivElement | null>>;
};

const MainHeaderSlotContext = createContext<MainHeaderSlotContextValue | null>(
  null,
);

export function MainHeaderSlotProvider({ children }: { children: ReactNode }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  return (
    <MainHeaderSlotContext.Provider value={{ element, setElement }}>
      {children}
    </MainHeaderSlotContext.Provider>
  );
}

export function useMainHeaderSlot() {
  const context = useContext(MainHeaderSlotContext);

  if (!context) {
    throw new Error(
      "useMainHeaderSlot must be used inside MainHeaderSlotProvider.",
    );
  }

  return context;
}
