import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({
            user: data.user,
            token: data.user.token,
            isAuthenticated: true,
            loading: false,
          });
          return data;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Login failed",
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", userData);
          set({ loading: false });
          return data;
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || "Registration failed",
          });
          throw error;
        }
      },

      setUser: (user) => set({ user }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "carehub-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for tab isolation
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
