import { createContext, useContext } from 'react';

const SelectedComponentContext = createContext();

export const useSelectedComponent = () => useContext(SelectedComponentContext);
