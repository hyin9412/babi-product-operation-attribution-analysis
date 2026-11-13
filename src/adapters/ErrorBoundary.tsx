import React from 'react';

export default function ErrorBoundary<P>(Component: React.ComponentType<P>) {
  return (props: P) => <Component {...props} />;
}
