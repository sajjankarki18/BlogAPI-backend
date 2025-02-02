import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/signup')
  signup(@Body() userDto: CreateUserDto) {
    return this.userService.signup(userDto);
  }

  @Post('/signin')
  signin(@Body() userDto: LoginUserDto) {
    return this.userService.signin(userDto);
  }
}
