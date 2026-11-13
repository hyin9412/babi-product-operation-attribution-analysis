export const REQUEST_START = 'request_start';
export const REQUEST_END = 'request_end';
export const RENDER_END = 'render_end';

const instance = { mark: (..._args: unknown[]) => {} };
export const workspaceInstance = instance;
export const workspaceInteractionInstance = instance;
