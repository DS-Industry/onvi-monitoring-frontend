import useUserStore from "../store/userSlice";
import { User } from "../store/userSlice";

export const useUser = () => {
    return useUserStore((state) => state.user as User);
};

export const useSetUser = () => {
    return useUserStore((state) => state.setUser);
};

export const useClearUserData = () => {
    return useUserStore((state) => state.clearUserData);
};