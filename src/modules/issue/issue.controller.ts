import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';

import { AcceptIssueDto } from './dto/accept-issue.dto';
import { CloseIssueDto } from './dto/close-issue.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { GetIssueByIdResponseDto } from './dto/get-issue-by-id.dto';
import {
  ListIssuesFilterDto,
  ListIssuesResponseDto,
} from './dto/list-issues.dto';
import {
  ListIssuesReportedByUserFilterDto,
  ListIssuesReportedByUserResponseDto,
} from './dto/list-issues-reported-by-user.dto';
import { ResolutionIssueDto } from './dto/resolution-issue.dto';
import { SolveIssueDto } from './dto/solve-issue.dto';
import { IssueValidationInterceptor } from './interceptors/issue.interceptor';
import { ResolutionValidationInterceptor } from './interceptors/resolution.interceptor';
import { IssueService } from './issue.service';

@Controller('issues')
@UseInterceptors(AuthValidationInterceptor)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  @ApiOperation({ summary: 'Create an issue' })
  create(
    @Body() createIssueDto: CreateIssueDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.create(userType, createIssueDto);
  }

  @Get()
  @ApiOperation({ summary: 'List issues' })
  @ApiResponse({ type: [ListIssuesResponseDto] })
  list(@Query() filter: ListIssuesFilterDto, @ActiveUser() userType: UserType) {
    return this.issueService.list(userType, filter);
  }

  @Get('/open')
  @ApiOperation({ summary: 'List open issues' })
  @ApiResponse({ type: [ListIssuesResponseDto] })
  listOpenIssues(
    @Query() filter: ListIssuesFilterDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.listOpenIssues(userType, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an issue by id' })
  @ApiResponse({ type: GetIssueByIdResponseDto })
  getById(@Param('id') id: string, @ActiveUser() userType: UserType) {
    return this.issueService.getById(id, userType.cityId);
  }

  @Get('/reported/me')
  @ApiOperation({ summary: 'Get the issues reported by user' })
  @ApiResponse({ type: [ListIssuesReportedByUserResponseDto] })
  listReportedByUser(
    @Query() filter: ListIssuesReportedByUserFilterDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.listReportedByUser(userType, filter);
  }

  @Post(':id/assign/me')
  @UseInterceptors(IssueValidationInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign the user to issue' })
  assign(@Param('id') id: string, @ActiveUser() userType: UserType) {
    return this.issueService.assign(id, userType);
  }

  @Post(':id/close')
  @UseInterceptors(IssueValidationInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close an issue' })
  close(
    @Param('id') id: string,
    @Body() closeIssueDto: CloseIssueDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.close(id, closeIssueDto, userType);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an issue' })
  accept(
    @Param('id') id: string,
    @Body() acceptIssueDto: AcceptIssueDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.accept(id, acceptIssueDto, userType);
  }

  @Post(':id/resolution')
  @UseInterceptors(ResolutionValidationInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a resolution to issue' })
  resolution(
    @Param('id') id: string,
    @Body() resolutionIssueDto: ResolutionIssueDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.resolution(id, resolutionIssueDto, userType);
  }

  @Post(':id/solve')
  @UseInterceptors(IssueValidationInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solve an issue' })
  solve(
    @Param('id') id: string,
    @Body() solveIssueDto: SolveIssueDto,
    @ActiveUser() userType: UserType,
  ) {
    return this.issueService.solve(id, solveIssueDto, userType);
  }
}
