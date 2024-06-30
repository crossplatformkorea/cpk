import type {DoobooThemeParams} from '@dooboo-ui/theme';

export const colors = {
  apple: '#000000',
  google: '#E04238',
  facebook: '#345997',
};

export const light = {
  brand: '#343434',
  text: {
    placeholderContrast: '#909090',
  },
};

export type CustomAppTheme = typeof light & DoobooThemeParams;

export const dark: typeof light = {
  brand: '#171717',
  text: {
    placeholderContrast: '#787878',
  },
};

export const theme = {
  light,
  dark,
};
