import { create } from "zustand";

interface AlertOptions {
  /** The confirm button's text. Name the action, such as "Delete". */
  confirmLabel?: string;
  /** Styles the confirm button as a destructive action. */
  destructive?: boolean;
}

type AlertStore = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
  resolve: ((value: boolean) => void) | null;
  id: number;
  showAlert: (
    title: string,
    description: string,
    options?: AlertOptions
  ) => Promise<boolean>;
  closeAlert: (result: boolean) => void;
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  isOpen: false,
  title: "",
  description: "",
  confirmLabel: "Continue",
  destructive: false,
  resolve: null,
  id: 0,

  showAlert: async (title, description, options) => {
    return new Promise<boolean>((resolve) => {
      const { id } = get();
      set({
        isOpen: true,
        title,
        description,
        confirmLabel: options?.confirmLabel ?? "Continue",
        destructive: options?.destructive ?? false,
        resolve,
        id: id + 1,
      });
    });
  },

  closeAlert: (result: boolean) => {
    const { resolve } = get();
    if (resolve) {
      resolve(result);
    }
    set({
      isOpen: false,
      title: "",
      description: "",
      resolve: null,
    });
  },
}));
