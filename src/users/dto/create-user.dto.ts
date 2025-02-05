import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'email should be string' })
  @IsEmail()
  email: string;

  @IsString({ message: 'username should be string' })
  @Length(3, 15, { message: 'username should be atleast 3 to 15 characters' })
  username: string;

  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @Length(6, 15, { message: 'username should be atleast 10 to 15 characters' })
  password: string;
}
