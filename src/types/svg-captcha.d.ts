declare module 'svg-captcha' {
  export interface ConfigObject {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
  }
  
  export function create(options?: ConfigObject): { data: string; text: string };
  export function createMathExpr(options?: ConfigObject): { data: string; text: string };
}
