import { GoogleGenAI } from "@google/genai";

// NOTE: Do not instantiate GoogleGenAI globally. 
// It must be instantiated inside functions to pick up the dynamically selected API_KEY.

/**
 * Converts a File object to a Base64 string, resizing it to max 800px and converting to JPEG.
 * This prevents 'Rpc failed due to xhr error' caused by large payloads.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        // Reduced from 1024 to 800 to aggressively prevent payload size errors
        const MAX_SIZE = 800;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }

        // Fill background with white to handle transparent PNGs converting to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 0.7 quality for optimal API payload size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Estimates the visible floor area in square feet using Gemini 2.5 Flash (text model).
 * Uses temperature: 0 for deterministic results (consistent output for same image).
 */
export const estimateFloorArea = async (imageBase64: string): Promise<number> => {
    try {
        // Instantiate here to ensure process.env.API_KEY is up to date
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKey || "" });
        const model = 'gemini-3-flash-preview';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: 'image/jpeg',
                        },
                    },
                    {
                        text: "Analyze this room image to estimate the visible floor surface area. Ignore walls and ceiling. Return a single integer representing square feet (e.g., 200). If it's a small bathroom, estimate 40-80. If it's a living room, 200-400. Return ONLY the number.",
                    },
                ],
            },
            config: {
                temperature: 0, // Force deterministic output
            }
        });

        const text = response.text || "250";
        const number = parseInt(text.replace(/[^0-9]/g, ''), 10);
        return isNaN(number) ? 250 : number;
    } catch (error) {
        console.warn("Failed to estimate floor area, defaulting to 250", error);
        return 250;
    }
};

/**
 * Generates a new version of the image based on the prompt using Gemini 3.1 Flash Image Preview.
 * Upgraded to 3.1 Flash for better reliability and performance.
 */
export const generateTilePreview = async (
  imageBase64: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    // Instantiate here to ensure process.env.API_KEY is up to date
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey || "" });
    
    // Check if a key was explicitly selected via the AI Studio dialog
    // If so, we can use the higher-quality 3.1 model.
    // Otherwise, default to 2.5 Flash Image which works with the free tier key.
    let isExplicitlySelected = false;
    if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        isExplicitlySelected = await (window as any).aistudio.hasSelectedApiKey();
    }

    let model = isExplicitlySelected ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';

    const generate = async (selectedModel: string) => {
      const config: any = {};
      
      // imageConfig is only supported for nano banana series (2.5 flash image, 3.x flash image)
      // but 2.5 flash image doesn't support imageSize '1K' in the same way 3.1 does.
      if (selectedModel.includes('3.1') || selectedModel.includes('3-pro')) {
        config.imageConfig = {
          imageSize: '1K',
        };
      }

      return await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
            {
              text: `Edit this image strictly following these instructions: ${prompt}. Maintain the original perspective, lighting, and structural elements of the room exactly. Render with high photorealism and 3D depth.`,
            },
          ],
        },
        config
      });
    };

    let response;
    try {
      console.log(`Attempting generation with model: ${model}`);
      response = await generate(model);
    } catch (err: any) {
      // If 403 Permission Denied and we were trying 3.1, fallback to 2.5
      const errorString = err.message || String(err);
      if ((errorString.includes("403") || errorString.includes("PERMISSION_DENIED")) && model !== 'gemini-2.5-flash-image') {
        console.warn(`${model} access denied. Falling back to Gemini 2.5 Flash Image...`);
        model = 'gemini-2.5-flash-image';
        response = await generate(model);
      } else {
        console.error("Generation failed:", err);
        throw err;
      }
    }

    console.log("Response received from Gemini:", response);

    // Extract the image from the response
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const extractedImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            console.log("Successfully extracted image from response.");
            return extractedImage;
          }
        }
      }
    }

    console.error("No image data found in response parts. Response structure:", JSON.stringify(response, null, 2));
    throw new Error("The AI generated a response but no image data was found. This can happen if the prompt is too restrictive or the model is under heavy load.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};