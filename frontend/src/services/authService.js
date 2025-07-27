// src/appwrite/authService.js
import { account } from "../config/appwrite";

class AuthService {
  async loginWithGoogle() {
    try {
      await account.createOAuth2Session(
        "google",
        import.meta.env.VITE_OAUTH_SUCCESS_REDIRECT,
        import.meta.env.VITE_OAUTH_FAILURE_REDIRECT
      );
    } catch (error) {
      console.error("OAuth2 login failed:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.warn("No user session found:", error.message || error);
      return null;
    }
  }

  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  /**
   * Gets the JWT for secure backend API calls.
   */
  async getJWT() {
    try {
      const session = await account.createJWT();
      console.log(session.jwt);
      return session.jwt;
    } catch (error) {
      console.error("Failed to get JWT:", error);
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
