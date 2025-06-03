


declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}


declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}


import 'react';

declare global {
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      
      className?: string;
      style?: React.CSSProperties;
    }
  }
}
