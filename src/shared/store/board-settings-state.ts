import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  BoardDockToolId,
  BoardEraserMode,
  BoardStrokeToolConfig,
  BoardStrokeToolKey,
  BoardSurfaceStyle,
  NotebookWidthMode,
} from "@/shared/domain";

export const BOARD_SETTINGS_STORAGE_KEY = "eduvia-board-settings";
export const DEFAULT_LIGHT_BOARD_BG = "#ffffff";
export const DEFAULT_DARK_BOARD_BG = "#0b0c0e";

export const DEFAULT_BOARD_TOOL_CONFIGS: Record<
  BoardStrokeToolKey,
  BoardStrokeToolConfig
> = {
  pen: { colorIndex: 0, customColor: null, width: 3 },
  pencil: { colorIndex: 8, customColor: null, width: 2 },
  fountain: { colorIndex: 1, customColor: null, width: 4 },
  highlighter: { colorIndex: 2, customColor: null, width: 7 },
  shape: { colorIndex: 0, customColor: null, width: 3 },
};

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function mergeToolConfigs(
  incoming?: Partial<Record<BoardStrokeToolKey, Partial<BoardStrokeToolConfig>>>,
): Record<BoardStrokeToolKey, BoardStrokeToolConfig> {
  return {
    pen: {
      ...DEFAULT_BOARD_TOOL_CONFIGS.pen,
      ...incoming?.pen,
      width: clampNumber(
        incoming?.pen?.width ?? DEFAULT_BOARD_TOOL_CONFIGS.pen.width,
        1,
        10,
      ),
    },
    pencil: {
      ...DEFAULT_BOARD_TOOL_CONFIGS.pencil,
      ...incoming?.pencil,
      width: clampNumber(
        incoming?.pencil?.width ?? DEFAULT_BOARD_TOOL_CONFIGS.pencil.width,
        1,
        10,
      ),
    },
    fountain: {
      ...DEFAULT_BOARD_TOOL_CONFIGS.fountain,
      ...incoming?.fountain,
      width: clampNumber(
        incoming?.fountain?.width ?? DEFAULT_BOARD_TOOL_CONFIGS.fountain.width,
        1,
        10,
      ),
    },
    highlighter: {
      ...DEFAULT_BOARD_TOOL_CONFIGS.highlighter,
      ...incoming?.highlighter,
      width: clampNumber(
        incoming?.highlighter?.width ??
          DEFAULT_BOARD_TOOL_CONFIGS.highlighter.width,
        1,
        10,
      ),
    },
    shape: {
      ...DEFAULT_BOARD_TOOL_CONFIGS.shape,
      ...incoming?.shape,
      width: clampNumber(
        incoming?.shape?.width ?? DEFAULT_BOARD_TOOL_CONFIGS.shape.width,
        1,
        10,
      ),
    },
  };
}

export interface BoardSettingsValues {
  surfaceStyle: BoardSurfaceStyle;
  /** null means automatically follow the app light/dark theme */
  boardBgColor: string | null;
  notebookWidthMode: NotebookWidthMode;
  zoom: number;
  activeTool: BoardDockToolId;
  toolConfigs: Record<BoardStrokeToolKey, BoardStrokeToolConfig>;
  eraserMode: BoardEraserMode;
  eraserSize: number;
  shapeFilled: boolean;
  cardsCollapsed: boolean;
}

export const DEFAULT_BOARD_SETTINGS: BoardSettingsValues = {
  surfaceStyle: "blank",
  boardBgColor: null,
  notebookWidthMode: "centered",
  zoom: 1,
  activeTool: "pen",
  toolConfigs: DEFAULT_BOARD_TOOL_CONFIGS,
  eraserMode: "partial",
  eraserSize: 4,
  shapeFilled: false,
  cardsCollapsed: false,
};

export interface BoardSettingsStoreState extends BoardSettingsValues {
  setSurfaceStyle: (surfaceStyle: BoardSurfaceStyle) => void;
  setBoardBgColor: (boardBgColor: string | null) => void;
  setNotebookWidthMode: (notebookWidthMode: NotebookWidthMode) => void;
  setZoom: (updater: number | ((prev: number) => number)) => void;
  setActiveTool: (activeTool: BoardDockToolId) => void;
  updateToolConfig: (
    toolKey: BoardStrokeToolKey,
    updater:
      | Partial<BoardStrokeToolConfig>
      | ((prev: BoardStrokeToolConfig) => BoardStrokeToolConfig),
  ) => void;
  setEraserMode: (eraserMode: BoardEraserMode) => void;
  setEraserSize: (updater: number | ((prev: number) => number)) => void;
  setShapeFilled: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setCardsCollapsed: (updater: boolean | ((prev: boolean) => boolean)) => void;
  resetSettings: () => void;
}

export const boardSettingsStore = create<BoardSettingsStoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_BOARD_SETTINGS,

      setSurfaceStyle: (surfaceStyle) => set({ surfaceStyle }),

      setBoardBgColor: (boardBgColor) => set({ boardBgColor }),

      setNotebookWidthMode: (notebookWidthMode) => set({ notebookWidthMode }),

      setZoom: (updater) =>
        set((state) => {
          const raw =
            typeof updater === "function" ? updater(state.zoom) : updater;
          return {
            zoom: Number(clampNumber(raw, 0.5, 2.5).toFixed(2)),
          };
        }),

      setActiveTool: (activeTool) => set({ activeTool }),

      updateToolConfig: (toolKey, updater) =>
        set((state) => {
          const prev = state.toolConfigs[toolKey];
          const updated =
            typeof updater === "function"
              ? updater(prev)
              : { ...prev, ...updater };
          return {
            toolConfigs: {
              ...state.toolConfigs,
              [toolKey]: {
                ...updated,
                width: clampNumber(updated.width, 1, 10),
              },
            },
          };
        }),

      setEraserMode: (eraserMode) => set({ eraserMode }),

      setEraserSize: (updater) =>
        set((state) => {
          const raw =
            typeof updater === "function" ? updater(state.eraserSize) : updater;
          return { eraserSize: Math.round(clampNumber(raw, 1, 10)) };
        }),

      setShapeFilled: (updater) =>
        set((state) => ({
          shapeFilled:
            typeof updater === "function"
              ? updater(state.shapeFilled)
              : updater,
        })),

      setCardsCollapsed: (updater) =>
        set((state) => ({
          cardsCollapsed:
            typeof updater === "function"
              ? updater(state.cardsCollapsed)
              : updater,
        })),

      resetSettings: () => set({ ...DEFAULT_BOARD_SETTINGS }),
    }),
    {
      name: BOARD_SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): BoardSettingsValues => ({
        surfaceStyle: state.surfaceStyle,
        boardBgColor: state.boardBgColor,
        notebookWidthMode: state.notebookWidthMode,
        zoom: state.zoom,
        activeTool: state.activeTool,
        toolConfigs: state.toolConfigs,
        eraserMode: state.eraserMode,
        eraserSize: state.eraserSize,
        shapeFilled: state.shapeFilled,
        cardsCollapsed: state.cardsCollapsed,
      }),
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<BoardSettingsValues>;
        return {
          ...current,
          ...incoming,
          zoom: Number(
            clampNumber(incoming.zoom ?? current.zoom, 0.5, 2.5).toFixed(2),
          ),
          eraserSize: Math.round(
            clampNumber(incoming.eraserSize ?? current.eraserSize, 1, 10),
          ),
          toolConfigs: mergeToolConfigs(incoming.toolConfigs),
        };
      },
    },
  ),
);
