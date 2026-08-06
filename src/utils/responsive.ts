import { useTheme, useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: useMediaQuery(theme.breakpoints.down('md')),
  };
};

export const getResponsiveValue = <T>(
  isMobile: boolean,
  mobileValue: T,
  desktopValue: T
): T => {
  return isMobile ? mobileValue : desktopValue;
};

export const getResponsiveGridCols = (isMobile: boolean): number => {
  return isMobile ? 1 : 12;
};

export const getResponsiveSpacing = (isMobile: boolean): number => {
  return isMobile ? 1 : 2;
};

export const getResponsiveButtonSize = (isMobile: boolean): 'small' | 'medium' | 'large' => {
  return isMobile ? 'large' : 'medium';
};

export const getResponsiveTextFieldSize = (isMobile: boolean): 'small' | 'medium' => {
  return isMobile ? 'medium' : 'small';
};

export const getResponsiveDataGridHeight = (isMobile: boolean, rowCount: number): number => {
  const baseHeight = 400;
  const rowHeight = 52;
  const headerHeight = 56;
  const mobileAdjustment = isMobile ? 100 : 0;
  
  return Math.min(baseHeight + (rowCount * rowHeight) + headerHeight + mobileAdjustment, 800);
};

export const getResponsiveCardWidth = (isMobile: boolean): string | number => {
  return isMobile ? '100%' : 400;
};

export const getResponsiveDialogMaxWidth = (isMobile: boolean): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  if (isMobile) return 'xs';
  return 'md';
};

export const getResponsiveDrawerWidth = (isMobile: boolean): number => {
  return isMobile ? 280 : 320;
};

export const getResponsiveAppBarHeight = (isMobile: boolean): number => {
  return isMobile ? 56 : 64;
};
