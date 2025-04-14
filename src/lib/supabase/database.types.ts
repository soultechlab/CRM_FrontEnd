export interface Database {
  public: {
    Tables: {
      users_profiles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'user';
          plan: 'free' | 'mensal' | 'anual';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'user';
          plan?: 'free' | 'mensal' | 'anual';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'user';
          plan?: 'free' | 'mensal' | 'anual';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}