export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  file: File;
}

export interface PlacedProduct {
  id: string;
  product: Product;
  position: { x: number; y: number }; // UI coordinates on scene
  relativePosition: { xPercent: number; yPercent: number }; // Relative scene coordinates
}
