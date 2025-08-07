export const authService = {
  async signIn(email: string, password: string) {
    try {
      // Mock response simulating a successful sign-in
      return { user: { email, token: "mocked_token" } };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signUp(name: string, email: string, password: string) {
    try {
      // Mock response simulating a successful sign-up
      return { user: { name, email, id: "mocked_user_id" } };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      // Mock response simulating a successful sign-out
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
};
