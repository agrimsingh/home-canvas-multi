// Optimized image processing utilities with canvas reuse and Web Worker support

// Canvas pool for reuse
class CanvasPool {
  private pool: HTMLCanvasElement[] = [];

  getCanvas(): HTMLCanvasElement {
    return this.pool.pop() || document.createElement("canvas");
  }

  releaseCanvas(canvas: HTMLCanvasElement) {
    // Clear the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.pool.push(canvas);
  }
}

const canvasPool = new CanvasPool();

// Optimized version of getImageDimensions using createImageBitmap
export const getImageDimensionsOptimized = async (
  file: File
): Promise<{ width: number; height: number }> => {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close(); // Clean up resources
    return dimensions;
  } catch (error) {
    // Fallback to original method if createImageBitmap fails
    return getImageDimensionsFallback(file);
  }
};

// Fallback method
const getImageDimensionsFallback = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
    };
    reader.onerror = (err) => reject(new Error(`File reader error: ${err}`));
  });
};

// Optimized resize with canvas reuse
export const resizeImageOptimized = async (
  file: File,
  targetDimension: number
): Promise<File> => {
  const canvas = canvasPool.getCanvas();
  canvas.width = targetDimension;
  canvas.height = targetDimension;

  try {
    const bitmap = await createImageBitmap(file);
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
      throw new Error("Could not get canvas context.");
    }

    // Use lower quality for faster processing during development
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill with black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, targetDimension, targetDimension);

    // Calculate dimensions
    const aspectRatio = bitmap.width / bitmap.height;
    let newWidth, newHeight;

    if (aspectRatio > 1) {
      newWidth = targetDimension;
      newHeight = targetDimension / aspectRatio;
    } else {
      newHeight = targetDimension;
      newWidth = targetDimension * aspectRatio;
    }

    const x = (targetDimension - newWidth) / 2;
    const y = (targetDimension - newHeight) / 2;

    // Draw the image
    ctx.drawImage(bitmap, x, y, newWidth, newHeight);
    bitmap.close();

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          canvasPool.releaseCanvas(canvas);
          if (blob) {
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          } else {
            reject(new Error("Canvas to Blob conversion failed."));
          }
        },
        "image/jpeg",
        0.9 // Slightly lower quality for better performance
      );
    });
  } catch (error) {
    canvasPool.releaseCanvas(canvas);
    throw error;
  }
};

// Export other utilities from original file
export {
  markImageMultiple,
  fileToBase64,
  cropToOriginalAspectRatio,
} from "./image-utils";
