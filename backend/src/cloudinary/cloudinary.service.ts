import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: any, folder: string = 'misc'): Promise<any> {
    return new Promise((resolve, reject) => {
      // Configuration
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const upload = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      const buffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer);

      Readable.from(buffer).pipe(upload);
    });
  }

  async deleteImageFromUrl(imageUrl: string): Promise<any> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;

    // Extract public ID: matches /upload/v12345/folder/id.jpg -> folder/id
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = imageUrl.match(regex);
    if (!match || !match[1]) return;

    const publicId = match[1];

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
