import React from 'react';

import { EntityDTO } from 'APP/api-lib/platform/account/entity';

import Home from './Home';

interface IWorkbenchContextState {
  currentTab: string | undefined;
  changeTab: (tab: string) => void;
  productRes: EntityDTO[];
  productLineRes: EntityDTO[];
  appRes: EntityDTO[];
  secondProductLineRes: EntityDTO[];
  subProductRes?: EntityDTO[];
  secondProductRes?: EntityDTO[];
  loading: boolean;
}
export const WorkbenchContext = React.createContext<IWorkbenchContextState>({
  currentTab: '',
  changeTab: () => {},
  productRes: [],
  productLineRes: [],
  appRes: [],
  secondProductLineRes: [],
  subProductRes: [],
  secondProductRes: [],
  loading: false,
});

export interface IWorkbenchProviderProps {
  children?: React.ReactNode;
  value: IWorkbenchContextState;
}
export const WorkbenchProvider = (props: IWorkbenchProviderProps) => {
  return <WorkbenchContext.Provider value={props.value}>{props.children}</WorkbenchContext.Provider>;
};

const Workbench = () => {
  return <Home />;
};

export default Workbench;
