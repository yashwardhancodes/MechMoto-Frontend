import { logout, User } from "@/lib/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { useDispatch, useSelector } from "react-redux"

interface useAuthType {
    isLoggedIn: boolean,
    user: User | null,
    loading: boolean,
    signOut: () => void,
    role: string | undefined
}

const useAuth = (): useAuthType => {
    const dispatch = useDispatch<AppDispatch>();

    const {user, token, loading} = useSelector((state: RootState) => state.auth);


    const signOut = () => {
        dispatch(logout());
    }

    const isLoggedIn = !!user && !!token;

    const role = user?.role.name;

    return {isLoggedIn, user, loading, signOut, role}
}

export default useAuth;