import { createContext } from 'react';
const VMSContext = createContext({
    isTemplateLoading: false,
    isLanguageLoading: false,
});

export default VMSContext;
