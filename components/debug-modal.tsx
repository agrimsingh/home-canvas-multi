"use client";

import React from "react";
import OptimizedImage from "./optimized-image";

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  prompt: string | null;
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const DebugModal: React.FC<DebugModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
}) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 md:p-8 relative transform transition-all flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={handleModalContentClick}
        role="document"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 transition-colors z-10"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-extrabold text-zinc-800">Debug View</h2>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          <div>
            <p className="text-zinc-600 mb-2">
              This is the image sent to the AI, with a red marker indicating the
              placement.
            </p>
            <div className="rounded-lg overflow-hidden bg-zinc-100 relative aspect-video">
              <OptimizedImage
                src={imageUrl}
                alt="Debug view of marked scene"
                className="w-full h-full"
                fill
                objectFit="contain"
              />
            </div>
          </div>

          {prompt && (
            <div>
              <h3 className="text-lg font-bold text-zinc-800 mb-2">
                Final Prompt to Image Model
              </h3>
              <pre className="bg-zinc-100 text-zinc-700 p-4 rounded-lg text-xs whitespace-pre-wrap">
                <code>{prompt}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugModal;
