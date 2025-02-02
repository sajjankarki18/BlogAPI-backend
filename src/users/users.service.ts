import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon from 'argon2';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  validateUser = async (userDto: CreateUserDto) => {
    const userEmail = await this.usersRepository.findOne({
      where: {
        email: userDto.email,
      },
    });

    if (userEmail) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: ['email already exists!'],
        error: 'Conflict',
      });
    }
  };

  //create a new account
  async signup(userDto: CreateUserDto): Promise<User> {
    await this.validateUser(userDto);
    try {
      const hashedPassword = await argon.hash(userDto.password);
      const user = this.usersRepository.create({
        email: userDto.email,
        username: userDto.username,
        password: hashedPassword,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['some error occured while creating the account', error],
        error: 'Internal server error',
      });
    }
  }

  //login into the existing account
  async signin(userDto: LoginUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: userDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['user not found'],
        error: 'Not Found',
      });
    }

    const passVerify = await argon.verify(user.password, userDto.password);
    if (!passVerify) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['incorrect password, please try again!'],
        error: 'Bad Request',
      });
    }
    return await this.signJwtToken(user.id, userDto.email);
  }

  async signJwtToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = {
        sub: userId,
        email,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '30m',
        secret: process.env.JWT_SECRET,
      });

      return {
        access_token: token,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
        error: 'Internal server error',
      });
    }
  }
}
