export const supabase = {
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log('Mocked onAuthStateChange called');
      // Simula um evento SIGNED_IN
      callback('SIGNED_IN', { user: { email: 'mock@example.com' } });
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log(`Mocked signInWithPassword called with email: ${email}`);
      return { data: { user: { email } }, error: null };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log(`Mocked signUp called with email: ${email}`);
      return { data: { user: { email } }, error: null };
    },
    signOut: async () => {
      console.log('Mocked signOut called');
      return { error: null };
    }
  },
};
