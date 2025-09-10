import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { getCroppedImage } from '@/utils/cropImage';
import { toast } from 'sonner';

interface ImageCropperDialogProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
}

export const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 16 / 7, // Default aspect ratio for hero slides
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number[]) => {
    setZoom(newZoom[0]);
  }, []);

  const onRotationChange = useCallback((newRotation: number[]) => {
    setRotation(newRotation[0]);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedPixels) {
      toast.error("No crop area selected.");
      return;
    }
    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImage(imageSrc, croppedPixels, rotation);
      onCropComplete(croppedFile);
      onClose();
    } catch (e) {
      console.error("Error cropping image:", e);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        <div className="relative flex-grow w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropAreaComplete}
            showGrid={true}
            restrictPosition={false}
          />
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="zoom-slider" className="w-12">Zoom</Label>
            <Slider
              id="zoom-slider"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={onZoomChange}
              className="flex-grow"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="rotation-slider" className="w-12">Rotate</Label>
            <Slider
              id="rotation-slider"
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={onRotationChange}
              className="flex-grow"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveCrop} disabled={isCropping}>
            {isCropping ? "Cropping..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};