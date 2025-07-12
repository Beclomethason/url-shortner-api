import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'URL Shortener API is running! Visit /docs for API documentation.';
  }
}
