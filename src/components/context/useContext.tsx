import {useContext} from "react";
import {ButtonCreateContext, FilterContext} from "./Context.tsx";

export const useButtonCreate = () => {
    return useContext(ButtonCreateContext)
}

export const useFilterOpen = () => {
    return useContext(FilterContext)
}