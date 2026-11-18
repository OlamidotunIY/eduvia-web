import { createContext, useContext } from "react";
import {
  boardSettingsStore,
  DEFAULT_DARK_BOARD_BG,
  DEFAULT_LIGHT_BOARD_BG,
  type BoardSettingsStoreState,
} from "@/shared/store";

export interface BoardSettingsContextValue extends BoardSettingsStoreState {
  effectiveBoardBgColor: string;
  hasCustomBoardBg: boolean;
}

export const BoardSettingsContext =
  createContext<BoardSettingsContextValue | null>(null);

export function isDocumentDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useBoardSettings(): BoardSettingsContextValue {
  const ctx = useContext(BoardSettingsContext);
  const store = boardSettingsStore();
  if (ctx) return ctx;

  // Fallback if rendered in an isolated tree outside BoardSettingsProvider
  const effectiveBoardBgColor =
    store.boardBgColor ??
    (isDocumentDark() ? DEFAULT_DARK_BOARD_BG : DEFAULT_LIGHT_BOARD_BG);
  return {
    ...store,
    effectiveBoardBgColor,
    hasCustomBoardBg: store.boardBgColor !== null,
  };
}
