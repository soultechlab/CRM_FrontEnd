import { User } from './types';
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '../apiService';

class AuthService {
  private readonly STORAGE_KEY = '@FotoCRM:user';

  async signIn(email: string, password: string): Promise<User> {
      try {
        const userData = await apiSignIn(email, password);

        const user: User = {
          id: userData.user.id,
          token: userData.token,
          email: userData.user.email,
          name: userData.user.name,
          role: userData.user.role,
          plan: userData.user.plan,
          status: userData.user.status,
          instagram: userData.user.instagram,
          facebook: userData.user.facebook,
          whatsapp: userData.user.whatsapp,
          website: userData.user.website,
          twitter: userData.user.twitter,
          youtube: userData.user.youtube,
          company_name: userData.user.company_name,
          company_cnpj: userData.user.company_cnpj,
          company_address: userData.user.company_address,
          cpf: userData.user.cpf,
          limits: {
            maxClients: Infinity,
            maxSchedules: Infinity,
            hasFinancialAccess: true
          },
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    try {
      const userData = await apiSignUp(name, email, password);

      const user: User = {
        id: userData.user.id,
        token: userData.token,
        email: userData.user.email,
        name: userData.user.name,
        role: userData.user.role,
        plan: userData.user.plan,
        limits: {
          maxClients: Infinity,
          maxSchedules: Infinity,
          hasFinancialAccess: true
        },
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut(user: User | null): Promise<void> {
    await apiSignOut(user);
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    const user = JSON.parse(stored);

    return user;
  }
}

export const authService = new AuthService();