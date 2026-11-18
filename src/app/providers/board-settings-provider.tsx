import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BOARD_SETTINGS_STORAGE_KEY,
  boardSettingsStore,
  DEFAULT_DARK_BOARD_BG,
  DEFAULT_LIGHT_BOARD_BG,
} from "@/shared/store";
import {
  BoardSettingsContext,
  isDocumentDark,
  type BoardSettingsContextValue,
} from "./board-settings-context";

export function BoardSettingsProvider({ children }: { children: ReactNode }) {
  const settings = boardSettingsStore();
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(isDocumentDark);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(isDocumentDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === BOARD_SETTINGS_STORAGE_KEY) {
        void boardSettingsStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const effectiveBoardBgColor =
    settings.boardBgColor ??
    (isDarkTheme ? DEFAULT_DARK_BOARD_BG : DEFAULT_LIGHT_BOARD_BG);

  const value = useMemo<BoardSettingsContextValue>(
    () => ({
      ...settings,
      effectiveBoardBgColor,
      hasCustomBoardBg: settings.boardBgColor !== null,
    }),
    [effectiveBoardBgColor, settings],
  );

  return (
    <BoardSettingsContext.Provider value={value}>
      {children}
    </BoardSettingsContext.Provider>
  );
}
