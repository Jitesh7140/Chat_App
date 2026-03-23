import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLayoutStore = create(
  persist(
    (set) => ({
      activeTab: "chats",
      SelectedContect: null,
      setSelectedContect: (contect) => set({ SelectedContect: contect }),
      setAavtiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "layout-storage",
      getStorage: () => localStorage,
    },
  ),
);

export default useLayoutStore;
