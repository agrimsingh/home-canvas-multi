// Client-side image processing utilities using browser APIs

// Helper to get intrinsic image dimensions from a File object
export const getImageDimensions = (
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

// Helper to resize image to fit within a square and add padding
export const resizeImage = (
  file: File,
  targetDimension: number
): Promise<File> => {
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
        const canvas = document.createElement("canvas");
        canvas.width = targetDimension;
        canvas.height = targetDimension;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not get canvas context."));
        }

        // Fill the canvas with a neutral background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, targetDimension, targetDimension);

        // Calculate new dimensions to fit inside the square canvas while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth, newHeight;

        if (aspectRatio > 1) {
          // Landscape image
          newWidth = targetDimension;
          newHeight = targetDimension / aspectRatio;
        } else {
          // Portrait or square image
          newHeight = targetDimension;
          newWidth = targetDimension * aspectRatio;
        }

        // Calculate position to center the image on the canvas
        const x = (targetDimension - newWidth) / 2;
        const y = (targetDimension - newHeight) / 2;

        // Draw the resized image onto the centered position
        ctx.drawImage(img, x, y, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
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
          0.95
        );
      };
      img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
    };
    reader.onerror = (err) => reject(new Error(`File reader error: ${err}`));
  });
};

// Helper to draw multiple markers on an image with different colors
export const markImageMultiple = async (
  paddedSquareFile: File,
  positions: Array<{
    xPercent: number;
    yPercent: number;
    color: string;
    label: string;
  }>,
  originalDimensions: { originalWidth: number; originalHeight: number }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(paddedSquareFile);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file for marking."));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const targetDimension = canvas.width;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not get canvas context for marking."));
        }

        // Draw the original (padded) image
        ctx.drawImage(img, 0, 0);

        // Recalculate the content area's dimensions and offset within the padded square canvas
        const { originalWidth, originalHeight } = originalDimensions;
        const aspectRatio = originalWidth / originalHeight;
        let contentWidth, contentHeight;

        if (aspectRatio > 1) {
          // Landscape
          contentWidth = targetDimension;
          contentHeight = targetDimension / aspectRatio;
        } else {
          // Portrait or square
          contentHeight = targetDimension;
          contentWidth = targetDimension * aspectRatio;
        }

        const offsetX = (targetDimension - contentWidth) / 2;
        const offsetY = (targetDimension - contentHeight) / 2;

        // Marker coordinates will be calculated in the loop below

        // Make radius proportional to image size, but with a minimum
        const markerRadius = Math.max(
          8,
          Math.min(canvas.width, canvas.height) * 0.02
        );

        // Draw all markers
        positions.forEach((pos, index) => {
          // Calculate marker position for this placement
          const markerXInContent = (pos.xPercent / 100) * contentWidth;
          const markerYInContent = (pos.yPercent / 100) * contentHeight;
          const finalMarkerX = offsetX + markerXInContent;
          const finalMarkerY = offsetY + markerYInContent;

          // Draw the marker circle
          ctx.beginPath();
          ctx.arc(
            finalMarkerX,
            finalMarkerY,
            markerRadius,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = pos.color;
          ctx.fill();
          ctx.lineWidth = markerRadius * 0.2;
          ctx.strokeStyle = "white";
          ctx.stroke();

          // Draw the label number
          ctx.fillStyle = "white";
          ctx.font = `bold ${markerRadius}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(pos.label, finalMarkerX, finalMarkerY);
        });

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], `marked-multi-${paddedSquareFile.name}`, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            } else {
              reject(
                new Error("Canvas to Blob conversion failed during marking.")
              );
            }
          },
          "image/jpeg",
          0.95
        );
      };
      img.onerror = (err) =>
        reject(new Error(`Image load error during marking: ${err}`));
    };
    reader.onerror = (err) =>
      reject(new Error(`File reader error during multi-marking: ${err}`));
  });
};

// Helper function to convert a File object to base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix to get just the base64 data
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper to crop a square image back to original aspect ratio, removing padding
export const cropToOriginalAspectRatio = (
  imageDataUrl: string,
  originalWidth: number,
  originalHeight: number,
  targetDimension: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      // Re-calculate the dimensions of the content area within the padded square image
      const aspectRatio = originalWidth / originalHeight;
      let contentWidth, contentHeight;
      if (aspectRatio > 1) {
        // Landscape
        contentWidth = targetDimension;
        contentHeight = targetDimension / aspectRatio;
      } else {
        // Portrait or square
        contentHeight = targetDimension;
        contentWidth = targetDimension * aspectRatio;
      }

      // Calculate the top-left offset of the content area
      const x = (targetDimension - contentWidth) / 2;
      const y = (targetDimension - contentHeight) / 2;

      const canvas = document.createElement("canvas");
      // Set canvas to the final, un-padded dimensions
      canvas.width = contentWidth;
      canvas.height = contentHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Could not get canvas context for cropping."));
      }

      // Draw the relevant part of the square generated image onto the new, smaller canvas
      ctx.drawImage(
        img,
        x,
        y,
        contentWidth,
        contentHeight,
        0,
        0,
        contentWidth,
        contentHeight
      );

      // Return the data URL of the newly cropped image
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = (err) =>
      reject(new Error(`Image load error during cropping: ${err}`));
  });
};
