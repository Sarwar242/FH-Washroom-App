import axios from "axios";
import { User } from "../helpers/types";
import { createContext, ReactNode, useContext, useEffect, useState, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (name: string, employeeId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("@WashroomApp:user");
      const storedToken = await AsyncStorage.getItem("@WashroomApp:token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Error loading storage data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (name: string, employeeId: string) => {
    try {
      const response = await axios.post(`https://fh-washroom-api.sarwar.com.bd/api/login`, {
        name,
        employee_id: employeeId,
      });
      const { user, token } = response.data;

      await AsyncStorage.setItem("@WashroomApp:user", JSON.stringify(user));
      await AsyncStorage.setItem("@WashroomApp:token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication failed");
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("@WashroomApp:user");
      await AsyncStorage.removeItem("@WashroomApp:token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};