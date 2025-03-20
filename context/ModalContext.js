"use client";

import { createContext, useContext, useState } from "react";

// Create Context
const ModalContext = createContext();

// Context Provider Component
export const ModalProvider = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);

  return (
    <ModalContext.Provider value={{ showLoginModal, setShowLoginModal, showQuickModal, setShowQuickModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook for easy access
export const useModal = () => useContext(ModalContext);
