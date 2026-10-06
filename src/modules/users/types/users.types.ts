export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  birthday: string | null;
}
