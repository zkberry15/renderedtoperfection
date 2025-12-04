import { AspectRatio, BodyType, Style, BodyTypeDetails, Gender } from './types';

export const ASPECT_RATIOS: AspectRatio[] = [
  AspectRatio.ONE_TO_ONE,
  AspectRatio.THREE_TO_FOUR,
  AspectRatio.FOUR_TO_THREE,
  AspectRatio.NINE_TO_SIXTEEN,
  AspectRatio.SIXTEEN_TO_NINE,
];

export const BODY_TYPE_DETAILS: Record<BodyType, BodyTypeDetails> = {
  [BodyType.ORIGINAL]: {
    label: 'Original Keep Weight',
    description: 'Maintain the subject\'s original body weight and proportions from the reference image.',
  },
  [BodyType.PETIT]: {
    label: 'Petit',
    description: '100-125 pounds',
    weightRange: '100-125 pounds',
  },
  [BodyType.CURVY]: {
    label: 'Curvy',
    description: '130-160 pounds',
    weightRange: '130-160 pounds',
  },
  [BodyType.PLUS_SIZED]: {
    label: 'Plus-sized',
    description: '180-250 pounds',
    weightRange: '180-250 pounds',
  },
  [BodyType.HEAVY_FAT]: {
    label: 'Heavy/Fat',
    description: '300+ pounds',
    weightRange: '300+ pounds',
  },
  [BodyType.OBESE]: {
    label: 'Obese',
    description: '500+ pounds, ensuring consistent face weight.',
    weightRange: '500+ pounds',
  },
};

export const STYLES: Style[] = [
  Style.HYPER_REALISTIC,
  Style.ANIME,
  Style.CARTOON,
  Style.IMPRESSIONISTIC,
  Style.CYBERPUNK,
  Style.PIXEL_ART,
];

export const GENDERS: Gender[] = [
  Gender.UNSPECIFIED,
  Gender.MAN,
  Gender.WOMAN,
];

export const DEFAULT_GENERATION_COUNT = 4;
export const DEFAULT_STYLE = Style.HYPER_REALISTIC;
export const DEFAULT_ASPECT_RATIO = AspectRatio.ONE_TO_ONE;
export const DEFAULT_BODY_TYPE = BodyType.ORIGINAL;
export const DEFAULT_GENDER = Gender.UNSPECIFIED;