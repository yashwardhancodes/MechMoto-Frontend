import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dtcApi = createApi({
	reducerPath: "dtcApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL + "dtc",
		prepareHeaders: (headers, { getState }: any) => {
			const token = getState().auth.token;
			if (token) headers.set("Authorization", `Bearer ${token}`);
			return headers;
		},
	}),
	tagTypes: ["DTC"],
	endpoints: (builder) => ({
		getAllDtcs: builder.query<
			any,
			{ page?: number; limit?: number; search?: string; system?: string }
		>({
			query: (params) => ({ url: "", params }),
			providesTags: ["DTC"],
		}),
		getDtcSystems: builder.query<any, void>({
			query: () => "/systems",
			providesTags: ["DTC"],
		}),
		getDtcById: builder.query<any, string>({
			query: (id) => `/${id}`,
			providesTags: ["DTC"],
		}),
		createDtc: builder.mutation<any, any>({
			query: (data) => ({ url: "", method: "POST", body: data }),
			invalidatesTags: ["DTC"],
		}),
		updateDtc: builder.mutation<any, { id: string } & Partial<any>>({
			query: ({ id, ...data }) => ({
				url: `/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["DTC"],
		}),
		deleteDtc: builder.mutation<void, number>({
			query: (id) => ({ url: `/${id}`, method: "DELETE" }),
			invalidatesTags: ["DTC"],
		}),
		searchDtc: builder.query<any, string>({
			query: (code) => `/search?code=${code}`,
		}),
	}),
});

export const {
	useGetAllDtcsQuery,
	useGetDtcSystemsQuery,
	useGetDtcByIdQuery,
	useCreateDtcMutation,
	useUpdateDtcMutation,
	useDeleteDtcMutation,
	useSearchDtcQuery,
} = dtcApi;
