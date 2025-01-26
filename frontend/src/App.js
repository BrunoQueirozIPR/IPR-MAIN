import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";

import Routes from "./routes";

import "./assets/css/style.css";
import 'typeface-roboto';

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(preers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        []
    );

    const theme = createTheme({
        scrollbarStyles: {
            "&::-webkit-scrollbar": {
                width: '8px',
                height: '8px',
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#576784",
            },
        },
        scrollbarStylesSoft: {
            "&::-webkit-scrollbar": {
                width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: mode === "light" ? "#F3F3F3" : "#232d45",
            },
        },
        palette: {
            type: mode,
            background: {
                default: mode === "light" ? "#fafafa" : "#232d45",
                paper: mode === "light" ? "#fff" : "#232d45"
            },
            primary: { main: "#354567" },
            textPrimary: mode === "light" ? "#354567" : "#FFFFFF",
            borderPrimary: mode === "light" ? "#354567" : "#FFFFFF",
            dark: { main: mode === "light" ? "#232d45" : "#232d45" },
            light: { main: mode === "light" ? "#F3F3F3" : "#232d45"},
            tabHeaderBackground: mode === "light" ? "#EEE" : "#232d45",
            optionsBackground: mode === "light" ? "#fafafa" : "#232d45",
            fancyBackground: mode === "light" ? "#fafafa" : "#232d45",
            total: mode === "light" ? "#fff" : "#232d45",
            messageIcons: mode === "light" ? "gray" : "#F3F3F3",
            inputBackground: mode === "light" ? "#FFFFFF" : "#232d45",
            barraSuperior: mode === "light" ? "#FFFFFF" : "#232d45",
        },
        mode,
        typography: {
            fontFamily: 'Roboto, sans-serif',
        },
        components: {
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: "25px",
                        overflow: "hidden"
                    }
                }
            }
        }
    },
    locale
);

useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
        i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
        setLocale(ptBR);
    }
}, []);

useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem("preferredTheme", mode);
}, [mode]);

return (
    <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Routes />
            </QueryClientProvider>
        </ThemeProvider>
    </ColorModeContext.Provider>
);
};

export default App;
