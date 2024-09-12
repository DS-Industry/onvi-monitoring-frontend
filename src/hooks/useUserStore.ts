import useUserStore from "../store/userSlice";
import { User, Tokens } from "../store/userSlice";

export const useUser = () => {
    return useUserStore((state) => state.user as User);
};

export const useTokens = () => {
    return useUserStore((state) => state.tokens as Tokens)
}

export const useSetUser = () => {
    return useUserStore((state) => state.setUser);
};

export const useClearUserData = () => {
    return useUserStore((state) => state.clearUserData);
};