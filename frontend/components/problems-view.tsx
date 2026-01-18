'use client';

import { useState } from 'react';

interface Problem {
  question: string;
  solution: string;
}

interface ProblemsData {
  title?: string;
  problems?: Problem[];
}

interface ProblemsViewProps {
  data?: ProblemsData;
}

export function ProblemsView({ data }: ProblemsViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set());

  const problems = data?.problems || [];

  if (!problems.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p>No practice problems available</p>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Expand all solutions when submitted
    setExpandedSolutions(new Set(problems.map((_, idx) => idx)));
  };

  const handleReset = () => {
    setSubmitted(false);
    setAnswers({});
    setExpandedSolutions(new Set());
  };

  const toggleSolution = (idx: number) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedSolutions(newExpanded);
  };

  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {data?.title || 'Practice Problems'}
          </h2>
          <p className="text-gray-400 mt-1">
            {submitted
              ? `Submitted! Review your answers below.`
              : `${answeredCount} of ${problems.length} answered`}
          </p>
        </div>
        {submitted ? (
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Submit Answers
          </button>
        )}
      </div>

      {/* Problems */}
      <div className="space-y-6">
        {problems.map((problem, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg overflow-hidden">
            {/* Question */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </span>
                <p className="text-white text-lg flex-1 pt-1">{problem.question}</p>
              </div>

              {/* Answer Input */}
              {!submitted ? (
                <textarea
                  value={answers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-32 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
                />
              ) : (
                <div className="space-y-4">
                  {/* User's Answer */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Your Answer:</p>
                    <p className="text-white whitespace-pre-wrap">
                      {answers[idx]?.trim() || '(No answer provided)'}
                    </p>
                  </div>

                  {/* Solution Toggle */}
                  <button
                    onClick={() => toggleSolution(idx)}
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSolutions.has(idx) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {expandedSolutions.has(idx) ? 'Hide Solution' : 'Show Solution'}
                  </button>

                  {/* Solution */}
                  {expandedSolutions.has(idx) && (
                    <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                      <p className="text-green-400 text-sm mb-2 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Solution:
                      </p>
                      <p className="text-gray-200 whitespace-pre-wrap">{problem.solution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Submit Button */}
      {!submitted && problems.length > 2 && (
        <div className="mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            Submit All Answers ({answeredCount} of {problems.length} answered)
          </button>
        </div>
      )}
    </div>
  );
}
