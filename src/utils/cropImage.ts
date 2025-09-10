import { Area } from 'react-easy-crop';

/**
 * This function returns a `File` object representing the cropped image.
 * It draws the cropped portion of the image onto a new canvas and then converts it to a Blob.
 *
 * @param imageSrc The source URL of the image to crop.
 * @param pixelCrop The cropping area in pixels (from react-easy-crop).
 * @param rotation The rotation applied to the image (in degrees).
 * @param fileName The desired name for the output file.
 * @returns A Promise that resolves to a `File` object of the cropped image.
 */
export const getCroppedImage = (imageSrc: string, pixelCrop: Area, rotation: number = 0, fileName: string = 'cropped-image.jpeg'): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous'; // Needed for images from different origins

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('No 2D context available.'));
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate canvas size considering rotation to avoid clipping
      const rotRad = rotation * Math.PI / 180;
      const { width, height } = image;
      const cos = Math.abs(Math.cos(rotRad));
      const sin = Math.abs(Math.sin(rotRad));
      const newWidth = width * cos + height * sin;
      const newHeight = width * sin + height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rotRad);
      ctx.scale(scaleX, scaleY);
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);

      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        return reject(new Error('No 2D context available for cropped canvas.'));
      }

      croppedCanvas.width = pixelCrop.width;
      croppedCanvas.height = pixelCrop.height;

      croppedCtx.drawImage(
        canvas,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Canvas is empty'));
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    };

    image.onerror = (err) => {
      reject(new Error(`Failed to load image: ${err}`));
    };
  });
};