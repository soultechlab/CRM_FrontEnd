export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    sidebar: string;
    header: string;
    text: string;
    buttonPrimary: string;
    buttonSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      subheading: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    base: string;
    small: string;
    medium: string;
    large: string;
  };
}