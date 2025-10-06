import type { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
	userId: string;
	token: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { userId, token } = req.body as RequestBody;

	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}firebase/register-token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, token }),
	});

	const data = await response.json();
	res.status(response.status).json(data);
}
