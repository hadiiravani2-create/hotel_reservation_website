// src/hooks/useAuth.tsx
// version: 1.0.1
// FIX: Added 'id' to AuthUser interface to resolve TypeScript error in checkout.tsx (user?.id).
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
// Assuming AuthResponse and other types are still correctly exported by authService but missing 'id'
import { login as apiLogin, register as apiRegister, AuthResponse, LoginData, RegisterData } from '../api/authService'; 
import api from '../api/coreService'; 
import { useRouter } from 'next/router';

// NEW: Explicit Interface for the Authenticated User object, including the missing ID field.
// This structure is required by the frontend's pricing logic.
export interface AuthUser {
  id: number; // FIX: Added the missing ID property
  username: string;
  // Based on core/serializers.py UserAuthSerializer structure
  agency_role: { id: number; name: string } | null; 
  agency_id: number | null;
}

// Interface for the context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null; // FIX: Using the explicit AuthUser interface
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the name for localStorage key
const TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'authUser';

// Custom hook to handle authentication logic
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null); // FIX: Use AuthUser
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Function to set token and user, and update Axios headers
    const setAuthData = useCallback((newToken: string, newUser: AuthUser) => { // FIX: Use AuthUser
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        // Set authorization header globally for all API calls
        api.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    }, []);

    // Function to clear auth data
    const clearAuthData = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        delete api.defaults.headers.common['Authorization'];
    }, []);


    // Effect to initialize auth status from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedToken && storedUser) {
            try {
                // Ensure parsedUser conforms to the expected AuthUser structure (now including ID)
                const parsedUser = JSON.parse(storedUser) as AuthUser; 
                setAuthData(storedToken, parsedUser);
            } catch (error) {
                // If parsing fails, clear bad data
                clearAuthData();
            }
        }
        setIsLoading(false);
    }, [clearAuthData, setAuthData]); // Depend on memoized functions

    // Login API call
    const login = useCallback(async (data: LoginData) => {
        const response = await apiLogin(data);
        // Cast the response.user to AuthUser to satisfy TS, assuming the BE/API is correct
        setAuthData(response.token, response.user as AuthUser); 
        // Redirect user to homepage or dashboard after successful login
        router.push(response.user.agency_role ? '/agency/dashboard' : '/'); 
    }, [setAuthData, router]);

    // Register API call
    const register = useCallback(async (data: RegisterData) => {
        // Registration is assumed to return an auth token directly
        const response = await apiRegister(data);
        // Cast the response.user to AuthUser to satisfy TS, assuming the BE/API is correct
        setAuthData(response.token, response.user as AuthUser); 
        // Redirect user after successful registration
        router.push('/'); 
    }, [setAuthData, router]);


    // Logout function
    const logout = useCallback(() => {
        clearAuthData();
        // Redirect to login page or home page
        router.push('/login'); 
    }, [clearAuthData, router]);

    return { isAuthenticated, user, token, login, register, logout, isLoading };
};

// Provider component (Kept simple, assumed to be used in _app.tsx)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth(); // Use the hook to get all values

    return (
        // The provider value contains all necessary state and actions
        <AuthContext.Provider value={auth}>
            {auth.isLoading ? (
                // Optional: Show a loading screen while checking local storage status
                <div className="flex items-center justify-center min-h-screen">Checking auth status...</div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// Hook to consume the auth context (used in other components like Header)
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
