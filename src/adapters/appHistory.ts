type Listener = (location: { pathname: string; search: string; state?: unknown }) => void;

const listeners = new Set<Listener>();

const notify = () => {
  const location = { pathname: window.location.hash.replace(/^#/, '') || '/finance/workspace/', search: window.location.search };
  listeners.forEach(listener => listener(location));
};

export const history = {
  push(path: string) {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
    notify();
  },
  listen(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default { history };
