import { NextRequest, NextResponse } from 'next/server';

const WOODWIDE_API_KEY = process.env.NEXT_PUBLIC_WOODWIDE_API_KEY;
const WOODWIDE_API_URL = 'https://api.woodwide.ai/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curriculum, city, country } = body;

    console.log('[Woodwide] Analyzing curriculum:', curriculum.title);
    console.log('[Woodwide] Using Wood Wide AI for numeric predictions');

    // STEP 1: Create structured tabular data from curriculum
    const curriculumData = createCurriculumDataset(curriculum, city, country);

    // STEP 2: Use Wood Wide AI to predict curriculum quality metrics
    let woodwideInsights = null;
    if (WOODWIDE_API_KEY) {
      try {
        woodwideInsights = await analyzeWithWoodwide(curriculumData);
        console.log('[Woodwide] Real AI predictions received');
      } catch (error: any) {
        console.error('[Woodwide] API error, using fallback:', error.message);
      }
    } else {
      console.warn('[Woodwide] API key not configured, using mock data');
    }

    // STEP 3: Combine real predictions with visualization data
    const researchData = buildResearchResponse(curriculum, woodwideInsights);

    console.log('[Woodwide] Research data prepared successfully');
    return NextResponse.json(researchData);

  } catch (error: any) {
    console.error('[Woodwide] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze curriculum',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Create structured dataset for Wood Wide AI analysis
function createCurriculumDataset(curriculum: any, city: string, country: string) {
  // Convert curriculum to structured numeric features
  const formatScores: Record<string, number> = {
    'visual-heavy': 85,
    'theory-heavy': 75,
    'project-based': 90,
    'balanced': 80
  };

  const features = {
    topic_count: curriculum.topics?.length || 0,
    format_score: formatScores[curriculum.format] || 80,
    school_tier: inferSchoolTier(curriculum.school),
    location_score: inferLocationScore(city, country),
    description_length: curriculum.description?.length || 0,
    instructor_quality: curriculum.instructor ? 85 : 70,
    student_count: curriculum.students || 0,
    // Derive additional features
    topic_breadth: Math.min(100, (curriculum.topics?.length || 0) * 12),
    has_outcomes: curriculum.outcomes ? 1 : 0
  };

  return features;
}

// Infer school tier (1-3) based on school name
function inferSchoolTier(school: string): number {
  const topSchools = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'CMU', 'Oxford', 'Cambridge'];
  const tier2Schools = ['UCLA', 'USC', 'Georgia Tech', 'UT Austin', 'Imperial College'];

  if (topSchools.some(s => school.includes(s))) return 3;
  if (tier2Schools.some(s => school.includes(s))) return 2;
  return 1;
}

// Infer location score based on tech hub status
function inferLocationScore(city: string, country: string): number {
  const techHubs: Record<string, number> = {
    'San Francisco': 95, 'Boston': 90, 'Seattle': 88, 'London': 92,
    'Singapore': 87, 'Berlin': 85, 'Tokyo': 86, 'Toronto': 84
  };
  return techHubs[city] || 75;
}

// Analyze curriculum using Wood Wide AI's prediction API
async function analyzeWithWoodwide(features: any) {
  if (!WOODWIDE_API_KEY) {
    throw new Error('Wood Wide API key not configured');
  }

  // PHASE 1: Upload dataset
  const dataset = createTrainingDataset(features);
  const datasetResponse = await fetch(`${WOODWIDE_API_URL}/datasets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WOODWIDE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `curriculum-analysis-${Date.now()}`,
      data: dataset,
      target_column: 'quality_score'
    })
  });

  if (!datasetResponse.ok) {
    throw new Error(`Dataset upload failed: ${datasetResponse.status}`);
  }

  const { dataset_id } = await datasetResponse.json();
  console.log('[Woodwide] Dataset uploaded:', dataset_id);

  // PHASE 2: Train prediction model
  const modelResponse = await fetch(`${WOODWIDE_API_URL}/models/prediction/train`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WOODWIDE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dataset_id,
      model_type: 'regression',
      target: 'quality_score'
    })
  });

  if (!modelResponse.ok) {
    throw new Error(`Model training failed: ${modelResponse.status}`);
  }

  const { model_id } = await modelResponse.json();
  console.log('[Woodwide] Model trained:', model_id);

  // PHASE 3: Run inference on current curriculum
  const inferenceResponse = await fetch(`${WOODWIDE_API_URL}/models/prediction/${model_id}/infer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WOODWIDE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: [features]
    })
  });

  if (!inferenceResponse.ok) {
    throw new Error(`Inference failed: ${inferenceResponse.status}`);
  }

  const predictions = await inferenceResponse.json();

  return {
    quality_score: predictions.predictions[0],
    confidence: predictions.confidence || 0.85,
    model_id,
    dataset_id
  };
}

