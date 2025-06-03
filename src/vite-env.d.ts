




interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SPOONACULAR_API_KEY: string;
  readonly VITE_SPOONACULAR_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@radix-ui/react-checkbox' {
  export * from '@radix-ui/react-checkbox';
}

declare module '@radix-ui/react-label' {
  export * from '@radix-ui/react-label';
}

declare module '@radix-ui/react-select' {
  export * from '@radix-ui/react-select';
}

declare module '@radix-ui/react-tabs' {
  export * from '@radix-ui/react-tabs';
}

declare module '@radix-ui/react-dialog' {
  export * from '@radix-ui/react-dialog';
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
  
  declare module '*.svg' {
    import React = require('react');
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }
  
  declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
  }
  
  declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
  }
  
  declare module '../pages/ForgotPassword' {
    const ForgotPassword: React.FC;
    export default ForgotPassword;
  }
  
  declare module '../pages/ResetPassword' {
    const ResetPassword: React.FC;
    export default ResetPassword;
  }