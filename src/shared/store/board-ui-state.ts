import { create } from "zustand";

interface BoardUiState {
  isBoardFullscreen: boolean;
  setBoardFullscreen: (active: boolean) => void;
}

export const boardUiStore = create<BoardUiState>((set) => ({
  isBoardFullscreen: false,
  setBoardFullscreen: (isBoardFullscreen) => set({ isBoardFullscreen }),
}));
