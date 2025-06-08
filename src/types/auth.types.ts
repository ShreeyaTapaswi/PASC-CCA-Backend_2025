export enum Department {
  CE = 'CE',
  IT = 'IT',
  ENTC = 'ENTC',
  ECE = 'ECE',
  AIDS = 'AIDS'
}

export interface IUser {
  id: number;
  name?: string;
  email: string;
  department: Department;
  year: number;
  passoutYear: number;
  roll: number;
  hours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  id: number;
  name?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  name?: string;
  email: string;
  password: string;
  department: Department;
  year: number;
  passoutYear: number;
  roll: number;
}

export interface IAdminCreate {
  name?: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IAdminLogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user?: IUser;
  admin?: IAdmin;
  token: string;
}

export interface ITokenPayload {
  id: number;
  email: string;
  type: 'user' | 'admin';
} 