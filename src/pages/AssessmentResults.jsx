import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AssessmentResults() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Results</h2>
          <p className="text-gray-600">
            Charts, graphs, and detailed results will be displayed here.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            This page will show visual analytics using Recharts once connected to storage.
          </p>
        </div>
      </div>
    </div>
  );
}
