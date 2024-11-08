import {useContext} from "react";
import {ButtonCreateContext, FilterContext, FilterOpenContext} from "./Context.tsx";

export const useButtonCreate = () => {
    return useContext(ButtonCreateContext)
}

export const useFilterOpen = () => {
    return useContext(FilterContext)
}

export const useFilterOn = () => {
    return useContext(FilterOpenContext)
}