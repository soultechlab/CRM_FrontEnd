export const supabase = {
  from: (tableName: string) => ({
    insert: async (data: any[]) => {
      return { data, error: null };
    },
    select: () => ({
      eq: (column: string, value: any) => ({
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (count: number) => {
            return { data: [], error: null };
          },
        }),
      }),
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => {
        return { error: null };
      },
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        return { error: null };
      },
    }),
  }),
};
