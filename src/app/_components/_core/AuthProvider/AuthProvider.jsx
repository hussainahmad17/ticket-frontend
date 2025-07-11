import React from "react";
import { AuthContext } from "./AuthContext";
import { eraseCookie, getCookie, setCookie } from "@jumbo/utilities/cookies";
import axios from "axios";
import { toast } from "react-toastify";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [userLoading, setUserLoading] = React.useState(false);

  // Fetch user data from API
  const fetchUser = async () => {
    setUserLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/user/getUser",
        { withCredentials: true }
      );
      if (response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // If 401, user is not authenticated
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  // Update user data (for profile updates)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Refresh user data (re-fetch from server)
  const refreshUser = async () => {
    return await fetchUser();
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      console.log(response)
      if (response.data.token) {
        const stringify = {
          token: response.data.token,
          email: response.data.user.email,
        };
        const authUserSr = encodeURIComponent(JSON.stringify(stringify));
        setCookie("auth-user", authUserSr, 1);
        setIsAuthenticated(true);
        
        // Fetch user data after successful login
        await fetchUser();
        
        // Show success toast
        toast.success("Login successful! Welcome back!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        return true;
      }
      else {
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      
      // Show error toast
      toast.error(error.response?.data?.message || "Login failed. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });
      if (response.status === 200) {
        eraseCookie("auth-user");
        setIsAuthenticated(false);
        setUser(null); // Clear user data on logout
        
        // Show success toast
        toast.info("Logged out successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.log(error);
      
      // Show error toast
      toast.error("Logout failed. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      let authUserSr = getCookie("auth-user");
      if (authUserSr) {
        setIsAuthenticated(true);
        // Fetch user data if authenticated
        await fetchUser();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      setIsAuthenticated,
      user,
      userLoading,
      fetchUser,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
