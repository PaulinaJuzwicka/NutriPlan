



import * as React from 'react';

declare module 'react' {
  
  export * from '@types/react';
  
  
  
  
  
  
  
}


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
