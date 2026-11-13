import { useNavigate } from 'react-router-dom';

export const useHistory = () => {
  const navigate = useNavigate();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
  };
};

export const matchPath = (..._args: unknown[]) => null;
