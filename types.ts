export enum AspectRatio {
  ONE_TO_ONE = '1:1',
  THREE_TO_FOUR = '3:4',
  FOUR_TO_THREE = '4:3',
  NINE_TO_SIXTEEN = '9:16',
  SIXTEEN_TO_NINE = '16:9',
}

export enum BodyType {
  ORIGINAL = 'Original Keep Weight',
  PETIT = 'Petit', // 100-125 pounds
  CURVY = 'Curvy', // 130-160 pounds
  PLUS_SIZED = 'Plus-sized', // 180-250 pounds
  HEAVY_FAT = 'Heavy/Fat', // 300+ pounds
  OBESE = 'Obese', // 500+ pounds, including face weight
}

export enum Style {
  HYPER_REALISTIC = 'Hyper Realistic',
  ANIME = 'Anime',
  CARTOON = 'Cartoon',
  IMPRESSIONISTIC = 'Impressionistic',
  CYBERPUNK = 'Cyberpunk',
  PIXEL_ART = 'Pixel Art',
}

export enum Gender {
  UNSPECIFIED = 'Unspecified',
  MAN = 'Man',
  WOMAN = 'Woman',
}

export interface ImageGenerationOptions {
  prompt: string;
  bodyType: BodyType;
  style: Style;
  aspectRatio: AspectRatio;
  customWeightPounds?: number; // New optional field for custom weight
  gender?: Gender; // New optional field for gender
}

export interface GeneratedImage {
  id: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  optionsUsed: ImageGenerationOptions;
  originalImageBase64: string;
}

export interface BodyTypeDetails {
  label: string;
  description: string;
  weightRange?: string;
}