// context/FavoritesContext.tsx
import React from "react";
import { events } from "../data/events";

type Event = (typeof events)[number];

type FavoritesContextValue = {
  saved: Event[];
  toggleSave: (event: Event) => void;
};

export const FavoritesContext = React.createContext<FavoritesContextValue>({
  saved: [],
  toggleSave: () => {},
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [saved, setSaved] = React.useState<Event[]>([]);

  const toggleSave = (event: Event) => {
    setSaved((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) {
        return prev.filter((e) => e.id !== event.id);
      }
      return [...prev, event];
    });
  };

  return (
    <FavoritesContext.Provider value={{ saved, toggleSave }}>
      {children}
    </FavoritesContext.Provider>
  );
};
