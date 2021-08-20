import { User } from '../../user/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { SignupDto } from '../dtos';
import { RoleRepository } from '../../role/repositories/role.repository';
import { Role } from '../../role/entities/role.entity';
import { RoleType } from '../../role/enums/roletype.enum';
import { UserDetails } from '../../user/entities/user.details.entity';
import { genSalt, hash } from 'bcryptjs';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
  async signup(signupDto: SignupDto) {
    const { username, email, password } = signupDto;
    const user = new User();

    user.username = username;
    user.email = email;

    const roleRepository: RoleRepository = getConnection().getRepository(Role);

    const defaultRole: Role = await roleRepository.findOne({
      where: { name: RoleType.GENERAL },
    });

    user.roles = [defaultRole];

    const details = new UserDetails();

    user.details = details;

    const salt = await genSalt(10);

    user.password = await hash(password, salt);

    await user.save();
  }
}
