import { generateRealisticOutcomes } from './outcomeGenerator';

// Generate unique vibrant colors for each curriculum
const generateColor = (index, total) => {
  const hue = (index * 137.508) % 360; // Golden angle for good distribution
  return `hsl(${hue}, 85%, 55%)`;
};

// Raw curriculum data before enrichment
const rawCurriculums = [
  // NORTH AMERICA
  {
    id: 1,
    title: "Introduction to Machine Learning",
    school: "Stanford University",
    location: { city: "Stanford", country: "USA", region: "North America", coordinates: [-122.1697, 37.4275] },
    topics: ["AI", "Machine Learning", "Python", "Computer Science"],
    format: "project-based",
    tags: ["visual", "hands-on", "practical"],
    description: "A comprehensive intro to ML fundamentals with hands-on projects using scikit-learn and TensorFlow.",
    instructor: "Dr. Sarah Chen",
    students: 2847
  },
  {
    id: 2,
    title: "AP Computer Science A",
    school: "Columbia University",
    location: { city: "New York", country: "USA", region: "North America", coordinates: [-73.9626, 40.8075] },
    topics: ["Computer Science", "Java", "Programming"],
    format: "visual-heavy",
    tags: ["visual", "exam-prep", "structured"],
    description: "Complete AP CS A curriculum with visual explanations and practice problems.",
    instructor: "Mr. David Park",
    students: 892
  },
  {
    id: 3,
    title: "Physics for Game Developers",
    school: "McGill University",
    location: { city: "Montreal", country: "Canada", region: "North America", coordinates: [-73.5772, 45.5048] },
    topics: ["Physics", "Game Development", "Simulation", "Programming"],
    format: "project-based",
    tags: ["practical", "visual", "interactive"],
    description: "Physics concepts applied to game development with Unity-based projects.",
    instructor: "Dr. Marc Dubois",
    students: 1243
  },
  {
    id: 4,
    title: "Music Theory Fundamentals",
    school: "Berklee College of Music",
    location: { city: "Boston", country: "USA", region: "North America", coordinates: [-71.0872, 42.3467] },
    topics: ["Music", "Theory", "Composition", "Arts"],
    format: "visual-heavy",
    tags: ["creative", "ear-training", "practical"],
    description: "Learn music theory through interactive exercises and composition projects.",
    instructor: "Sarah Johnson",
    students: 1892
  },
  {
    id: 5,
    title: "Bioinformatics",
    school: "MIT",
    location: { city: "Cambridge", country: "USA", region: "North America", coordinates: [-71.0921, 42.3601] },
    topics: ["Biology", "Computer Science", "Genomics", "Science"],
    format: "theory-heavy",
    tags: ["research", "interdisciplinary", "cutting-edge"],
    description: "Computational approaches to biological data analysis and genomics.",
    instructor: "Dr. Michael Chen",
    students: 1456
  },
  {
    id: 6,
    title: "Deep Learning Specialization",
    school: "University of Toronto",
    location: { city: "Toronto", country: "Canada", region: "North America", coordinates: [-79.3957, 43.6629] },
    topics: ["AI", "Deep Learning", "Neural Networks", "Computer Science"],
    format: "project-based",
    tags: ["cutting-edge", "hands-on", "research"],
    description: "Advanced deep learning techniques including CNNs, RNNs, and transformers.",
    instructor: "Prof. Geoffrey Hinton",
    students: 6721
  },
  {
    id: 7,
    title: "Game Design Fundamentals",
    school: "University of Southern California",
    location: { city: "Los Angeles", country: "USA", region: "North America", coordinates: [-118.2851, 34.0224] },
    topics: ["Game Design", "Interactive Media", "Arts", "Programming"],
    format: "project-based",
    tags: ["creative", "collaborative", "industry"],
    description: "Learn game design principles through prototyping and playtesting.",
    instructor: "Prof. Tracy Fullerton",
    students: 2134
  },
  {
    id: 8,
    title: "Data Science Bootcamp",
    school: "University of Washington",
    location: { city: "Seattle", country: "USA", region: "North America", coordinates: [-122.3035, 47.6553] },
    topics: ["Data Science", "Python", "Statistics", "Machine Learning"],
    format: "project-based",
    tags: ["practical", "industry", "comprehensive"],
    description: "End-to-end data science from collection to visualization and ML deployment.",
    instructor: "Dr. Emily Zhang",
    students: 3421
  },
  {
    id: 9,
    title: "Aerospace Engineering Intro",
    school: "Georgia Tech",
    location: { city: "Atlanta", country: "USA", region: "North America", coordinates: [-84.3963, 33.7756] },
    topics: ["Aerospace", "Engineering", "Physics"],
    format: "theory-heavy",
    tags: ["rigorous", "lab-based", "research"],
    description: "Fundamentals of flight, propulsion, and spacecraft design.",
    instructor: "Prof. Robert Hayes",
    students: 1876
  },
  {
    id: 10,
    title: "Film Production Basics",
    school: "UCLA",
    location: { city: "Los Angeles", country: "USA", region: "North America", coordinates: [-118.4452, 34.0689] },
    topics: ["Film", "Production", "Arts", "Media"],
    format: "project-based",
    tags: ["creative", "hands-on", "industry"],
    description: "Learn cinematography, editing, and storytelling through film projects.",
    instructor: "Maria Rodriguez",
    students: 2567
  },
  {
    id: 11,
    title: "Renewable Energy Systems",
    school: "University of Texas Austin",
    location: { city: "Austin", country: "USA", region: "North America", coordinates: [-97.7341, 30.2849] },
    topics: ["Energy", "Sustainability", "Engineering"],
    format: "project-based",
    tags: ["practical", "research", "green"],
    description: "Solar, wind, and battery systems design and implementation.",
    instructor: "Dr. Carlos Martinez",
    students: 1654
  },
  {
    id: 12,
    title: "Marine Biology",
    school: "University of Miami",
    location: { city: "Miami", country: "USA", region: "North America", coordinates: [-80.2781, 25.7211] },
    topics: ["Biology", "Marine Science", "Ecology"],
    format: "visual-heavy",
    tags: ["field-work", "research", "conservation"],
    description: "Study ocean ecosystems, marine life, and conservation efforts.",
    instructor: "Dr. Lisa Ocean",
    students: 987
  },
  // SOUTH AMERICA
  {
    id: 13,
    title: "Tropical Agriculture",
    school: "University of São Paulo",
    location: { city: "São Paulo", country: "Brazil", region: "South America", coordinates: [-46.7319, -23.5587] },
    topics: ["Agriculture", "Biology", "Sustainability"],
    format: "project-based",
    tags: ["field-work", "practical", "sustainable"],
    description: "Sustainable farming techniques for tropical climates.",
    instructor: "Prof. Ana Silva",
    students: 2341
  },
  {
    id: 14,
    title: "Latin American Literature",
    school: "Universidad de Buenos Aires",
    location: { city: "Buenos Aires", country: "Argentina", region: "South America", coordinates: [-58.3816, -34.5997] },
    topics: ["Literature", "Spanish", "Arts", "Culture"],
    format: "visual-heavy",
    tags: ["cultural", "analytical", "creative"],
    description: "Explore magical realism and contemporary Latin American authors.",
    instructor: "Prof. Gabriel Márquez",
    students: 1234
  },
  {
    id: 15,
    title: "Andean Archaeology",
    school: "Pontificia Universidad Católica del Perú",
    location: { city: "Lima", country: "Peru", region: "South America", coordinates: [-77.0794, -12.0693] },
    topics: ["Archaeology", "History", "Anthropology"],
    format: "project-based",
    tags: ["field-work", "research", "cultural"],
    description: "Study Incan civilization and pre-Columbian cultures through excavation.",
    instructor: "Dr. Carmen Vega",
    students: 654
  },
  {
    id: 16,
    title: "Amazon Ecology",
    school: "Universidad Nacional de Colombia",
    location: { city: "Bogotá", country: "Colombia", region: "South America", coordinates: [-74.0817, 4.6382] },
    topics: ["Ecology", "Biology", "Conservation"],
    format: "project-based",
    tags: ["field-work", "conservation", "research"],
    description: "Rainforest ecosystems, biodiversity, and conservation strategies.",
    instructor: "Dr. Pedro Fernandez",
    students: 876
  },
  // EUROPE
  {
    id: 17,
    title: "Linear Algebra for Engineers",
    school: "University of Cambridge",
    location: { city: "Cambridge", country: "UK", region: "Europe", coordinates: [0.1218, 52.2053] },
    topics: ["Mathematics", "Linear Algebra", "Engineering"],
    format: "theory-heavy",
    tags: ["formal", "rigorous", "proof-based"],
    description: "Rigorous treatment of vector spaces, matrices, and linear transformations.",
    instructor: "Prof. James Wright",
    students: 1523
  },
  {
    id: 18,
    title: "Web Development Bootcamp",
    school: "Technical University of Berlin",
    location: { city: "Berlin", country: "Germany", region: "Europe", coordinates: [13.3267, 52.5125] },
    topics: ["Web Development", "JavaScript", "React", "Computer Science"],
    format: "project-based",
    tags: ["practical", "portfolio-building", "industry-ready"],
    description: "Full-stack web development from HTML basics to deploying React applications.",
    instructor: "Maria Schmidt",
    students: 3102
  },
  {
    id: 19,
    title: "Creative Coding with p5.js",
    school: "University of Amsterdam",
    location: { city: "Amsterdam", country: "Netherlands", region: "Europe", coordinates: [4.9541, 52.3563] },
    topics: ["Creative Coding", "JavaScript", "Art", "Programming"],
    format: "project-based",
    tags: ["creative", "visual", "experimental"],
    description: "Learn programming through creating interactive art and generative designs.",
    instructor: "Eva van der Berg",
    students: 671
  },
  {
    id: 20,
    title: "Spanish for Beginners",
    school: "Universidad Complutense de Madrid",
    location: { city: "Madrid", country: "Spain", region: "Europe", coordinates: [-3.7261, 40.4489] },
    topics: ["Languages", "Spanish", "Communication"],
    format: "visual-heavy",
    tags: ["conversational", "cultural", "immersive"],
    description: "Learn Spanish through immersive conversations and cultural exploration.",
    instructor: "Isabel García",
    students: 5621
  },
  {
    id: 21,
    title: "Quantum Computing 101",
    school: "ETH Zurich",
    location: { city: "Zurich", country: "Switzerland", region: "Europe", coordinates: [8.5481, 47.3763] },
    topics: ["Quantum Computing", "Physics", "Computer Science"],
    format: "theory-heavy",
    tags: ["cutting-edge", "formal", "research"],
    description: "Introduction to quantum computing concepts and Qiskit programming.",
    instructor: "Dr. Hans Müller",
    students: 892
  },
  {
    id: 22,
    title: "Environmental Science",
    school: "Stockholm University",
    location: { city: "Stockholm", country: "Sweden", region: "Europe", coordinates: [18.0586, 59.3639] },
    topics: ["Environmental Science", "Climate", "Sustainability", "Science"],
    format: "project-based",
    tags: ["field-work", "research", "actionable"],
    description: "Hands-on environmental science with local ecosystem projects.",
    instructor: "Dr. Erik Lindgren",
    students: 1567
  },
  {
    id: 23,
    title: "Intro to Psychology",
    school: "University of Vienna",
    location: { city: "Vienna", country: "Austria", region: "Europe", coordinates: [16.3599, 48.2130] },
    topics: ["Psychology", "Behavioral Science", "Science"],
    format: "visual-heavy",
    tags: ["engaging", "case-studies", "research-backed"],
    description: "Explore the human mind through classic experiments and modern research.",
    instructor: "Dr. Anna Berger",
    students: 3245
  },
  {
    id: 24,
    title: "Financial Engineering",
    school: "London School of Economics",
    location: { city: "London", country: "UK", region: "Europe", coordinates: [-0.1165, 51.5144] },
    topics: ["Finance", "Mathematics", "Risk Analysis", "Business"],
    format: "theory-heavy",
    tags: ["quantitative", "rigorous", "industry"],
    description: "Mathematical models for financial markets and derivative pricing.",
    instructor: "Dr. Robert Merton",
    students: 1876
  },
  {
    id: 25,
    title: "Autonomous Systems",
    school: "Technical University of Munich",
    location: { city: "Munich", country: "Germany", region: "Europe", coordinates: [11.5681, 48.1497] },
    topics: ["Robotics", "AI", "Control Systems", "Engineering"],
    format: "project-based",
    tags: ["cutting-edge", "hands-on", "research"],
    description: "Design and implement autonomous robots and self-driving systems.",
    instructor: "Prof. Klaus Fischer",
    students: 1543
  },
  {
    id: 26,
    title: "Renaissance Art History",
    school: "University of Florence",
    location: { city: "Florence", country: "Italy", region: "Europe", coordinates: [11.2558, 43.7696] },
    topics: ["Art History", "History", "Culture"],
    format: "visual-heavy",
    tags: ["cultural", "analytical", "museum-based"],
    description: "Study Michelangelo, da Vinci, and the Italian Renaissance masters.",
    instructor: "Prof. Marco Bellini",
    students: 987
  },
  {
    id: 27,
    title: "Nordic Design Principles",
    school: "Aalto University",
    location: { city: "Helsinki", country: "Finland", region: "Europe", coordinates: [24.8262, 60.1867] },
    topics: ["Design", "Architecture", "Arts"],
    format: "project-based",
    tags: ["creative", "minimalist", "sustainable"],
    description: "Scandinavian design philosophy and sustainable product development.",
    instructor: "Dr. Mika Virtanen",
    students: 765
  },
  {
    id: 28,
    title: "French Culinary Arts",
    school: "Le Cordon Bleu Paris",
    location: { city: "Paris", country: "France", region: "Europe", coordinates: [2.3200, 48.8450] },
    topics: ["Culinary Arts", "French", "Hospitality"],
    format: "project-based",
    tags: ["hands-on", "practical", "industry"],
    description: "Classic French cooking techniques from master chefs.",
    instructor: "Chef Pierre Dubois",
    students: 1234
  },
  {
    id: 29,
    title: "Cybersecurity Advanced",
    school: "Delft University of Technology",
    location: { city: "Delft", country: "Netherlands", region: "Europe", coordinates: [4.3571, 52.0116] },
    topics: ["Cybersecurity", "Computer Science", "Networks"],
    format: "project-based",
    tags: ["hands-on", "lab-based", "industry"],
    description: "Advanced penetration testing and security architecture.",
    instructor: "Dr. Jan de Vries",
    students: 1432
  },
  {
    id: 30,
    title: "Ancient Greek Philosophy",
    school: "National and Kapodistrian University of Athens",
    location: { city: "Athens", country: "Greece", region: "Europe", coordinates: [23.7826, 37.9680] },
    topics: ["Philosophy", "History", "Classics"],
    format: "theory-heavy",
    tags: ["analytical", "classical", "foundational"],
    description: "Study Plato, Aristotle, and the foundations of Western thought.",
    instructor: "Prof. Nikos Papadopoulos",
    students: 654
  },
  // ASIA
  {
    id: 31,
    title: "Data Structures & Algorithms",
    school: "University of Tokyo",
    location: { city: "Tokyo", country: "Japan", region: "Asia", coordinates: [139.7625, 35.7126] },
    topics: ["Computer Science", "Algorithms", "Data Structures", "Programming"],
    format: "theory-heavy",
    tags: ["visual", "interview-prep", "comprehensive"],
    description: "Master essential DSA concepts with animated visualizations and coding challenges.",
    instructor: "Prof. Yuki Tanaka",
    students: 4521
  },
  {
    id: 32,
    title: "Intro to Calculus",
    school: "Indian Institute of Technology Bombay",
    location: { city: "Mumbai", country: "India", region: "Asia", coordinates: [72.9155, 19.1334] },
    topics: ["Mathematics", "Calculus"],
    format: "visual-heavy",
    tags: ["visual", "step-by-step", "intuitive"],
    description: "Build strong calculus foundations with visual intuition and real-world applications.",
    instructor: "Dr. Priya Sharma",
    students: 8934
  },
  {
    id: 33,
    title: "Robotics & Arduino",
    school: "Tsinghua University",
    location: { city: "Beijing", country: "China", region: "Asia", coordinates: [116.3267, 40.0003] },
    topics: ["Robotics", "Electronics", "Arduino", "Engineering"],
    format: "project-based",
    tags: ["hands-on", "hardware", "maker"],
    description: "Build robots from scratch using Arduino and learn embedded programming.",
    instructor: "Wei Liu",
    students: 3456
  },
  {
    id: 34,
    title: "Digital Marketing Basics",
    school: "National University of Singapore",
    location: { city: "Singapore", country: "Singapore", region: "Asia", coordinates: [103.7764, 1.2966] },
    topics: ["Marketing", "Digital Marketing", "Social Media", "Business"],
    format: "project-based",
    tags: ["practical", "case-studies", "industry"],
    description: "Master digital marketing strategies with real campaign projects.",
    instructor: "Amanda Tan",
    students: 4892
  },
  {
    id: 35,
    title: "iOS App Development",
    school: "Seoul National University",
    location: { city: "Seoul", country: "South Korea", region: "Asia", coordinates: [126.9522, 37.4601] },
    topics: ["Mobile Development", "Swift", "iOS", "Computer Science"],
    format: "project-based",
    tags: ["practical", "portfolio", "industry"],
    description: "Build and publish iOS apps using Swift and SwiftUI.",
    instructor: "Kim Min-jun",
    students: 2876
  },
  {
    id: 36,
    title: "Natural Language Processing",
    school: "Peking University",
    location: { city: "Beijing", country: "China", region: "Asia", coordinates: [116.3106, 39.9929] },
    topics: ["NLP", "AI", "Linguistics", "Computer Science"],
    format: "theory-heavy",
    tags: ["research", "cutting-edge", "comprehensive"],
    description: "From word embeddings to large language models and beyond.",
    instructor: "Prof. Ming Zhou",
    students: 4523
  },
  {
    id: 37,
    title: "Traditional Chinese Medicine",
    school: "Beijing University of Chinese Medicine",
    location: { city: "Beijing", country: "China", region: "Asia", coordinates: [116.4249, 39.9420] },
    topics: ["Medicine", "Traditional", "Health"],
    format: "theory-heavy",
    tags: ["traditional", "holistic", "practical"],
    description: "Ancient healing practices and herbal medicine principles.",
    instructor: "Dr. Li Wei",
    students: 2134
  },
  {
    id: 38,
    title: "Anime & Manga Production",
    school: "Kyoto Seika University",
    location: { city: "Kyoto", country: "Japan", region: "Asia", coordinates: [135.7823, 35.0617] },
    topics: ["Animation", "Art", "Media", "Design"],
    format: "project-based",
    tags: ["creative", "industry", "portfolio"],
    description: "Learn Japanese animation and comic creation techniques.",
    instructor: "Sensei Takeshi Yamamoto",
    students: 1876
  },
  {
    id: 39,
    title: "Semiconductor Physics",
    school: "KAIST",
    location: { city: "Daejeon", country: "South Korea", region: "Asia", coordinates: [127.3595, 36.3727] },
    topics: ["Physics", "Electronics", "Engineering"],
    format: "theory-heavy",
    tags: ["rigorous", "research", "industry"],
    description: "Chip design and semiconductor manufacturing principles.",
    instructor: "Prof. Park Sung-ho",
    students: 1234
  },
  {
    id: 40,
    title: "Yoga & Meditation Studies",
    school: "Banaras Hindu University",
    location: { city: "Varanasi", country: "India", region: "Asia", coordinates: [82.9913, 25.2677] },
    topics: ["Yoga", "Meditation", "Philosophy", "Health"],
    format: "visual-heavy",
    tags: ["practical", "spiritual", "traditional"],
    description: "Ancient yoga philosophy and meditation practices.",
    instructor: "Guru Anand Sharma",
    students: 3456
  },
  {
    id: 41,
    title: "Supply Chain Management",
    school: "Hong Kong University",
    location: { city: "Hong Kong", country: "Hong Kong", region: "Asia", coordinates: [114.1375, 22.2830] },
    topics: ["Business", "Logistics", "Management"],
    format: "project-based",
    tags: ["practical", "industry", "global"],
    description: "Global supply chain optimization and logistics management.",
    instructor: "Prof. David Wong",
    students: 2345
  },
  {
    id: 42,
    title: "Vietnamese Language & Culture",
    school: "Vietnam National University",
    location: { city: "Hanoi", country: "Vietnam", region: "Asia", coordinates: [105.8544, 21.0285] },
    topics: ["Languages", "Vietnamese", "Culture"],
    format: "visual-heavy",
    tags: ["immersive", "cultural", "conversational"],
    description: "Learn Vietnamese language through cultural immersion.",
    instructor: "Dr. Nguyen Thi Mai",
    students: 876
  },
  {
    id: 43,
    title: "Thai Cuisine Fundamentals",
    school: "Dusit Thani College",
    location: { city: "Bangkok", country: "Thailand", region: "Asia", coordinates: [100.5018, 13.7563] },
    topics: ["Culinary Arts", "Thai", "Hospitality"],
    format: "project-based",
    tags: ["hands-on", "cultural", "practical"],
    description: "Authentic Thai cooking techniques and flavor balancing.",
    instructor: "Chef Somchai",
    students: 654
  },
  // MIDDLE EAST
  {
    id: 44,
    title: "Cybersecurity Fundamentals",
    school: "Tel Aviv University",
    location: { city: "Tel Aviv", country: "Israel", region: "Middle East", coordinates: [34.8046, 32.1133] },
    topics: ["Cybersecurity", "Networks", "Ethical Hacking", "Computer Science"],
    format: "project-based",
    tags: ["hands-on", "practical", "lab-based"],
    description: "Practical cybersecurity training with real-world scenarios and lab exercises.",
    instructor: "Yosef Katz",
    students: 1876
  },
  {
    id: 45,
    title: "Blockchain Development",
    school: "New York University Abu Dhabi",
    location: { city: "Abu Dhabi", country: "UAE", region: "Middle East", coordinates: [54.4344, 24.5235] },
    topics: ["Blockchain", "Web3", "Solidity", "Computer Science"],
    format: "project-based",
    tags: ["cutting-edge", "practical", "hands-on"],
    description: "Build decentralized applications and smart contracts on Ethereum.",
    instructor: "Ahmed Al-Rashid",
    students: 1123
  },
  {
    id: 46,
    title: "Islamic Art & Architecture",
    school: "American University in Cairo",
    location: { city: "Cairo", country: "Egypt", region: "Middle East", coordinates: [31.4994, 30.0193] },
    topics: ["Art History", "Architecture", "Culture"],
    format: "visual-heavy",
    tags: ["cultural", "historical", "analytical"],
    description: "Study geometric patterns, calligraphy, and mosque architecture.",
    instructor: "Prof. Fatima Hassan",
    students: 765
  },
  {
    id: 47,
    title: "Arabic Language Intensive",
    school: "King Saud University",
    location: { city: "Riyadh", country: "Saudi Arabia", region: "Middle East", coordinates: [46.6753, 24.7251] },
    topics: ["Languages", "Arabic", "Communication"],
    format: "visual-heavy",
    tags: ["immersive", "intensive", "cultural"],
    description: "Modern Standard Arabic with dialect exposure.",
    instructor: "Dr. Mohammed Al-Faisal",
    students: 2134
  },
  {
    id: 48,
    title: "Petroleum Engineering",
    school: "Kuwait University",
    location: { city: "Kuwait City", country: "Kuwait", region: "Middle East", coordinates: [47.9774, 29.3697] },
    topics: ["Engineering", "Petroleum", "Energy"],
    format: "theory-heavy",
    tags: ["industry", "technical", "practical"],
    description: "Oil extraction, refining, and energy systems.",
    instructor: "Prof. Ali Al-Sabah",
    students: 987
  },
  // AFRICA
  {
    id: 49,
    title: "African Wildlife Conservation",
    school: "University of Cape Town",
    location: { city: "Cape Town", country: "South Africa", region: "Africa", coordinates: [18.4600, -33.9575] },
    topics: ["Conservation", "Biology", "Ecology"],
    format: "project-based",
    tags: ["field-work", "conservation", "research"],
    description: "Wildlife management and conservation in African ecosystems.",
    instructor: "Dr. Themba Ndlovu",
    students: 765
  },
  {
    id: 50,
    title: "Swahili Language & East African Culture",
    school: "University of Nairobi",
    location: { city: "Nairobi", country: "Kenya", region: "Africa", coordinates: [36.8172, -1.2833] },
    topics: ["Languages", "Swahili", "Culture"],
    format: "visual-heavy",
    tags: ["immersive", "cultural", "conversational"],
    description: "Learn Swahili and explore East African traditions.",
    instructor: "Prof. Amina Ochieng",
    students: 543
  },
  {
    id: 51,
    title: "Renewable Energy for Africa",
    school: "University of Lagos",
    location: { city: "Lagos", country: "Nigeria", region: "Africa", coordinates: [3.3792, 6.5244] },
    topics: ["Energy", "Sustainability", "Engineering"],
    format: "project-based",
    tags: ["practical", "sustainable", "impactful"],
    description: "Solar and off-grid energy solutions for developing regions.",
    instructor: "Dr. Chidi Okonkwo",
    students: 1234
  },
  {
    id: 52,
    title: "Ancient Egyptian History",
    school: "Cairo University",
    location: { city: "Giza", country: "Egypt", region: "Africa", coordinates: [31.2089, 30.0131] },
    topics: ["History", "Archaeology", "Egyptology"],
    format: "visual-heavy",
    tags: ["historical", "archaeological", "cultural"],
    description: "Pharaohs, pyramids, and the civilization of the Nile.",
    instructor: "Prof. Zahi Hawass",
    students: 2341
  },
  {
    id: 53,
    title: "Mobile Banking Innovation",
    school: "Strathmore University",
    location: { city: "Nairobi", country: "Kenya", region: "Africa", coordinates: [36.8876, -1.3100] },
    topics: ["FinTech", "Mobile", "Business", "Technology"],
    format: "project-based",
    tags: ["innovative", "practical", "industry"],
    description: "M-Pesa and mobile money systems that transformed Africa.",
    instructor: "Dr. James Mwangi",
    students: 876
  },
  // OCEANIA
  {
    id: 54,
    title: "Statistical Methods",
    school: "University of Sydney",
    location: { city: "Sydney", country: "Australia", region: "Oceania", coordinates: [151.1871, -33.8882] },
    topics: ["Statistics", "Data Analysis", "R", "Mathematics"],
    format: "theory-heavy",
    tags: ["rigorous", "practical", "research-oriented"],
    description: "Statistical methods for research with hands-on R programming exercises.",
    instructor: "Dr. Emma Wilson",
    students: 2134
  },
  {
    id: 55,
    title: "Marine Biology & Reef Conservation",
    school: "James Cook University",
    location: { city: "Townsville", country: "Australia", region: "Oceania", coordinates: [146.8169, -19.2590] },
    topics: ["Marine Biology", "Conservation", "Ecology"],
    format: "project-based",
    tags: ["field-work", "diving", "research"],
    description: "Study the Great Barrier Reef and coral conservation.",
    instructor: "Dr. Sarah Reef",
    students: 654
  },
  {
    id: 56,
    title: "Maori Language & Culture",
    school: "University of Auckland",
    location: { city: "Auckland", country: "New Zealand", region: "Oceania", coordinates: [174.7633, -36.8509] },
    topics: ["Languages", "Maori", "Culture", "Indigenous Studies"],
    format: "visual-heavy",
    tags: ["cultural", "immersive", "respectful"],
    description: "Te Reo Maori language and Polynesian cultural traditions.",
    instructor: "Prof. Tane Mahuta",
    students: 432
  },
  {
    id: 57,
    title: "Wine Science & Viticulture",
    school: "University of Adelaide",
    location: { city: "Adelaide", country: "Australia", region: "Oceania", coordinates: [138.6007, -34.9285] },
    topics: ["Viticulture", "Chemistry", "Agriculture"],
    format: "project-based",
    tags: ["practical", "industry", "scientific"],
    description: "Grape growing, winemaking, and sensory analysis.",
    instructor: "Prof. Michael Grape",
    students: 765
  },
  {
    id: 58,
    title: "Film Studies - New Zealand Cinema",
    school: "Victoria University of Wellington",
    location: { city: "Wellington", country: "New Zealand", region: "Oceania", coordinates: [174.7762, -41.2866] },
    topics: ["Film", "Media", "Arts"],
    format: "visual-heavy",
    tags: ["creative", "analytical", "industry"],
    description: "From Peter Jackson to indie films - NZ's film industry.",
    instructor: "Prof. Jane Campion",
    students: 543
  },
  // More varied topics
  {
    id: 59,
    title: "Sustainable Fashion Design",
    school: "Central Saint Martins",
    location: { city: "London", country: "UK", region: "Europe", coordinates: [-0.1195, 51.5342] },
    topics: ["Fashion", "Design", "Sustainability"],
    format: "project-based",
    tags: ["creative", "sustainable", "industry"],
    description: "Eco-friendly fashion design and circular economy principles.",
    instructor: "Stella McCartney",
    students: 876
  },
  {
    id: 60,
    title: "Space Exploration Technologies",
    school: "Caltech",
    location: { city: "Pasadena", country: "USA", region: "North America", coordinates: [-118.1253, 34.1377] },
    topics: ["Space", "Engineering", "Physics", "Technology"],
    format: "theory-heavy",
    tags: ["cutting-edge", "research", "NASA"],
    description: "Rocket propulsion, satellite systems, and Mars missions.",
    instructor: "Dr. Elon Research",
    students: 1654
  }
];

