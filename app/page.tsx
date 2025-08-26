"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  lazy,
} from "react";
import dynamic from "next/dynamic";
import { useHomeCanvas } from "@/lib/hooks/use-home-canvas";
import Header from "@/components/header";
import ImageUploader from "@/components/image-uploader";
import ProductPalette from "@/components/product-palette";
import PlacementOverlay from "@/components/placement-overlay";
import GenerateButton from "@/components/generate-button";
import Spinner from "@/components/spinner";
import { SkeletonProductPalette, SkeletonScene } from "@/components/skeleton";

// Dynamic imports for rarely used components
const DebugModal = dynamic(() => import("@/components/debug-modal"), {
  loading: () => <div />,
});

const AddProductModal = dynamic(
  () => import("@/components/add-product-modal"),
  {
    loading: () => <div />,
  }
);

// Loading messages constant
const loadingMessages = [
  "Analyzing your product...",
  "Surveying the scene...",
  "Describing placement location with AI...",
  "Crafting the perfect composition prompt...",
  "Generating photorealistic options...",
  "Assembling the final scene...",
];

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  if (arr.length < 2) throw new Error("Invalid data URL");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1])
    throw new Error("Could not parse MIME type from data URL");

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Lazy load the image generation function
const generateMultiProductComposite = async (
  placedProducts: any[],
  sceneImage: File
) => {
  const {
    getImageDimensionsOptimized,
    resizeImageOptimized,
    markImageMultiple,
    fileToBase64,
    cropToOriginalAspectRatio,
  } = await import("@/lib/image-utils-optimized");

  // Get original scene dimensions for final cropping
  const { width: originalWidth, height: originalHeight } =
    await getImageDimensionsOptimized(sceneImage);

  // Define standard dimension for model inputs
  const MAX_DIMENSION = 1024;

  // STEP 1: Prepare scene image by resizing
  console.log("Resizing scene image...");
  const resizedSceneImage = await resizeImageOptimized(
    sceneImage,
    MAX_DIMENSION
  );

  // STEP 2: Prepare all product images by resizing
  console.log("Resizing product images...");
  const resizedProductImages = await Promise.all(
    placedProducts.map((placed) =>
      resizeImageOptimized(placed.product.file, MAX_DIMENSION)
    )
  );

  // STEP 3: Create multi-colored markers for all product positions
  console.log("Creating multi-product markers...");
  const colors = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const markerPositions = placedProducts.map((placed, index) => ({
    xPercent: placed.relativePosition.xPercent,
    yPercent: placed.relativePosition.yPercent,
    color: colors[index % colors.length],
    label: (index + 1).toString(),
  }));

  const markedSceneImage = await markImageMultiple(
    resizedSceneImage,
    markerPositions,
    { originalWidth, originalHeight }
  );

  // STEP 4: Convert all images to base64
  const sceneBase64 = await fileToBase64(resizedSceneImage);
  const markedSceneBase64 = await fileToBase64(markedSceneImage);

  const productData = await Promise.all(
    resizedProductImages.map(async (resizedImage, index) => ({
      productBase64: await fileToBase64(resizedImage),
      description: placedProducts[index].product.name,
      position: placedProducts[index].relativePosition,
    }))
  );

  // Send to API
  const response = await fetch("/api/generate-composite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      placedProducts: productData,
      sceneBase64,
      sceneDescription: sceneImage.name,
      markedSceneBase64,
      originalWidth,
      originalHeight,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate composite image");
  }

  const result = await response.json();

  // Crop the final image back to original aspect ratio (client-side)
  const finalImageUrl = await cropToOriginalAspectRatio(
    result.finalImageUrl,
    originalWidth,
    originalHeight,
    MAX_DIMENSION
  );

  return {
    ...result,
    finalImageUrl,
  };
};

