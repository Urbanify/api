import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SignupValidationInterceptor } from './interceptors/signup.interceptor';
import { SigninDto } from './dto/signin.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Signup an user' })
  @UseInterceptors(SignupValidationInterceptor)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Signin an user' })
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }
}
