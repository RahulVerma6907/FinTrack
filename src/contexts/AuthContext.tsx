
"use client";

import type { User } from "@/types";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, name?: string) => void; // Added name for signup
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = localStorage.getItem("finTrackUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string, name?: string) => {
    // Ensure new users don't have a profilePictureUrl initially, unless provided
    const newUser: User = { 
      id: Date.now().toString(), 
      email, 
      name: name || "User", 
      profilePictureUrl: null // Explicitly null for new users, can be updated later
    };
    setUser(newUser);
    localStorage.setItem("finTrackUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finTrackUser");
  };
  
  const updateUserProfile = (profileData: Partial<User>) => {
    if (user) {
      // If profilePictureUrl is explicitly passed as null, it means remove the picture.
      // If profilePictureUrl is undefined in profileData, it means no change to the picture.
      // The spread operator handles this merging correctly.
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem("finTrackUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