export default function HomeOptimized() {
  const { state, actions } = useHomeCanvas();
  const [isDebugModalOpen, setIsDebugModalOpen] = React.useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] =
    React.useState(false);
  const sceneImgRef = useRef<HTMLImageElement>(null);

  // Use useMemo to prevent creating new blob URLs on every render
  const sceneImageUrl = React.useMemo(() => {
    return state.sceneImage ? URL.createObjectURL(state.sceneImage) : null;
  }, [state.sceneImage]);

  const handleProductImageUpload = useCallback(
    (file: File) => {
      try {
        actions.addProduct(file);
        setIsAddProductModalOpen(false);
      } catch (err) {
        // Error is handled in the hook
      }
    },
    [actions]
  );

  const handleInstantStart = useCallback(async () => {
    actions.setError(null);
    try {
      // Fetch the default images
      const [objectResponse, sceneResponse] = await Promise.all([
        fetch("/assets/object.jpeg"),
        fetch("/assets/scene.jpeg"),
      ]);

      if (!objectResponse.ok || !sceneResponse.ok) {
        throw new Error("Failed to load default images");
      }

      // Convert to blobs then to File objects
      const [objectBlob, sceneBlob] = await Promise.all([
        objectResponse.blob(),
        sceneResponse.blob(),
      ]);

      const objectFile = new File([objectBlob], "desk-lamp.jpeg", {
        type: "image/jpeg",
      });
      const sceneFile = new File([sceneBlob], "bedroom-scene.jpeg", {
        type: "image/jpeg",
      });

      // Update state with the new files
      actions.setSceneImage(sceneFile);
      actions.addProduct(objectFile);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      actions.setError(
        `Could not load default images. Details: ${errorMessage}`
      );
    }
  }, [actions]);

  const handleProductDrop = useCallback(
    (
      position: { x: number; y: number },
      relativePosition: { xPercent: number; yPercent: number }
    ) => {
      if (!state.draggedProduct || !state.sceneImage) {
        actions.setError("No product selected for placement.");
        return;
      }

      actions.addPlacedProduct(
        state.draggedProduct,
        position,
        relativePosition
      );
    },
    [state.draggedProduct, state.sceneImage, actions]
  );

  const handleGenerateScene = useCallback(async () => {
    if (!state.sceneImage || state.placedProducts.length === 0) {
      actions.setError("Please add a scene and place at least one product.");
      return;
    }

    actions.setLoading(true);
    actions.setError(null);

    try {
      const { finalImageUrl, debugImageUrl, finalPrompt } =
        await generateMultiProductComposite(
          state.placedProducts,
          state.sceneImage
        );

      actions.setDebugInfo(debugImageUrl, finalPrompt);

      // Update scene with generated composite
      const newSceneFile = dataURLtoFile(
        finalImageUrl,
        `multi-product-scene-${Date.now()}.jpeg`
      );
      actions.setSceneImage(newSceneFile);

      // Clear placements since they're now part of the scene
      actions.clearPlacements();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      actions.setError(`Failed to generate the scene. ${errorMessage}`);
    } finally {
      actions.setLoading(false);
    }
  }, [state.placedProducts, state.sceneImage, actions]);

  // Loading message rotation effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (state.isLoading) {
      actions.setLoadingMessageIndex(0);
      let currentIndex = 0;
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingMessages.length;
        actions.setLoadingMessageIndex(currentIndex);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isLoading, actions]); // Remove state.loadingMessageIndex from dependencies

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (sceneImageUrl) URL.revokeObjectURL(sceneImageUrl);
    };
  }, [sceneImageUrl]);

  const renderContent = () => {
    if (state.error) {
      return (
        <div className="text-center animate-fade-in bg-red-50 border border-red-200 p-8 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4 text-red-800">
            An Error Occurred
          </h2>
          <p className="text-lg text-red-700 mb-6">{state.error}</p>
          <button
            onClick={actions.reset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!state.sceneImage) {
      return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-zinc-800 mb-4">
              Upload Scene
            </h2>
            <Suspense fallback={<SkeletonScene />}>
              <ImageUploader
                id="scene-uploader"
                onFileSelect={actions.setSceneImage}
                imageUrl={sceneImageUrl}
              />
            </Suspense>
          </div>
          <div className="text-center mt-10 min-h-[4rem] flex flex-col justify-center items-center">
            <p className="text-zinc-500 animate-fade-in">
              Upload a scene image to begin placing products.
            </p>
            <p className="text-zinc-500 animate-fade-in mt-2">
              Or click{" "}
              <button
                onClick={handleInstantStart}
                className="font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
              >
                here
              </button>{" "}
              for an instant start.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-7xl mx-auto animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
          {/* Product Palette */}
          <div className="lg:col-span-1 flex flex-col max-h-[600px]">
            <Suspense fallback={<SkeletonProductPalette />}>
              <ProductPalette
                products={state.uploadedProducts}
                onProductDragStart={actions.setDraggedProduct}
                onAddProduct={() => setIsAddProductModalOpen(true)}
              />
            </Suspense>
          </div>

          {/* Scene Column */}
          <div className="lg:col-span-3 flex flex-col">
            <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">
              Scene
            </h2>
            <div className="flex-grow flex items-center justify-center relative">
              <Suspense fallback={<SkeletonScene />}>
                <ImageUploader
                  ref={sceneImgRef}
                  id="scene-uploader"
                  onFileSelect={actions.setSceneImage}
                  imageUrl={sceneImageUrl}
                  isDropZone={!!state.sceneImage && !state.isLoading}
                  onProductDrop={handleProductDrop}
                  showDebugButton={!!state.debugImageUrl && !state.isLoading}
                  onDebugClick={() => setIsDebugModalOpen(true)}
                  isDraggedProductActive={!!state.draggedProduct}
                />

                {/* Placement overlays */}
                <PlacementOverlay
                  placedProducts={state.placedProducts}
                  onRemoveProduct={actions.removePlacedProduct}
                  isGenerating={state.isLoading}
                />
              </Suspense>
            </div>
            <div className="text-center mt-4">
              <div className="h-5 flex items-center justify-center">
                {state.sceneImage && !state.isLoading && (
                  <button
                    onClick={() => actions.setSceneImage(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Change Scene
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 min-h-[8rem] flex flex-col justify-center items-center">
          {state.isLoading ? (
            <div className="animate-fade-in">
              <Spinner />
              <p className="text-xl mt-4 text-zinc-600 transition-opacity duration-500">
                {loadingMessages[state.loadingMessageIndex]}
              </p>
            </div>
          ) : (
            <GenerateButton
              placedProducts={state.placedProducts}
              isGenerating={state.isLoading}
              onGenerate={handleGenerateScene}
              disabled={!state.sceneImage}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex items-center justify-center p-4 md:p-8">
      <div className="flex flex-col items-center gap-8 w-full">
        <Header />
        <main className="w-full">{renderContent()}</main>
      </div>

      <Suspense fallback={null}>
        <DebugModal
          isOpen={isDebugModalOpen}
          onClose={() => setIsDebugModalOpen(false)}
          imageUrl={state.debugImageUrl}
          prompt={state.debugPrompt}
        />

        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onFileSelect={handleProductImageUpload}
        />
      </Suspense>
    </div>
  );
}
