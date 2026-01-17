import React, { createContext, useContext, useRef, useState } from 'react';

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setNavigationBlocker: (blocker: (() => Promise<boolean>) | null) => void;
  checkNavigationAllowed: () => Promise<boolean>;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigationBlockerRef = useRef<(() => Promise<boolean>) | null>(null);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(prev => !prev);

  const setNavigationBlocker = (blocker: (() => Promise<boolean>) | null) => {
    navigationBlockerRef.current = blocker;
  };

  const checkNavigationAllowed = async () => {
    if (navigationBlockerRef.current) {
      return await navigationBlockerRef.current();
    }
    return true;
  };

  return (
    <DrawerContext.Provider value={{ 
      isOpen, 
      openDrawer, 
      closeDrawer, 
      toggleDrawer, 
      setNavigationBlocker,
      checkNavigationAllowed 
    }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
}
