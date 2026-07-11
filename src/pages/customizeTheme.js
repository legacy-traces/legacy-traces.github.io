import { createTheme } from '@mui/material/styles';

// Scoped to the Customize page only — rest of the app stays Tailwind.
// Mirrors the site's brand color (`--color-primary: #00e676`) and fonts.
// Built per-mode so the editor follows the app's light/dark toggle instead of
// being locked to light like it used to be.
const makeCustomizeTheme = (mode) => createTheme({
    palette: {
        mode,
        primary:   { main: '#00e676', contrastText: '#000000' },
        secondary: { main: '#1565c0' },
        ...(mode === 'light'
            ? {
                background: { default: '#f9fafb', paper: '#ffffff' },
            }
            : {
                // Matches the app shell's dark background (#121212) so the
                // editor doesn't look like a different site in dark mode.
                background: { default: '#121212', paper: '#1e1e1e' },
            }),
    },
    typography: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: { minHeight: 48, fontSize: '0.7rem', fontWeight: 600 },
            },
        },
    },
});

export default makeCustomizeTheme;
