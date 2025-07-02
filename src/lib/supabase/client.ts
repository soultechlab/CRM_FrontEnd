export const supabase = {
  from: (tableName: string) => ({
    insert: async (data: any[]) => {
      console.log(`Mocked insert called on table: ${tableName}`, data);
      return { data, error: null };
    },
    select: () => ({
      eq: (column: string, value: any) => ({
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (count: number) => {
            console.log(`Mocked select called on table: ${tableName} with conditions:`, { column, value, count });
            return { data: [], error: null };
          },
        }),
      }),
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => {
        console.log(`Mocked update called on table: ${tableName} with conditions:`, { column, value, updates });
        return { error: null };
      },
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        console.log(`Mocked delete called on table: ${tableName} with conditions:`, { column, value });
        return { error: null };
      },
    }),
  }),
};