// Create synthetic training dataset (historical curriculum data)
function createTrainingDataset(currentFeatures: any) {
  // Generate 50 synthetic historical curriculum records
  const dataset = [];

  for (let i = 0; i < 50; i++) {
    const record = {
      topic_count: 5 + Math.floor(Math.random() * 10),
      format_score: 70 + Math.floor(Math.random() * 25),
      school_tier: Math.ceil(Math.random() * 3),
      location_score: 70 + Math.floor(Math.random() * 25),
      description_length: 100 + Math.floor(Math.random() * 400),
      instructor_quality: 60 + Math.floor(Math.random() * 35),
      student_count: 50 + Math.floor(Math.random() * 500),
      topic_breadth: 40 + Math.floor(Math.random() * 60),
      has_outcomes: Math.random() > 0.3 ? 1 : 0,
      quality_score: 0 // Will be calculated
    };

    // Calculate quality score based on features (synthetic ground truth)
    record.quality_score = Math.round(
      record.format_score * 0.25 +
      record.school_tier * 15 +
      record.location_score * 0.2 +
      record.topic_breadth * 0.25 +
      record.has_outcomes * 10 +
      (Math.random() * 10 - 5) // noise
    );

    dataset.push(record);
  }

  // Add current curriculum as the last row (for prediction)
  dataset.push({ ...currentFeatures, quality_score: null });

  return dataset;
}

// Build final research response combining real and mock data
function buildResearchResponse(curriculum: any, woodwideInsights: any) {
  const qualityScore = woodwideInsights?.quality_score || Math.floor(Math.random() * 20 + 75);
  const confidence = woodwideInsights?.confidence || 0.85;

  return {
    curriculum_metrics: {
      metrics: {
        topic_count: curriculum.topics?.length || 0,
        topic_diversity: Math.min(90, (curriculum.topics?.length || 0) * 15),
        industry_relevance_score: Math.floor(qualityScore * 0.9),
        format_score: Math.round(qualityScore * 0.95),
        format_type: curriculum.format || 'balanced'
      }
    },
    curriculum_quality_score: Math.round(qualityScore),
    confidence_scores: {
      overall: confidence,
      quality_index: confidence * 1.03,
      trajectory: confidence * 0.96,
      industry_alignment: confidence * 1.01
    },
    learning_outcomes: curriculum.topics?.slice(0, 5).map((topic: string, index: number) => ({
      skill: topic,
      proficiency_level: ['Intermediate', 'Advanced', 'Expert'][index % 3],
      estimated_time_to_master: `${6 + index * 2}-${8 + index * 2} months`
    })) || [],
    skill_acquisition_trajectory: generateTrajectory(),
    trajectory_data: generateTrajectory().map((point, i) => ({
      label: new Date(point.date).getFullYear().toString(),
      value: point.skill_proficiency
    })),
    industry_alignment: {
      relevance_score: Math.floor(qualityScore * 0.92),
      demand_forecast: {
        growth_forecast: qualityScore > 85 ? 'high' : qualityScore > 75 ? 'strong' : 'moderate'
      }
    },
    completion_forecast: {
      predicted_completion_rate: Math.floor(qualityScore * 0.88),
      factors: {
        class_size_impact: qualityScore > 80 ? 'positive' : 'neutral'
      }
    },
    quality_indicators: {
      is_high_quality: qualityScore >= 80,
      is_well_structured: qualityScore >= 75,
      industry_alignment: qualityScore >= 78
    },
    model_metadata: {
      model_id: woodwideInsights?.model_id || 'curriculum-analyzer-fallback',
      dataset_id: woodwideInsights?.dataset_id || 'synthetic',
      version: '2.0.0-woodwide',
      generated_at: new Date().toISOString(),
      using_real_ai: !!woodwideInsights
    }
  };
}

// Generate 4-year skill acquisition trajectory (visualization data)
function generateTrajectory() {
  const startYear = new Date().getFullYear();
  const trajectory = [];

  for (let i = 0; i < 5; i++) {
    const year = startYear + i;
    const baseProgress = 20 + (i * 15);
    const variance = Math.random() * 10 - 5;
    const proficiency = Math.min(95, Math.max(15, baseProgress + variance));

    trajectory.push({
      date: `${year}-06-01`,
      skill_proficiency: Math.round(proficiency * 10) / 10,
      confidence_lower: Math.max(0, proficiency - 8),
      confidence_upper: Math.min(100, proficiency + 8)
    });
  }

  return trajectory;
}
