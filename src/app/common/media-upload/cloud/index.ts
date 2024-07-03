import { v2 as cloudinaryV2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from '@app/app.constants';
import * as streamifier from 'streamifier';


const config_service = new ConfigService()

cloudinaryV2.config({
    cloud_name: config_service.get<string>(APP_CONFIG.CLOUD_NAME),
    api_key: config_service.get<string>(APP_CONFIG.CLOUD_API),
    api_secret: config_service.get<string>(APP_CONFIG.CLOUD_SECRET)
});


export function generateUploadURL(image: Express.Multer.File): Promise<{ uploadUrl: string; url: string; }> {

    return new Promise((resolve, reject) => {
        if (!image || !image.buffer) {
            reject(new Error('No image or image buffer provided'));
            return;
        }

        const bufferStream = streamifier.createReadStream(image.buffer);
        const stream = cloudinaryV2.uploader.upload_stream((error: any, result: any) => {
            if (error) {
                console.error(`Upload error: ${error}`);
                reject(error);
            } else {
                resolve({
                    uploadUrl: result.secure_url,
                    url: result.public_id,
                });
            }
        });

        // Pipe the buffer stream to the Cloudinary stream
        bufferStream.pipe(stream);
    });

}