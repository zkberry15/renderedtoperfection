import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AspectRatio, BodyType, ImageGenerationOptions, BodyTypeDetails, Gender } from '../types';
import { BODY_TYPE_DETAILS } from '../constants';

// Utility to remove the data URI prefix (e.g., "data:image/png;base64,")
const cleanBase64 = (base64String: string): string => {
  const parts = base64String.split(',');
  if (parts.length > 1) {
    return parts[1];
  }
  return base64String;
};

// Utility to extract MIME type from data URI
const getMimeType = (base64String: string): string => {
  const match = base64String.match(/^data:(.*?);base64,/);
  return match ? match[1] : 'image/png'; // Default to png if not found
};

export const generateEditedImage = async (
  primaryImageBase64: string,
  options: ImageGenerationOptions,
  secondaryImageBase64: string | null = null, // New optional parameter for second reference image
): Promise<string | null> => {
  // Create a new GoogleGenAI instance before each API call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const primaryCleanedImageBase64 = cleanBase64(primaryImageBase64);
  const primaryMimeType = getMimeType(primaryImageBase64);

  const { prompt, bodyType, style, aspectRatio, customWeightPounds, gender } = options;
  const bodyTypeDetail: BodyTypeDetails = BODY_TYPE_DETAILS[bodyType];

  let bodyTypeInstruction = '';
  if (bodyType !== BodyType.ORIGINAL) {
    bodyTypeInstruction = `Adjust the subject's body type to ${bodyTypeDetail.label} while maintaining original proportions as much as possible, roughly corresponding to ${bodyTypeDetail.weightRange}.`;
  } else {
    bodyTypeInstruction = bodyTypeDetail.description; // "Maintain the subject's original body weight..."
  }

  // Add custom weight and gender instructions if provided
  let additionalInstructions = '';
  if (gender && gender !== Gender.UNSPECIFIED) {
    additionalInstructions += `The subject is a ${gender}. `;
  }
  if (customWeightPounds) {
    additionalInstructions += `Target weight approximately ${customWeightPounds} pounds, ensuring face weight is consistent with body proportions.`;
  }

  // Construct the comprehensive instruction for the model
  const fullPrompt = `
    Edit this image: ${prompt}.
    Preserve all inherent physical characteristics of the subject(s) including body, size, shape, proportions, and any distinctive features like headgear, glasses, tattoos, or scars.
    Apply the style: ${style}.
    ${bodyTypeInstruction}
    ${additionalInstructions}
    Generate an image based on these combined instructions.
  `.trim();

  const contentsParts: Part[] = [];

  // Add primary image
  contentsParts.push({
    inlineData: {
      data: primaryCleanedImageBase64,
      mimeType: primaryMimeType,
    },
  });

  // Add secondary image if provided
  if (secondaryImageBase64) {
    const secondaryCleanedImageBase64 = cleanBase64(secondaryImageBase64);
    const secondaryMimeType = getMimeType(secondaryImageBase64);
    contentsParts.push({
      inlineData: {
        data: secondaryCleanedImageBase64,
        mimeType: secondaryMimeType,
      },
    });
  }

  // Add the text prompt
  contentsParts.push({
    text: fullPrompt,
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contentsParts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize is not supported for gemini-2.5-flash-image
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:${primaryMimeType};base64,${base64EncodeString}`; // Use primary mimeType for response
      }
    }
    return null; // No image part found
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    } else {
      console.error('Unknown error during image generation:', error);
      throw new Error('An unknown error occurred during image generation.');
    }
  }
};

export const checkApiKeyStatus = async (): Promise<boolean> => {
  if (!window.aistudio || !window.aistudio.hasSelectedApiKey) {
    console.warn("window.aistudio not available. Cannot check API key status.");
    return false;
  }
  return await window.aistudio.hasSelectedApiKey();
};

export const openApiKeySelection = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
    console.log("API key selection dialog opened. Assuming user will select a key.");
  } else {
    console.warn("window.aistudio.openSelectKey not available. Cannot open API key selection dialog.");
    alert(
      "API key selection is not available in this environment. " +
      "Please ensure you are running this app in a compatible AI Studio environment."
    );
  }
};