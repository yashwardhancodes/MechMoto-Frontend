"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { rehydrateAuth } from "@/lib/redux/thunks/authThunks";
import { AppDispatch } from "@/lib/redux/store";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/custom/Loading";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
	const dispatch = useDispatch<AppDispatch>();
	const {loading} = useAuth();

	useEffect(() => {
		dispatch(rehydrateAuth());
	}, [dispatch]);

	if (loading) {
		return (<Loading />);
	}

	return <>{children}</>;
}
