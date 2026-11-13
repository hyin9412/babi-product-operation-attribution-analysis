// CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.less' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.scss' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.module.sass' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.css?module' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.less?module' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.scss?module' {
  const classes: CSSModuleClasses;
  export default classes;
}
declare module '*.sass?module' {
  const classes: CSSModuleClasses;
  export default classes;
}

// CSS
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

// images
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';

  const Component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Component;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
