import { create } from "zustand";
import { useUserStorepersist } from "zustand/middleware";

const  = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (userData) => {
        set({ user:userData , isAuthenticated:true});
      }, 
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "user-storage",
        getStorege:()=>localStorage
    },
  ),
);

export default useUserStore;
