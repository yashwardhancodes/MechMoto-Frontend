interface ErrorMessageProps {
  message: string;
  action?: () => void;
  actionText?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, action, actionText }) => (
  <div className="p-10 text-center">
    <p className="text-red-500 text-lg">{message}</p>
    {action && actionText && (
      <button
        onClick={action}
        className="mt-4 px-6 py-2 bg-[#6BDE23] text-black rounded-full"
      >
        {actionText}
      </button>
    )}
  </div>
);
export default ErrorMessage;