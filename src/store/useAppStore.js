import { create } from 'zustand'

/**
 * Zustand store mimicking AppSheet CurrentUser slice.
 * Holds temporary arrays of selected properties/products for quotes/contracts.
 */
export const useAppStore = create((set) => ({
  // Current user (from Supabase Auth session)
  user: null,
  userRole: null, // 'Admin' | 'Compras' | etc.

  // Selected properties for presupuesto creation (Cart system)
  selectedPropiedades: [],

  // Selected products for compras (if applicable)
  selectedProductos: [],

  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),

  addPropiedad: (propiedadId) =>
    set((state) => ({
      selectedPropiedades: state.selectedPropiedades.includes(propiedadId)
        ? state.selectedPropiedades
        : [...state.selectedPropiedades, propiedadId],
    })),

  removePropiedad: (propiedadId) =>
    set((state) => ({
      selectedPropiedades: state.selectedPropiedades.filter((id) => id !== propiedadId),
    })),

  togglePropiedad: (propiedadId) =>
    set((state) => ({
      selectedPropiedades: state.selectedPropiedades.includes(propiedadId)
        ? state.selectedPropiedades.filter((id) => id !== propiedadId)
        : [...state.selectedPropiedades, propiedadId],
    })),

  clearPropiedades: () => set({ selectedPropiedades: [] }),

  setSelectedPropiedades: (ids) => set({ selectedPropiedades: ids }),
}))

