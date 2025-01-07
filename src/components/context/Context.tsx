import React, { useState, createContext, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import Snackbar from "@ui/Snackbar/Snackbar";

interface ButtonCreateProviderProps {
    children: React.ReactNode
}

type SnackbarContextType = {
    showSnackbar: (message: string, type: "success" | "error" | "info" | "warning") => void;
};

export const ButtonCreateContext = createContext({ buttonOn: false, setButtonOn: (buttonOn: boolean) => { } });
export const FilterContext = createContext({ filterOpen: false, setFilterOpen: (filterOpen: boolean) => { } });
export const FilterOpenContext = createContext({ filterOn: false, setFilterOn: (filterOn: boolean) => { } });
export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);


export const ContextProvider = ({ children }: ButtonCreateProviderProps) => {
    const [buttonOn, setButtonOn] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterOn, setFilterOn] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(
        null
    );

    const showSnackbar = useCallback((message: string, type: "success" | "error" | "info" | "warning") => {
        setSnackbar({ message, type });
        setTimeout(() => {
            setSnackbar(null);
        }, 3000); // Auto dismiss after 3 seconds
    }, []);

    const handleClose = () => setSnackbar(null);

    const location = useLocation();

    useEffect(() => {
        setButtonOn(false);
        setFilterOpen(false);
    }, [location.pathname]);

    return (
        <ButtonCreateContext.Provider value={{ buttonOn, setButtonOn }}>
            <FilterContext.Provider value={{ filterOpen, setFilterOpen }}>
                <FilterOpenContext.Provider value={{ filterOn, setFilterOn }}>
                    <SnackbarContext.Provider value={{ showSnackbar }}>
                        {children}
                        {snackbar && (
                            <Snackbar message={snackbar.message} type={snackbar.type} onClose={handleClose} />
                        )}
                    </SnackbarContext.Provider>
                </FilterOpenContext.Provider>
            </FilterContext.Provider>
        </ButtonCreateContext.Provider>
    );
}