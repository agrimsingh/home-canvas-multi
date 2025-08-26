"use client";

import React from "react";
import ImageUploader from "./image-uploader";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
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

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleFileUploaded = (file: File) => {
    onFileSelect(file);
    // No need to call onClose here, as the parent component will handle it
    // in the onFileSelect callback for better state flow control.
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative transform transition-all"
        onClick={handleModalContentClick}
        role="document"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold mb-4 text-zinc-800">
            Add Your Own Product
          </h2>
        </div>
        <ImageUploader
          id="custom-product-uploader"
          onFileSelect={onFileSelect}
          imageUrl={null}
        />
      </div>
    </div>
  );
};

export default AddProductModal;
