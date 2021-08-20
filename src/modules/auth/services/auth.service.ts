import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { SigninDto, SignupDto } from '../dtos';
import { User } from '../../user/entities/user.entity';
import { compare } from 'bcryptjs';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { RoleType } from '../../role/enums/roletype.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private readonly _authRepository: AuthRepository,
    private readonly _jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<void> {
    const { username, email } = signupDto;
    const userExists = await this._authRepository.findOne({
      where: [{ username }, { email }],
    });

    if (userExists) {
      throw new ConflictException('Ops, username or e-mail already exists!');
    }

    return this._authRepository.signup(signupDto);
  }

  async signin(signinDto: SigninDto): Promise<{ token: string }> {
    const { username, password } = signinDto;

    const user: User = await this._authRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('Ops, user does not exist!');
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Ops, invalid credentials!');
    }

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map((r) => r.name as RoleType),
    };

    const token = this._jwtService.sign(payload);

    return { token };
  }
}
