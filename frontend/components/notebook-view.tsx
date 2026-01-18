'use client';

interface NotebookSection {
  title: string;
  content: string;
}

interface NotebookData {
  title?: string;
  sections?: NotebookSection[];
}

interface NotebookViewProps {
  data?: NotebookData;
}

export function NotebookView({ data }: NotebookViewProps) {
  if (!data || !data.sections || data.sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p>No notebook content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Notebook Title */}
      <h1 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-gray-800">
        {data.title || 'Study Notebook'}
      </h1>

      {/* Sections */}
      <div className="space-y-8">
        {data.sections.map((section, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4 flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600/30 rounded-full flex items-center justify-center text-sm font-bold text-indigo-300">
                {idx + 1}
              </span>
              {section.title}
            </h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      {data.sections.length > 3 && (
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {data.sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const element = document.querySelector(`[data-section="${idx}"]`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
