import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    description: 'The original URL',
    example: 'https://www.example.com/a-very-long-url-to-shorten',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'The shortened URL',
    example: 'http://localhost:3000/r/abc123',
  })
  shortUrl: string;
}

export class UrlStatsDto extends UrlResponseDto {
  @ApiProperty({
    description: 'Number of clicks on the short URL',
    example: 15,
  })
  clicks: number;
}
