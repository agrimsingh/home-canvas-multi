import { NextRequest, NextResponse } from "next/server";

// Dynamic import for better code splitting
const getGoogleGenAI = async () => {
  const { GoogleGenAI } = await import("@google/genai");
  return GoogleGenAI;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      placedProducts, // Array of { productBase64, description, position }
      sceneBase64,
      sceneDescription,
      markedSceneBase64,
      originalWidth,
      originalHeight,
    } = body;

    if (
      !placedProducts ||
      !Array.isArray(placedProducts) ||
      placedProducts.length === 0 ||
      !sceneBase64 ||
      !markedSceneBase64
    ) {
      return NextResponse.json(
        { error: "Missing required fields or no products placed" },
        { status: 400 }
      );
    }

    console.log(
      `Starting multi-product generation for ${placedProducts.length} products...`
    );

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const GoogleGenAI = await getGoogleGenAI();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // STEP 1: Generate semantic location descriptions for all products
    console.log("Generating location descriptions...");

    const markedSceneImagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: markedSceneBase64,
      },
    };

    const descriptionPrompt = `
You are an expert scene analyst. I will provide you with an image that has multiple colored markers on it (numbered 1, 2, 3, etc.).
Your task is to provide dense, semantic descriptions for EACH marker location.

For each numbered marker, describe:
1. What surface/object it's on
2. Spatial relationships to nearby objects
3. Rough relative position in the image

Format your response as:
**Marker 1:** [detailed description]
**Marker 2:** [detailed description]
**Marker 3:** [detailed description]

Example format:
**Marker 1:** The location is on the dark grey fabric of the sofa cushion, in the middle section, about 20% from the left edge of the image.
**Marker 2:** The location is on the light wooden floor, near the coffee table leg, about 30% from the bottom of the image.
`;

    let locationDescriptions = "";
    try {
      const descriptionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: {
          parts: [{ text: descriptionPrompt }, markedSceneImagePart],
        },
      });
      locationDescriptions = descriptionResponse.text || "";
      console.log("Generated descriptions:", locationDescriptions);
    } catch (error) {
      console.error("Failed to generate location descriptions:", error);
      // Fallback descriptions
      locationDescriptions = placedProducts
        .map((_, i) => `**Marker ${i + 1}:** at the specified location.`)
        .join("\n");
    }

    // STEP 2: Generate composite image with all products at once
    console.log("Generating multi-product composite...");

    // Prepare all product image parts
    const productImageParts = placedProducts.map((placedProduct: any) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: placedProduct.productBase64,
      },
    }));

    const cleanSceneImagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: sceneBase64,
      },
    };

    // Build comprehensive prompt for multiple products
    const productList = placedProducts
      .map(
        (placedProduct: any, index: number) =>
          `${index + 1}. ${placedProduct.description}`
      )
      .join("\n");

    const prompt = `
**Role:**
You are a visual composition expert. Your task is to take multiple 'product' images and seamlessly integrate them into a 'scene' image.

**Products to add (in order):**
${productList}

**Scene to use:**
The final image provided (may have black padding, which you should ignore).

**Placement Instructions:**
${locationDescriptions}

**Final Image Requirements:**
- The output image's style, lighting, shadows, reflections, and camera perspective must exactly match the original scene.
- Each product must be intelligently re-rendered to fit the context with proper perspective, scale, and realistic shadows.
- Products must have proportional realism relative to each other and the scene.
- All products must be present in the final composite image.
- Products should not overlap unless it makes realistic sense.

The output should ONLY be the final, composed image with all products placed. Do not add any text or explanation.
`;

    console.log("Sending all images and prompt...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: {
        parts: [...productImageParts, cleanSceneImagePart, { text: prompt }],
      },
    });

    console.log("Received multi-product response.");

    const imagePartFromResponse =
      response.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData
      );

    if (imagePartFromResponse?.inlineData?.data) {
      const { data } = imagePartFromResponse.inlineData;
      console.log(`Received image data, length:`, data.length);

      const finalImageUrl = `data:image/jpeg;base64,${data}`;

      return NextResponse.json({
        finalImageUrl,
        debugImageUrl: `data:image/jpeg;base64,${markedSceneBase64}`,
        finalPrompt: prompt,
      });
    }

    console.error("Model response did not contain an image part.", response);
    throw new Error("The AI model did not return an image. Please try again.");
  } catch (error) {
    console.error("Error generating multi-product composite:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
