export const supabase = {
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simula um evento SIGNED_IN
      callback('SIGNED_IN', { user: { email: 'mock@example.com' } });
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      return { data: { user: { email } }, error: null };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      return { data: { user: { email } }, error: null };
    },
    signOut: async () => {
      return { error: null };
    }
  },
};
