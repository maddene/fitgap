import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AssessmentForm() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Form</h2>
          <p className="text-gray-600">
            The assessment form with all questions will be implemented here.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            This page needs to be connected to the Netlify Blobs storage after deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
