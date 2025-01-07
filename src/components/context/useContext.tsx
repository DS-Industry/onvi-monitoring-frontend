import {useContext} from "react";
import {ButtonCreateContext, FilterContext, FilterOpenContext, SnackbarContext} from "./Context.tsx";

export const useButtonCreate = () => {
    return useContext(ButtonCreateContext)
}

export const useFilterOpen = () => {
    return useContext(FilterContext)
}

export const useFilterOn = () => {
    return useContext(FilterOpenContext)
}

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};