import { RoleType } from '../../role/enums/roletype.enum';

export interface IJwtPayload {
  id: number;
  username: string;
  email: string;
  roles: RoleType[];
  iat?: Date; //expiração do token;
}
