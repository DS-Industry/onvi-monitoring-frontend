import React from "react";

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          404 - Page Not Found
        </h2>
        <p className="text-gray-600 text-center mb-8">
          The page you are looking for does not exist.
        </p>
        <div className="flex justify-center">
          <a
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
