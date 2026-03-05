import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-icce-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-strong p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-icce-dark tracking-tight mb-3">
              FITGAP Assessment
            </h2>
            <p className="text-lg text-gray-600 font-medium mb-4">
              Feedback-Informed Treatment GAP Assessment Tool
            </p>
            <div className="bg-icce-teal/5 rounded-xl p-5 mt-6 border border-icce-teal/20">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Feedback-Informed Treatment (FIT) is an evidence-based approach that uses client feedback to improve therapeutic outcomes.
                The FITGAP Assessment Tool helps organizations evaluate their current implementation of FIT practices and identify
                areas for development across four key realms: Alliance, Outcome Monitoring, Clinical Decision Making, and Organizational Support.
              </p>
              <p className="text-sm text-gray-600">
                For more information on Training and Consultancy please email{' '}
                <a
                  href="mailto:info@centerforclinicalexcellence.com"
                  className="font-semibold text-icce-teal hover:text-icce-teal-dark transition-colors"
                >
                  info@centerforclinicalexcellence.com
                </a>
              </p>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="space-y-4 mb-10">
            <button
              onClick={signIn}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-icce-teal to-icce-teal-dark hover:from-icce-teal-dark hover:to-icce-teal shadow-medium hover:shadow-strong transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={signUp}
              className="group relative w-full flex justify-center py-4 px-6 border-2 border-icce-teal text-lg font-bold rounded-xl text-icce-teal bg-white hover:bg-icce-teal hover:text-white transition-all duration-200"
            >
              Create Account
            </button>
          </div>

          {/* Partnership Section */}
          <div className="border-t-2 border-gray-100 pt-8">
            <p className="text-center text-sm text-gray-600 font-semibold mb-6 uppercase tracking-wider">
              Built for
            </p>

            {/* ICCE Logo */}
            <div className="flex justify-center mb-6">
              <a
                href="https://centerforclinicalexcellence.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="/images/icce-logo.png"
                  alt="International Center for Clinical Excellence"
                  className="h-14 object-contain"
                />
              </a>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <p className="text-sm text-gray-500 font-semibold">by</p>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* OpenFIT Logo */}
            <div className="flex justify-center mt-6">
              <a
                href="https://openfit.care"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src="/images/openfit-logo.png"
                  alt="OpenFIT.care"
                  className="h-14 object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
