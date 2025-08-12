export const authService = {
  async signIn(email: string, password: string) {
    try {
      return { user: { email, token: "mocked_token" } };
    } catch (error) {
      throw error;
    }
  },

  async signUp(name: string, email: string, password: string) {
    try {
      return { user: { name, email, id: "mocked_user_id" } };
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
    } catch (error) {
      throw error;
    }
  }
};
