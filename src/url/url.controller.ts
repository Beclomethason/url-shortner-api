import { Controller, Post, Get, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto, UrlStatsDto } from './dto/url-response.dto';

@ApiTags('URL Shortener')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('api/shorten')
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL format',
  })
  @ApiResponse({
    status: 409,
    description: 'Custom code already in use',
  })
  async shortenUrl(@Body() createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    return this.urlService.shortenUrl(createUrlDto);
  }

  @Get('r/:shortCode')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({
    name: 'shortCode',
    description: 'The short code to redirect',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async redirectToOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const originalUrl = await this.urlService.redirectToOriginalUrl(shortCode);
    res.redirect(HttpStatus.FOUND, originalUrl);
  }

  @Get('api/stats/:shortCode')
  @ApiOperation({ summary: 'Get URL analytics' })
  @ApiParam({
    name: 'shortCode',
    description: 'The short code to get stats for',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'URL statistics retrieved successfully',
    type: UrlStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async getUrlStats(@Param('shortCode') shortCode: string): Promise<UrlStatsDto> {
    return this.urlService.getUrlStats(shortCode);
  }
}
