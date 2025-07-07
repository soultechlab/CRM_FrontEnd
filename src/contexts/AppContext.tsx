import React, { createContext, useContext, useState } from 'react';

interface AppContextData {
  userName: string;
  setUserName: (name: string) => void;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Administrador');

  return (
    <AppContext.Provider value={{ userName, setUserName }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}