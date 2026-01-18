// Outcome data generator with realistic distributions and correlations

// Salary ranges by subject (in USD)
const SALARY_RANGES = {
  'AI': { min: 85000, max: 135000, median: 105000 },
  'Machine Learning': { min: 85000, max: 135000, median: 105000 },
  'Computer Science': { min: 70000, max: 120000, median: 90000 },
  'Data Science': { min: 75000, max: 125000, median: 95000 },
  'Software Engineering': { min: 75000, max: 125000, median: 95000 },
  'Engineering': { min: 65000, max: 110000, median: 82000 },
  'Physics': { min: 55000, max: 95000, median: 72000 },
  'Mathematics': { min: 60000, max: 100000, median: 75000 },
  'Business': { min: 55000, max: 90000, median: 68000 },
  'Finance': { min: 65000, max: 110000, median: 82000 },
  'Design': { min: 45000, max: 75000, median: 58000 },
  'Art': { min: 35000, max: 65000, median: 48000 },
  'Music': { min: 35000, max: 60000, median: 45000 },
  'Film': { min: 40000, max: 70000, median: 52000 },
  'Biology': { min: 48000, max: 80000, median: 60000 },
  'Chemistry': { min: 50000, max: 85000, median: 65000 },
  'default': { min: 45000, max: 75000, median: 58000 }
};

// School tier mapping (affects outcomes)
const SCHOOL_TIERS = {
  'tier1': ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge', 'ETH Zurich', 'Tokyo', 'Tsinghua', 'IIT Bombay'],
  'tier2': ['Columbia', 'McGill', 'USC', 'U Washington', 'Georgia Tech', 'UCLA', 'UT Austin', 'TU Munich', 'NUS', 'Tel Aviv'],
  'tier3': [] // Everything else
};

function getSchoolTier(schoolName) {
  if (SCHOOL_TIERS.tier1.some(t => schoolName.includes(t))) return 'tier1';
  if (SCHOOL_TIERS.tier2.some(t => schoolName.includes(t))) return 'tier2';
  return 'tier3';
}

// Generate random number with normal distribution
function randomNormal(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Get salary range for curriculum
function getSalaryRange(topics) {
  for (const topic of topics) {
    if (SALARY_RANGES[topic]) {
      return SALARY_RANGES[topic];
    }
  }
  return SALARY_RANGES.default;
}

// Top employers by field
const TOP_EMPLOYERS = {
  'tech': ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'NVIDIA', 'Intel', 'Adobe'],
  'finance': ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'BlackRock', 'Citadel', 'Two Sigma'],
  'consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'Accenture'],
  'research': ['MIT', 'Stanford', 'Google Research', 'DeepMind', 'OpenAI', 'Microsoft Research'],
  'design': ['Apple', 'Google', 'Meta', 'IDEO', 'Figma', 'Adobe', 'Airbnb'],
  'media': ['Disney', 'Netflix', 'Warner Bros', 'NBC Universal', 'Sony Pictures', 'HBO'],
  'general': ['Amazon', 'Google', 'Microsoft', 'IBM', 'Salesforce', 'Oracle']
};

function getTopEmployers(topics, format) {
  const isTech = topics.some(t => ['AI', 'Machine Learning', 'Computer Science', 'Data Science', 'Software Engineering'].includes(t));
  const isFinance = topics.some(t => ['Finance', 'Business', 'Economics'].includes(t));
  const isDesign = topics.some(t => ['Design', 'Art', 'UX', 'UI'].includes(t));
  const isMedia = topics.some(t => ['Film', 'Animation', 'Music', 'Media'].includes(t));
  const isResearch = format === 'theory-heavy';

  let pool = [];
  if (isTech) pool = [...TOP_EMPLOYERS.tech];
  else if (isFinance) pool = [...TOP_EMPLOYERS.finance];
  else if (isDesign) pool = [...TOP_EMPLOYERS.design];
  else if (isMedia) pool = [...TOP_EMPLOYERS.media];
  else if (isResearch) pool = [...TOP_EMPLOYERS.research];
  else pool = [...TOP_EMPLOYERS.general];

  // Shuffle and take 3-5
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const count = 3 + Math.floor(Math.random() * 3); // 3-5
  return shuffled.slice(0, count);
}

