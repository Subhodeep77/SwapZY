// src/appwrite/authService.js
import { account } from "./config";

class AuthService {
  /**
   * Logs in the user using Google OAuth2.
   * Automatically redirects to Google.
   */
  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        "google",
        import.meta.env.VITE_OAUTH_SUCCESS_REDIRECT, // e.g. http://localhost:5173/
        import.meta.env.VITE_OAUTH_FAILURE_REDIRECT // e.g. http://localhost:5173/login
      );
    } catch (error) {
      console.error("OAuth2 login failed:", error);
      throw error;
    }
  }

  /**
   * Gets the currently authenticated user.
   */
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.warn("No user session found:", error.message || error);
      return null;
    }
  }

  /**
   * Logs out the currently logged-in user.
   */
  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
}

const authService = new AuthService();
export default authService;
