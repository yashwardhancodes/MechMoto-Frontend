export interface RazorpayOptions {
	key: string;
	amount: number;
	currency: string;
	name: string;
	description: string;
	order_id: string;
	handler: (response: {
		razorpay_order_id: string;
		razorpay_payment_id: string;
		razorpay_signature: string;
	}) => void;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	theme?: {
		color?: string;
	};
}

interface Razorpay {
	new (options: RazorpayOptions): {
		open: () => void;
		on: (event: string, callback: (response: any) => void) => void;
	};
}

declare global {
	interface Window {
		Razorpay: Razorpay;
	}
}

export {};
