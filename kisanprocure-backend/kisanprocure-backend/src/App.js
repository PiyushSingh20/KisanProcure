import { jsx as _jsx } from "react/jsx-runtime";
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './context/LanguageContext';
export default function App() {
    return (_jsx(LanguageProvider, { children: _jsx(RouterProvider, { router: router }) }));
}
