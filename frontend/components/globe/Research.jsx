import { useState, useEffect } from 'react';
import { ResearchService } from '@/services/research';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar
} from 'recharts';
import './Research.css';

// Helper function to safely format values, returns 'N/A' if invalid
const safeValue = (value, formatter = (v) => v) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  return formatter(value);
};

// Format percentage from decimal (0.85 -> "85%")
const formatPercent = (value) => safeValue(value, (v) => `${Math.round(v * 100)}%`);

// Format salary in k (85000 -> "$85k")
const formatSalaryK = (value) => safeValue(value, (v) => `$${(v / 1000).toFixed(0)}k`);

// Format months
const formatMonths = (value) => safeValue(value, (v) => `${v} mo`);

// Format years
const formatYears = (value) => safeValue(value, (v) => `${v} yrs`);

function Research({ curriculum }) {
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (curriculum) {
      loadResearchData();
    }
  }, [curriculum]);

  const loadResearchData = async () => {
    if (!curriculum) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Loading research data for:', curriculum.title);
      const data = await ResearchService.analyzeCurriculum(
        curriculum,
        curriculum.location.city,
        curriculum.location.country
      );
      console.log('Research data received:', data);
      setResearchData(data);
    } catch (err) {
      console.error('Failed to load research data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Unable to load research data: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!curriculum) return null;

  if (loading) {
    return (
      <div className="research-section">
        <div className="research-loading">
          <div className="loading-spinner-small"></div>
          <span>Analyzing with Woodwide AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="research-section">
        <div className="research-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!researchData) {
    return (
      <div className="research-section">
        <button className="research-load-btn" onClick={loadResearchData}>
          Load Research Analysis
        </button>
      </div>
    );
  }

  const { 
    curriculum_metrics, 
    curriculum_quality_score, 
    confidence_scores, 
    learning_outcomes,
    skill_acquisition_trajectory, 
    trajectory_data,
    industry_alignment,
    completion_forecast,
    quality_indicators
  } = researchData || {};

  // Debug logging
  console.log('Research Data:', researchData);
  console.log('Curriculum Metrics:', curriculum_metrics);

  // Format trajectory data for chart
  const chartData = skill_acquisition_trajectory?.map((point, index) => ({
    year: new Date(point.date).getFullYear(),
    proficiency: point.skill_proficiency,
    confidence_lower: point.confidence_lower,
    confidence_upper: point.confidence_upper,
    skill_level: trajectory_data?.[index]?.value || 0
  })) || [];

  return (
    <div className="research-section">
      <h3 className="research-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Research Insights
        <span className="woodwide-badge">Powered by Woodwide AI</span>
      </h3>

      {/* Curriculum Metrics with Confidence Scores */}
      <div className="research-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Topic Coverage</span>
            <span className="confidence-badge" title="Woodwide Numeric Confidence">
              ★ {Math.round(confidence_scores.overall * 100)}%
            </span>
          </div>
          <div className="metric-value">
            {curriculum_metrics?.metrics?.topic_count || curriculum?.topics?.length || 0} Topics
          </div>
          <div className="metric-subtext">
            {curriculum_metrics?.metrics?.topic_diversity || 0}% Diversity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Industry Relevance</span>
            <span className="confidence-badge" title="Woodwide Numeric Confidence">
              ★ {Math.round(confidence_scores.overall * 100)}%
            </span>
          </div>
          <div className="metric-value">
            {curriculum_metrics?.metrics?.industry_relevance_score || industry_alignment?.relevance_score || 0}%
          </div>
          <div className="metric-subtext">
            {industry_alignment?.demand_forecast?.growth_forecast || 'moderate'} demand
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Format Effectiveness</span>
            <span className="confidence-badge" title="Woodwide Numeric Confidence">
              ★ {Math.round(confidence_scores.overall * 100)}%
            </span>
          </div>
          <div className="metric-value">
            {curriculum_metrics?.metrics?.format_score || 0}/100
          </div>
          <div className="metric-subtext">
            {(curriculum?.format || curriculum_metrics?.metrics?.format_type || 'N/A').replace('-', ' ')} format
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Predicted Completion</span>
            <span className="confidence-badge" title="Woodwide Numeric Confidence">
              ★ {Math.round(confidence_scores.overall * 100)}%
            </span>
          </div>
          <div className="metric-value">
            {completion_forecast?.predicted_completion_rate || 0}%
          </div>
          <div className="metric-subtext">
            {completion_forecast?.factors?.class_size_impact || 'neutral'} impact
          </div>
        </div>
      </div>

      {/* Curriculum Quality Score */}
      <div className="rigor-index-card">
        <div className="rigor-header">
          <span className="rigor-label">Curriculum Quality Score</span>
          <span className="confidence-badge" title="Woodwide Numeric Confidence">
            ★ {Math.round(confidence_scores.quality_index * 100)}%
          </span>
        </div>
        <div className="rigor-value">{Math.round(curriculum_quality_score || 0)}/100</div>
        <div className="rigor-bar">
          <div 
            className="rigor-bar-fill" 
            style={{ width: `${Math.min(100, Math.max(0, curriculum_quality_score || 0))}%` }}
          />
        </div>
        <p className="rigor-description">
          Calculated by Woodwide AI based on topic coverage ({curriculum_metrics?.metrics?.topic_diversity || 0}% diversity), 
          format effectiveness ({curriculum_metrics?.metrics?.format_score || 0}/100), 
          industry relevance ({curriculum_metrics?.metrics?.industry_relevance_score || 0}%), 
          and learning engagement indicators
        </p>
        <p className="rigor-description">
          Calculated by Woodwide AI based on topic coverage, format effectiveness, 
          industry relevance, and learning engagement indicators
        </p>
      </div>

      {/* Quality Indicators */}
      {quality_indicators && (
        <div className="quality-indicators-card">
          <h4>Quality Indicators</h4>
          <div className="indicators-grid">
            {quality_indicators.is_high_quality && (
              <div className="indicator-item positive">
                <span className="indicator-icon">✓</span>
                <span>High Quality Curriculum</span>
              </div>
            )}
            {quality_indicators.is_well_structured && (
              <div className="indicator-item positive">
                <span className="indicator-icon">✓</span>
                <span>Well Structured</span>
              </div>
            )}
            {quality_indicators.industry_alignment && (
              <div className="indicator-item positive">
                <span className="indicator-icon">✓</span>
                <span>Industry Aligned</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learning Outcomes */}
      {learning_outcomes && learning_outcomes.length > 0 && (
        <div className="outcomes-card">
          <h4>Predicted Learning Outcomes</h4>
          <div className="outcomes-list">
            {learning_outcomes.slice(0, 5).map((outcome, index) => (
              <div key={index} className="outcome-item">
                <div className="outcome-skill">{outcome.skill}</div>
                <div className="outcome-details">
                  <span className="outcome-level">{outcome.proficiency_level}</span>
                  <span className="outcome-time">• {outcome.estimated_time_to_master}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Acquisition Trajectory Graph */}
      {chartData.length > 0 && (
        <div className="trajectory-card">
          <div className="trajectory-header">
            <h4>4-Year Skill Acquisition Trajectory</h4>
            <span className="confidence-badge" title="Woodwide Numeric Confidence">
              ★ {Math.round(confidence_scores.trajectory * 100)}%
            </span>
          </div>
          <p className="trajectory-description">
            Woodwide AI-predicted skill proficiency growth for this curriculum
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                domain={[0, 100]}
                style={{ fontSize: '12px' }}
                label={{ value: 'Proficiency %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '11px' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, 'Skill Proficiency']}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="proficiency"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProficiency)"
                name="Skill Proficiency"
              />
              <Line
                type="monotone"
                dataKey="confidence_lower"
                stroke="#6b7280"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="Confidence Lower"
              />
              <Line
                type="monotone"
                dataKey="confidence_upper"
                stroke="#6b7280"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="Confidence Upper"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Career Outcomes Section */}
      {curriculum?.outcomes && (
        <div className="career-outcomes-card">
          <h4>Career Outcomes</h4>
          <div className="outcomes-metrics-grid">
            <div className="outcome-metric">
              <span className="outcome-metric-value">{formatPercent(curriculum.outcomes.employmentRate)}</span>
              <span className="outcome-metric-label">Employment Rate</span>
            </div>
            <div className="outcome-metric">
              <span className="outcome-metric-value">{formatSalaryK(curriculum.outcomes.averageSalary)}</span>
              <span className="outcome-metric-label">Avg Salary</span>
            </div>
            <div className="outcome-metric">
              <span className="outcome-metric-value">{formatSalaryK(curriculum.outcomes.medianSalary)}</span>
              <span className="outcome-metric-label">Median Salary</span>
            </div>
            <div className="outcome-metric">
              <span className="outcome-metric-value">{formatMonths(curriculum.outcomes.jobPlacementTimeframe)}</span>
              <span className="outcome-metric-label">Avg Placement Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Employers Section */}
      {curriculum?.outcomes?.topEmployers && curriculum.outcomes.topEmployers.length > 0 && (
        <div className="employers-card">
          <h4>Top Employers</h4>
          <div className="employers-chips">
            {curriculum.outcomes.topEmployers.map((employer, idx) => (
              <span key={idx} className="employer-chip">{employer}</span>
            ))}
          </div>
        </div>
      )}

      {/* Industry Distribution Section */}
      {curriculum?.outcomes?.industryDistribution && (
        <div className="industry-card">
          <h4>Industry Distribution</h4>
          <div className="industry-bars">
            {Object.entries(curriculum.outcomes.industryDistribution).map(([industry, percentage]) => {
              const safePercent = isNaN(percentage) || !isFinite(percentage) ? 0 : percentage;
              return (
                <div key={industry} className="industry-bar-row">
                  <span className="industry-name">{industry}</span>
                  <div className="industry-bar-container">
                    <div
                      className="industry-bar-fill"
                      style={{ width: `${Math.round(safePercent * 100)}%` }}
                    />
                  </div>
                  <span className="industry-percentage">{Math.round(safePercent * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Metrics Section */}
      {curriculum?.completion && (
        <div className="completion-card">
          <h4>Completion Metrics</h4>
          <div className="completion-metrics-grid">
            <div className="completion-metric">
              <span className="completion-metric-value">{formatPercent(curriculum.completion.graduationRate)}</span>
              <span className="completion-metric-label">Graduation Rate</span>
            </div>
            <div className="completion-metric">
              <span className="completion-metric-value">{formatYears(curriculum.completion.averageDuration)}</span>
              <span className="completion-metric-label">Avg Duration</span>
            </div>
          </div>
        </div>
      )}

      {/* Skills Acquired Section */}
      {curriculum?.learningOutcomes?.skillsAcquired && curriculum.learningOutcomes.skillsAcquired.length > 0 && (
        <div className="skills-card">
          <h4>Skills Acquired</h4>
          <div className="skills-chips">
            {curriculum.learningOutcomes.skillsAcquired.map((skill, idx) => (
              <span key={idx} className="skill-chip">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Career Paths Section */}
      {curriculum?.alumni?.careerPaths && curriculum.alumni.careerPaths.length > 0 && (
        <div className="career-paths-card">
          <h4>Career Paths</h4>
          <div className="career-paths-list">
            {curriculum.alumni.careerPaths.map((path, idx) => (
              <div key={idx} className="career-path-row">
                <span className="career-path-title">{path.title}</span>
                <span className="career-path-percentage">{Math.round(path.percentage * 100)}%</span>
                <span className="career-path-salary">${(path.averageSalary / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alumni Feedback Section */}
      {curriculum?.alumni && (
        <div className="alumni-feedback-card">
          <h4>Alumni Feedback</h4>
          <div className="alumni-metrics-grid">
            <div className="alumni-metric">
              <span className="alumni-metric-value">{curriculum.alumni.satisfactionScore}/10</span>
              <span className="alumni-metric-label">Satisfaction Score</span>
            </div>
            <div className="alumni-metric">
              <span className="alumni-metric-value">{Math.round(curriculum.alumni.wouldRecommend * 100)}%</span>
              <span className="alumni-metric-label">Would Recommend</span>
            </div>
            <div className="alumni-metric">
              <span className="alumni-metric-value">{(curriculum.alumni.totalAlumni / 1000).toFixed(1)}k</span>
              <span className="alumni-metric-label">Total Alumni</span>
            </div>
          </div>
        </div>
      )}

      {/* Model Metadata */}
      <div className="model-metadata">
        <span className="metadata-text">
          Model: {researchData.model_metadata?.model_id || 'N/A'} •
          {researchData.model_metadata?.using_real_ai ? (
            <span className="real-ai-badge" title="Using real Wood Wide AI predictions">🟢 Real AI Predictions</span>
          ) : (
            <span>Mock Data (API unavailable)</span>
          )}
        </span>
      </div>
    </div>
  );
}

export default Research;

