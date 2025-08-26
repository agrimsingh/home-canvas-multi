# Home Canvas - AI-Powered Product Visualization

An interactive web application that lets you drag and drop products into scenes to create photorealistic composites using Google's Gemini AI.

> **Note**: This project is adapted from [Google AI Studio's Home Canvas demo](https://aistudio.google.com/u/2/apps/bundled/home_canvas?showPreview=true&showAssistant=true), enhanced to support multiple products simultaneously and ported from Vite to Next.js.

## Demo

https://github.com/user-attachments/assets/8d37d175-fcb3-436e-9ab7-b7146278713b

## Features

- 🖼️ **Scene Upload**: Upload any room or scene photo as your canvas
- 📦 **Product Library**: Add multiple products to your palette
- 🎯 **Drag & Drop**: Intuitively place products in your scene
- 🤖 **AI Generation**: Gemini AI creates photorealistic composites
- 🎨 **Multi-Product Support**: Place multiple products at once
- 🔍 **Debug Mode**: View AI markers and prompts

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS
- **AI**: Google Gemini API
- **Image Processing**: Canvas API with optimization
- **State Management**: useReducer with custom hooks
- **Performance**: Dynamic imports, React.memo, image optimization

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd home-canvas-multi
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload a Scene**: Click to upload or drag & drop a room/scene image
2. **Add Products**: Click "Add Product" to upload product images
3. **Place Products**: Drag products from the palette onto the scene
4. **Generate**: Click "Generate Scene" to create the AI composite
5. **Iterate**: Add more products or change the scene as needed

## Project Structure

```
home-canvas-multi/
├── app/
│   ├── api/
│   │   └── generate-composite/    # AI generation endpoint
│   ├── page.tsx                   # Main page component
│   ├── layout.tsx                 # Root layout
│   ├── loading.tsx                # Loading state
│   └── error.tsx                  # Error boundary
├── components/
│   ├── image-uploader.tsx         # Scene/product upload
│   ├── product-palette.tsx        # Product sidebar
│   ├── placement-overlay.tsx      # Product placement markers
│   └── ...                        # Other UI components
├── lib/
│   ├── hooks/                     # Custom React hooks
│   ├── image-utils.ts             # Image processing
│   └── types.ts                   # TypeScript types
└── public/
    └── assets/                    # Default demo images
```

## Performance Optimizations

- Next.js Image component for automatic optimization
- Dynamic imports for code splitting
- Canvas pooling for efficient image processing
- React.memo for preventing unnecessary re-renders
- Skeleton loaders for better perceived performance
- Optimized state management with useReducer

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## License

MIT
