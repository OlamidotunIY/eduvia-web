import { create } from "zustand";
import type { SettingsSectionId } from "../domain/settings.types";

interface SettingsDialogState {
  isOpen: boolean;
  activeSection: SettingsSectionId;
  openSettings: (section?: SettingsSectionId) => void;
  closeSettings: () => void;
  setActiveSection: (section: SettingsSectionId) => void;
}

export const useSettingsDialog = create<SettingsDialogState>((set) => ({
  isOpen: false,
  activeSection: "profile",
  openSettings: (section) =>
    set((state) => ({
      isOpen: true,
      activeSection: section ?? state.activeSection ?? "profile",
    })),
  closeSettings: () => set({ isOpen: false }),
  setActiveSection: (section) => set({ activeSection: section }),
}));
