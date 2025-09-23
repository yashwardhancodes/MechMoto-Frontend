import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";

interface CheckoutPopupProps {
  onClose: () => void;
}

export default function CheckoutPopup({ onClose }: CheckoutPopupProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-lg p-6 sm:w-96 md:w-96 w-[85%] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center sm:text-left">
          Sign in to Continue
        </h2>

        <p className="text-gray-600 mb-6 text-sm text-center sm:text-left">
          You need an account to place your order. Sign in for faster checkout,
          or continue as a guest.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Sign In / Sign Up */}
          <button
            onClick={() => {
              dispatch(setRedirect("/products/cart/select-address"));
              router.push("/auth/login");
              onClose();
            }}
            className="bg-[#9AE144] hover:bg-[#89CC33] text-black font-medium rounded-full transition py-2 text-sm sm:py-2 sm:text-base"
          >
            Sign In / Sign Up
          </button>

          {/* Guest Checkout */}
          <button
            onClick={() => {
              router.push("/products/cart/select-address");
              onClose();
            }}
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-full transition py-2 text-sm sm:py-2 sm:text-base"
          >
            Continue as Guest
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
