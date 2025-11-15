import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  name: string;
  setName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState('');

  // Persist name in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('yourName');
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    if (name) localStorage.setItem('yourName', name);
  }, [name]);

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

