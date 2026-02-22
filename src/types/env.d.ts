/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_SPOONACULAR_API_KEY: string;
    VITE_SPOONACULAR_API_HOST: string;
    VITE_API_BASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SPOONACULAR_API_KEY: string;
  readonly VITE_SPOONACULAR_API_HOST: string;
  readonly VITE_API_BASE_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type extensions
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

// Add type definitions for Radix UI components
declare module '@radix-ui/react-label' {
  export const Root: unknown;
  // Add other exports as needed
}

declare module '@radix-ui/react-select' {
  export const Root: unknown;
  export const Trigger: unknown;
  export const Value: unknown;
  export const Icon: unknown;
  export const Portal: unknown;
  export const Content: unknown;
  export const Viewport: unknown;
  export const Label: unknown;
  export const Item: unknown;
  export const ItemText: unknown;
  export const ItemIndicator: unknown;
  export const Group: unknown;
  export const Separator: unknown;
  // Add other exports as needed
}

declare module '@radix-ui/react-tabs' {
  export const Root: unknown;
  export const List: unknown;
  export const Trigger: unknown;
  export const Content: unknown;
  // Add other exports as needed
}
