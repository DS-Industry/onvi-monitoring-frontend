import React, {useState, createContext, useEffect} from "react";
import { useLocation } from 'react-router-dom';

interface ButtonCreateProviderProps{
    children: React.ReactNode
}

export const ButtonCreateContext = createContext({buttonOn: false, setButtonOn: (buttonOn: boolean) => {}});
export const FilterContext = createContext({filterOpen: false, setFilterOpen: (filterOpen: boolean) => {}});

export const ContextProvider = ({ children }: ButtonCreateProviderProps) => {
    const [buttonOn, setButtonOn] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const location = useLocation();

    useEffect(() => {
        setButtonOn(false);
        setFilterOpen(false);
        }, [location.pathname]);

    return (
        <ButtonCreateContext.Provider value={{buttonOn, setButtonOn}}>
            <FilterContext.Provider value={{filterOpen, setFilterOpen}}>
                {children}
            </FilterContext.Provider>
        </ButtonCreateContext.Provider>
    );
}