// Enrich curriculums with color and realistic outcome data
export const curriculums = rawCurriculums.map((c, i, arr) => ({
  ...c,
  color: generateColor(i, arr.length),
  ...generateRealisticOutcomes(c)
}));

// Convert to GeoJSON for Mapbox
export const curriculumsGeoJSON = {
  type: "FeatureCollection",
  features: curriculums.map(c => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: c.location.coordinates
    },
    properties: {
      id: c.id,
      title: c.title,
      school: c.school,
      city: c.location.city,
      country: c.location.country,
      region: c.location.region,
      topics: c.topics,
      topicsStr: c.topics.join(", "),
      format: c.format,
      tags: c.tags,
      tagsStr: c.tags.join(", "),
      description: c.description,
      instructor: c.instructor,
      students: c.students,
      color: c.color
    }
  }))
};

// Helper to filter curriculums by query
export const searchCurriculums = (query) => {
  const q = query.toLowerCase();
  return curriculums.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.topics.some(t => t.toLowerCase().includes(q)) ||
    c.school.toLowerCase().includes(q) ||
    c.location.city.toLowerCase().includes(q) ||
    c.location.country.toLowerCase().includes(q) ||
    c.location.region.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
};

// Get all unique subjects/topics from all curriculums
export const getAllSubjects = () => {
  const subjects = new Set();
  curriculums.forEach(c => {
    c.topics.forEach(topic => subjects.add(topic));
  });
  return Array.from(subjects).sort();
};

// Filter curriculums by subject/topic
export const filterBySubject = (subject) => {
  if (!subject) return curriculums;
  const s = subject.toLowerCase();
  return curriculums.filter(c =>
    c.topics.some(t => t.toLowerCase() === s)
  );
};
