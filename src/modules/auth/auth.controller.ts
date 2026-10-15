import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({
    summary: 'Create a resident account from the signup token of a new email',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired signup token, or inactive city',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'An account with this email already exists',
  })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('/otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a one-time login code to an email' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'A code was requested less than 60 seconds ago',
  })
  requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestOtp(requestOtpDto);
  }

  @Post('/otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Exchange a one-time code for a login token, or for a signup token when the email has no account',
  })
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}
