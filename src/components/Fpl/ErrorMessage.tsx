interface Props {
  error: Error;
  retry?: () => void;
}

const ErrorMessage: React.FC<Props> = ({ error, retry }) => {
  return (
    <div className="bg-red-50 p-4 rounded-md">
      <h3 className="text-red-800 font-medium">Ett fel uppstod</h3>
      <p className="text-red-700 mt-1">{error.message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="mt-2 text-red-600 hover:text-red-500"
        >
          Försök igen
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 