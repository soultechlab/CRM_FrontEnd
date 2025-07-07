export const authService = {
  async signIn(email: string, password: string) {
    try {
      // Mock response simulating a successful sign-in
      console.log(`Mocked signIn called with email: ${email}`);
      return { user: { email, token: "mocked_token" } };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signUp(name: string, email: string, password: string) {
    try {
      // Mock response simulating a successful sign-up
      console.log(`Mocked signUp called with name: ${name}, email: ${email}`);
      return { user: { name, email, id: "mocked_user_id" } };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      // Mock response simulating a successful sign-out
      console.log("Mocked signOut called");
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
};
