// Mock database implementation
export interface Database {
  users: any[];
  profiles: any[];
  clients: any[];
  schedules: any[];
}

export const db: Database = {
  users: [],
  profiles: [],
  clients: [],
  schedules: []
};