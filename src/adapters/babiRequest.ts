export const get = <T,>(_url: string) => async (): Promise<T> => ({ total: 4 } as T);
export const post = <T,>(_url: string) => async (): Promise<T> => ({} as T);
export const babiRequest = { instance: { interceptors: { request: { use: () => {} } } } };