// Industry distributions by field
function getIndustryDistribution(topics) {
  const isTech = topics.some(t => ['AI', 'Machine Learning', 'Computer Science', 'Data Science'].includes(t));
  const isFinance = topics.some(t => ['Finance', 'Business'].includes(t));
  const isArts = topics.some(t => ['Art', 'Music', 'Film', 'Design'].includes(t));

  if (isTech) {
    return {
      'Technology': 0.45 + Math.random() * 0.15,
      'Finance': 0.15 + Math.random() * 0.10,
      'Consulting': 0.10 + Math.random() * 0.10,
      'Academia': 0.08 + Math.random() * 0.07,
      'Other': 0.10
    };
  } else if (isFinance) {
    return {
      'Finance': 0.40 + Math.random() * 0.15,
      'Consulting': 0.20 + Math.random() * 0.10,
      'Technology': 0.15 + Math.random() * 0.10,
      'Business': 0.12 + Math.random() * 0.08,
      'Other': 0.08
    };
  } else if (isArts) {
    return {
      'Media & Entertainment': 0.35 + Math.random() * 0.15,
      'Technology': 0.20 + Math.random() * 0.10,
      'Freelance': 0.18 + Math.random() * 0.12,
      'Education': 0.15 + Math.random() * 0.08,
      'Other': 0.10
    };
  } else {
    return {
      'Technology': 0.25 + Math.random() * 0.10,
      'Consulting': 0.20 + Math.random() * 0.10,
      'Education': 0.18 + Math.random() * 0.10,
      'Research': 0.15 + Math.random() * 0.10,
      'Other': 0.15
    };
  }
}

// Normalize distribution to sum to 1.0
function normalizeDistribution(dist) {
  const total = Object.values(dist).reduce((sum, val) => sum + val, 0);
  const normalized = {};
  for (const [key, val] of Object.entries(dist)) {
    normalized[key] = parseFloat((val / total).toFixed(2));
  }
  return normalized;
}

// Skills by topic
const SKILLS_BY_TOPIC = {
  'AI': ['Python', 'Machine Learning', 'Neural Networks', 'TensorFlow', 'PyTorch', 'Data Analysis'],
  'Machine Learning': ['Python', 'Scikit-learn', 'Data Preprocessing', 'Model Training', 'Feature Engineering'],
  'Computer Science': ['Programming', 'Algorithms', 'Data Structures', 'Software Development', 'Problem Solving'],
  'Physics': ['Mathematical Modeling', 'Experimental Design', 'Data Analysis', 'MATLAB', 'LaTeX'],
  'Design': ['Adobe Creative Suite', 'Figma', 'User Research', 'Prototyping', 'Visual Design'],
  'Business': ['Financial Analysis', 'Strategic Planning', 'Market Research', 'Excel', 'Presentation Skills']
};

function getSkills(topics) {
  const skills = new Set();
  for (const topic of topics) {
    if (SKILLS_BY_TOPIC[topic]) {
      SKILLS_BY_TOPIC[topic].forEach(s => skills.add(s));
    }
  }
  if (skills.size === 0) {
    return ['Critical Thinking', 'Communication', 'Research', 'Analysis'];
  }
  return Array.from(skills).slice(0, 6 + Math.floor(Math.random() * 3)); // 6-8 skills
}

// Career paths by field
function getCareerPaths(topics, salaryRange) {
  const isTech = topics.some(t => ['AI', 'Machine Learning', 'Computer Science'].includes(t));
  const isFinance = topics.some(t => ['Finance', 'Business'].includes(t));
  const isArts = topics.some(t => ['Art', 'Design', 'Film'].includes(t));

  let paths = [];
  if (isTech) {
    paths = [
      { title: 'Software Engineer', percentage: 0.35, averageSalary: salaryRange.median * 1.05 },
      { title: 'Data Scientist', percentage: 0.22, averageSalary: salaryRange.median * 1.15 },
      { title: 'ML Engineer', percentage: 0.18, averageSalary: salaryRange.median * 1.20 },
      { title: 'Product Manager', percentage: 0.15, averageSalary: salaryRange.median * 1.10 },
      { title: 'Research Scientist', percentage: 0.10, averageSalary: salaryRange.median * 0.95 }
    ];
  } else if (isFinance) {
    paths = [
      { title: 'Financial Analyst', percentage: 0.30, averageSalary: salaryRange.median * 1.00 },
      { title: 'Investment Banker', percentage: 0.25, averageSalary: salaryRange.median * 1.35 },
      { title: 'Consultant', percentage: 0.20, averageSalary: salaryRange.median * 1.20 },
      { title: 'Portfolio Manager', percentage: 0.15, averageSalary: salaryRange.median * 1.25 },
      { title: 'Risk Analyst', percentage: 0.10, averageSalary: salaryRange.median * 0.95 }
    ];
  } else if (isArts) {
    paths = [
      { title: 'UX Designer', percentage: 0.28, averageSalary: salaryRange.median * 1.15 },
      { title: 'Graphic Designer', percentage: 0.25, averageSalary: salaryRange.median * 0.95 },
      { title: 'Art Director', percentage: 0.20, averageSalary: salaryRange.median * 1.25 },
      { title: 'Freelance Artist', percentage: 0.17, averageSalary: salaryRange.median * 0.85 },
      { title: 'Creative Director', percentage: 0.10, averageSalary: salaryRange.median * 1.40 }
    ];
  } else {
    paths = [
      { title: 'Specialist', percentage: 0.30, averageSalary: salaryRange.median * 1.00 },
      { title: 'Analyst', percentage: 0.25, averageSalary: salaryRange.median * 0.95 },
      { title: 'Manager', percentage: 0.20, averageSalary: salaryRange.median * 1.15 },
      { title: 'Consultant', percentage: 0.15, averageSalary: salaryRange.median * 1.10 },
      { title: 'Researcher', percentage: 0.10, averageSalary: salaryRange.median * 0.90 }
    ];
  }

  return paths.map(p => ({
    ...p,
    averageSalary: Math.round(p.averageSalary)
  }));
}

