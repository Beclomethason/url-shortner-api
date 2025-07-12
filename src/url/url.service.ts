import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Url, UrlDocument } from './schemas/url.schema';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto, UrlStatsDto } from './dto/url-response.dto';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url.name) private urlModel: Model<UrlDocument>,
    private configService: ConfigService,
  ) {}

  async shortenUrl(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    const { url, customCode } = createUrlDto;
    let shortCode = customCode;

    // If custom code is provided, check if it already exists
    if (customCode) {
      const existingUrl = await this.urlModel.findOne({ shortCode: customCode });
      if (existingUrl) {
        throw new ConflictException('Custom code is already in use');
      }
    } else {
      // Generate a unique short code
      shortCode = await this.generateUniqueShortCode();
    }

    // Create new URL document
    const newUrl = new this.urlModel({
      originalUrl: url,
      shortCode,
    });

    await newUrl.save();

    const baseUrl = this.configService.get<string>('BASE_URL');
    return {
      originalUrl: url,
      shortUrl: `${baseUrl}/r/${shortCode}`,
    };
  }

  async redirectToOriginalUrl(shortCode: string): Promise<string> {
    const url = await this.urlModel.findOne({ shortCode });
    
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    // Increment click counter
    await this.urlModel.updateOne(
      { shortCode },
      { $inc: { clicks: 1 } }
    );

    return url.originalUrl;
  }

  async getUrlStats(shortCode: string): Promise<UrlStatsDto> {
    const url = await this.urlModel.findOne({ shortCode });
    
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    const baseUrl = this.configService.get<string>('BASE_URL');
    return {
      originalUrl: url.originalUrl,
      shortUrl: `${baseUrl}/r/${shortCode}`,
      clicks: url.clicks,
    };
  }

  private async generateUniqueShortCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode: string;
    let isUnique = false;

    while (!isUnique) {
      shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existingUrl = await this.urlModel.findOne({ shortCode });
      if (!existingUrl) {
        isUnique = true;
      }
    }

    return shortCode;
  }
}