// Generate realistic outcomes for a curriculum
export function generateRealisticOutcomes(curriculum) {
  const tier = getSchoolTier(curriculum.school);
  const salaryRange = getSalaryRange(curriculum.topics);

  // Tier multipliers
  const tierMultipliers = {
    'tier1': { salary: 1.25, employment: 1.08, gpa: 1.05, sat: 1.10 },
    'tier2': { salary: 1.10, employment: 1.04, gpa: 1.02, sat: 1.05 },
    'tier3': { salary: 1.00, employment: 1.00, gpa: 1.00, sat: 1.00 }
  };
  const multiplier = tierMultipliers[tier];

  // Format multipliers - all properties must be defined to avoid NaN
  const defaultFormatMult = { employment: 1.0, satisfaction: 1.0, graduation: 1.0, difficulty: 1.0, gpa: 1.0 };
  const formatMultipliers = {
    'project-based': { ...defaultFormatMult, employment: 1.08, satisfaction: 1.05 },
    'visual-heavy': { ...defaultFormatMult, satisfaction: 1.03, graduation: 1.02 },
    'theory-heavy': { ...defaultFormatMult, difficulty: 1.15, gpa: 0.97, graduation: 0.95 }
  };
  const formatMult = formatMultipliers[curriculum.format] || defaultFormatMult;

  // Difficulty rating (1-10, varies by format and tier)
  let baseDifficulty = 5.5;
  if (curriculum.format === 'theory-heavy') baseDifficulty = 7.5;
  if (curriculum.format === 'project-based') baseDifficulty = 6.0;
  if (curriculum.format === 'visual-heavy') baseDifficulty = 5.0;
  if (tier === 'tier1') baseDifficulty += 1.5;
  if (tier === 'tier2') baseDifficulty += 0.5;
  const difficultyRating = clamp(baseDifficulty + randomNormal(0, 0.5), 1, 10);

  // GPA (0.0-4.0) - inversely correlated with difficulty
  const baseGPA = 3.45 - (difficultyRating - 5.5) * 0.08;
  const gpa = clamp(randomNormal(baseGPA * formatMult.gpa, 0.12) * multiplier.gpa, 2.5, 4.0);

  // SAT scores (200-800 each) - correlated with tier
  const baseSAT = tier === 'tier1' ? 680 : tier === 'tier2' ? 620 : 570;
  const satReading = Math.round(clamp(randomNormal(baseSAT * multiplier.sat, 40), 400, 800));
  const satMath = Math.round(clamp(randomNormal((baseSAT + 20) * multiplier.sat, 45), 400, 800));
  const satWriting = Math.round(clamp(randomNormal((baseSAT - 10) * multiplier.sat, 40), 400, 800));

  // Acceptance rate (lower for better schools, higher difficulty)
  const baseAcceptance = tier === 'tier1' ? 0.12 : tier === 'tier2' ? 0.35 : 0.65;
  const acceptanceRate = clamp(randomNormal(baseAcceptance, 0.08), 0.05, 0.95);

  // Employment rate (0.0-1.0) - correlated with tier and format
  const baseEmployment = 0.82;
  const employmentRate = clamp(
    randomNormal(baseEmployment * multiplier.employment * formatMult.employment, 0.05),
    0.65, 0.98
  );

  // Salaries
  const avgSalary = Math.round(
    clamp(
      randomNormal(salaryRange.median * multiplier.salary, salaryRange.median * 0.12),
      salaryRange.min, salaryRange.max
    )
  );
  const medianSalary = Math.round(avgSalary * (0.92 + Math.random() * 0.08));

  // Job placement timeframe (months) - faster for better schools and project-based
  const basePlacement = tier === 'tier1' ? 3.0 : tier === 'tier2' ? 4.5 : 6.0;
  const placementModifier = curriculum.format === 'project-based' ? 0.8 : 1.0;
  const jobPlacementTimeframe = clamp(
    randomNormal(basePlacement * placementModifier, 1.0),
    1.5, 9.0
  );

  // Graduation rate (0.0-1.0) - inversely correlated with difficulty
  const baseGraduation = 0.88 - (difficultyRating - 5.5) * 0.025;
  const graduationRate = clamp(
    randomNormal(baseGraduation * formatMult.graduation, 0.05),
    0.70, 0.98
  );

  // Average duration (years)
  const baseDuration = 4.0;
  const durationModifier = curriculum.format === 'theory-heavy' ? 1.08 : 1.0;
  const avgDuration = clamp(
    randomNormal(baseDuration * durationModifier, 0.25),
    3.5, 5.5
  );

  // Dropout rate = 1 - graduation rate
  const dropoutRate = 1.0 - graduationRate;

  // Alumni metrics
  const totalAlumni = Math.round(curriculum.students * (15 + Math.random() * 25)); // 15-40x current students
  const baseSatisfaction = 7.8;
  const satisfactionScore = clamp(
    randomNormal(baseSatisfaction * formatMult.satisfaction, 0.5),
    5.0, 10.0
  );
  const wouldRecommend = clamp(
    graduationRate * 0.95 + randomNormal(0, 0.05),
    0.70, 0.98
  );

  // Top employers and industry distribution
  const topEmployers = getTopEmployers(curriculum.topics, curriculum.format);
  const industryDistribution = normalizeDistribution(getIndustryDistribution(curriculum.topics));

  // Skills and career paths
  const skillsAcquired = getSkills(curriculum.topics);
  const careerPaths = getCareerPaths(curriculum.topics, salaryRange);

  // Certifications (vary by field)
  const certifications = [];
  if (curriculum.topics.includes('AI') || curriculum.topics.includes('Machine Learning')) {
    certifications.push('TensorFlow Developer Certificate', 'AWS Machine Learning Specialty');
  }
  if (curriculum.topics.includes('Business') || curriculum.topics.includes('Finance')) {
    certifications.push('CFA Level 1', 'Financial Modeling Certificate');
  }
  if (curriculum.topics.includes('Design')) {
    certifications.push('Adobe Certified Professional', 'UX Design Certificate');
  }

  // Project count and assessment types
  const projectCount = curriculum.format === 'project-based' ? Math.round(8 + Math.random() * 8) :
                       curriculum.format === 'visual-heavy' ? Math.round(6 + Math.random() * 6) :
                       Math.round(3 + Math.random() * 4);

  const assessmentTypes = [];
  if (curriculum.format === 'project-based') {
    assessmentTypes.push('Projects', 'Portfolio', 'Peer Review');
  } else if (curriculum.format === 'theory-heavy') {
    assessmentTypes.push('Exams', 'Research Papers', 'Presentations');
  } else {
    assessmentTypes.push('Projects', 'Exams', 'Presentations');
  }

  return {
    academicMetrics: {
      averageGPA: parseFloat(gpa.toFixed(2)),
      satScores: {
        reading: satReading,
        math: satMath,
        writing: satWriting
      },
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      difficultyRating: parseFloat(difficultyRating.toFixed(1))
    },
    outcomes: {
      employmentRate: parseFloat(employmentRate.toFixed(2)),
      averageSalary: avgSalary,
      medianSalary: medianSalary,
      jobPlacementTimeframe: parseFloat(jobPlacementTimeframe.toFixed(1)),
      topEmployers: topEmployers,
      industryDistribution: industryDistribution
    },
    completion: {
      graduationRate: parseFloat(graduationRate.toFixed(2)),
      averageDuration: parseFloat(avgDuration.toFixed(1)),
      dropoutRate: parseFloat(dropoutRate.toFixed(2))
    },
    alumni: {
      totalAlumni: totalAlumni,
      satisfactionScore: parseFloat(satisfactionScore.toFixed(1)),
      wouldRecommend: parseFloat(wouldRecommend.toFixed(2)),
      careerPaths: careerPaths,
      notableAlumni: [] // Will be populated manually or via AI
    },
    learningOutcomes: {
      skillsAcquired: skillsAcquired,
      certifications: certifications,
      projectCount: projectCount,
      assessmentTypes: assessmentTypes
    }
  };
}

// Generate a new curriculum for a subject when there aren't enough
export function generateCurriculum(subject, existingCount, allCurriculums) {
  // This would use Gemini API to generate realistic curriculum details
  // For now, return a template that can be filled in
  console.log(`Would generate curriculum for ${subject} (existing: ${existingCount})`);
  return null;
}
