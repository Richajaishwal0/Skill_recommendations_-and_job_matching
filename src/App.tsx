import React, { useState, useRef, useCallback } from 'react';
import { Upload, Search, FileText, Brain, TrendingUp, BookOpen, CheckCircle, XCircle, Star, ExternalLink, Trash2, Sparkles, Target, Award, Zap, Users, Code, Database, Globe, Cpu, Shield, Palette } from 'lucide-react';

interface Skill {
  name: string;
  category: string;
  confidence: number;
}

interface JobMatch {
  id: string;
  title: string;
  description: string;
  similarity: number;
  score: number;
  matchedSkills: string[];
  missingSkills: {
    skills: string[];
    abilities: string[];
    knowledge: string[];
    technology_skills: string[];
  };
  qualifies: boolean;
  salaryRange: string;
  growthRate: string;
}

interface Course {
  title: string;
  provider: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  url: string;
  price: string;
  description: string;
  image: string;
}

function App() {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [jobPreference, setJobPreference] = useState('');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced O*NET job database with more details
  const jobDatabase = {
    "15-1132.00": {
      title: "Software Developer",
      description: "Research, design, and develop computer and network software or specialized utility programs. Analyze user needs and develop software solutions.",
      skills: ["Programming", "Software Development", "Java", "Python", "JavaScript", "React", "Node.js", "SQL", "Git", "Agile Methodologies", "Object-Oriented Programming", "Web Development", "API Development", "Testing", "Debugging"],
      abilities: ["Problem Solving", "Analytical Thinking", "Attention to Detail", "Communication", "Teamwork", "Critical Thinking", "Creativity", "Time Management"],
      knowledge: ["Computer Science", "Software Engineering", "Database Systems", "Web Development", "System Design", "Algorithms", "Data Structures", "Software Architecture"],
      technology_skills: ["React", "Angular", "Vue.js", "Docker", "Kubernetes", "AWS", "Azure", "Machine Learning", "APIs", "GraphQL", "MongoDB", "PostgreSQL", "Redis", "Jenkins", "CI/CD"],
      salaryRange: "$70,000 - $150,000",
      growthRate: "22% (Much faster than average)"
    },
    "15-1121.00": {
      title: "Data Scientist",
      description: "Develop and implement a set of techniques or analytics applications to transform raw data into meaningful information using statistical analysis and machine learning.",
      skills: ["Machine Learning", "Python", "R", "SQL", "Statistics", "Data Visualization", "Deep Learning", "TensorFlow", "Pandas", "NumPy", "Data Mining", "Statistical Analysis", "Predictive Modeling", "Big Data", "ETL"],
      abilities: ["Statistical Analysis", "Problem Solving", "Critical Thinking", "Pattern Recognition", "Communication", "Mathematical Reasoning", "Research Skills", "Attention to Detail"],
      knowledge: ["Statistics", "Mathematics", "Machine Learning", "Data Mining", "Business Intelligence", "Computer Science", "Domain Expertise", "Research Methods"],
      technology_skills: ["TensorFlow", "PyTorch", "Scikit-learn", "Apache Spark", "Hadoop", "AWS", "Azure", "Tableau", "Power BI", "Jupyter", "Docker", "Kubernetes", "MLflow", "Airflow"],
      salaryRange: "$95,000 - $180,000",
      growthRate: "35% (Much faster than average)"
    },
    "11-3021.00": {
      title: "Marketing Manager",
      description: "Plan, direct, or coordinate marketing policies and programs, such as determining the demand for products and services offered by a firm and its competitors.",
      skills: ["Marketing Strategy", "Digital Marketing", "SEO", "Social Media Marketing", "Content Marketing", "Analytics", "Campaign Management", "Brand Management", "Market Research", "Lead Generation", "Email Marketing", "PPC Advertising"],
      abilities: ["Strategic Planning", "Communication", "Leadership", "Creativity", "Analytical Thinking", "Project Management", "Negotiation", "Presentation Skills"],
      knowledge: ["Marketing", "Sales", "Customer Service", "Communications", "Business Administration", "Consumer Behavior", "Market Research", "Brand Management"],
      technology_skills: ["Google Ads", "Facebook Ads", "HubSpot", "Salesforce", "Adobe Creative Suite", "SEMrush", "Google Analytics", "Mailchimp", "Hootsuite", "Canva", "WordPress", "Shopify"],
      salaryRange: "$65,000 - $140,000",
      growthRate: "10% (Faster than average)"
    },
    "13-2011.00": {
      title: "Financial Analyst",
      description: "Conduct quantitative analyses of information involving investment programs or financial data of public or private institutions, including valuation of businesses.",
      skills: ["Financial Analysis", "Excel", "Financial Modeling", "Valuation", "Risk Assessment", "Forecasting", "SQL", "Investment Analysis", "Portfolio Management", "Financial Reporting", "Budgeting", "Cost Analysis"],
      abilities: ["Analytical Thinking", "Attention to Detail", "Problem Solving", "Mathematical Skills", "Communication", "Critical Thinking", "Time Management", "Research Skills"],
      knowledge: ["Finance", "Economics", "Accounting", "Statistics", "Business Administration", "Investment Theory", "Financial Markets", "Corporate Finance"],
      technology_skills: ["Python", "R", "SQL", "Tableau", "Power BI", "VBA", "MATLAB", "Bloomberg Terminal", "FactSet", "Excel", "QuickBooks", "SAP"],
      salaryRange: "$60,000 - $120,000",
      growthRate: "6% (As fast as average)"
    },
    "17-2061.00": {
      title: "Computer Hardware Engineer",
      description: "Research, design, develop, or test computer or computer-related equipment for commercial, industrial, military, or scientific use.",
      skills: ["Hardware Design", "Circuit Design", "VHDL", "Verilog", "PCB Design", "Testing", "Debugging", "Embedded Systems", "Microprocessors", "Signal Processing", "System Integration", "CAD Design"],
      abilities: ["Technical Skills", "Problem Solving", "Attention to Detail", "Analytical Thinking", "Innovation", "Mathematical Skills", "Research Skills", "Project Management"],
      knowledge: ["Computer Engineering", "Electronics", "Mathematics", "Physics", "Design", "Manufacturing", "Quality Control", "System Architecture"],
      technology_skills: ["FPGA", "ARM", "Embedded Systems", "IoT", "Microcontrollers", "Altium Designer", "Cadence", "MATLAB", "LabVIEW", "Oscilloscopes", "Logic Analyzers", "CAD Software"],
      salaryRange: "$75,000 - $160,000",
      growthRate: "2% (Slower than average)"
    }
  };

  // Enhanced course database with images
  const courseDatabase: { [key: string]: Course[] } = {
    'python': [
      {
        title: 'Complete Python Bootcamp: Go from Zero to Hero',
        provider: 'Udemy',
        rating: 4.6,
        students: 1234567,
        duration: '22 hours',
        level: 'Beginner to Advanced',
        url: 'https://www.udemy.com/course/complete-python-bootcamp',
        price: '$94.99',
        description: 'Learn Python like a Professional! Start from basics and go all the way to creating your own applications and games.',
        image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    'javascript': [
      {
        title: 'JavaScript: The Complete Guide 2024',
        provider: 'Udemy',
        rating: 4.7,
        students: 345678,
        duration: '52 hours',
        level: 'All Levels',
        url: 'https://www.udemy.com/course/javascript-the-complete-guide',
        price: '$84.99',
        description: 'Modern JavaScript from the beginning! Learn JavaScript from scratch and become a JavaScript expert.',
        image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    'react': [
      {
        title: 'React - The Complete Guide 2024',
        provider: 'Udemy',
        rating: 4.6,
        students: 456789,
        duration: '48 hours',
        level: 'Beginner to Advanced',
        url: 'https://www.udemy.com/course/react-the-complete-guide',
        price: '$94.99',
        description: 'Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Routing, Animations, Next.js and way more!',
        image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    'machine learning': [
      {
        title: 'Machine Learning Specialization',
        provider: 'Coursera',
        rating: 4.9,
        students: 678901,
        duration: '60 hours',
        level: 'Intermediate',
        url: 'https://www.coursera.org/learn/machine-learning',
        price: '$49/month',
        description: 'Learn about the most effective machine learning techniques, and gain practice implementing them.',
        image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    'sql': [
      {
        title: 'The Complete SQL Bootcamp 2024',
        provider: 'Udemy',
        rating: 4.5,
        students: 123456,
        duration: '9 hours',
        level: 'Beginner to Advanced',
        url: 'https://www.udemy.com/course/the-complete-sql-bootcamp',
        price: '$84.99',
        description: 'Learn SQL quickly and effectively with this comprehensive course covering PostgreSQL and more.',
        image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ]
  };

  // Comprehensive skill database for enhanced extraction
  const comprehensiveSkillDatabase = {
    'programming_languages': [
      'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C', 'Dart', 'Elixir', 'Haskell', 'Clojure', 'F#', 'VB.NET', 'COBOL', 'Fortran', 'Assembly', 'Shell Scripting', 'PowerShell', 'Bash'
    ],
    'web_technologies': [
      'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Sass', 'Less', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js', 'Gatsby', 'Svelte', 'Ember.js', 'Backbone.js', 'GraphQL', 'REST API', 'SOAP', 'WebSockets'
    ],
    'databases': [
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Oracle', 'SQL Server', 'SQLite', 'MariaDB', 'Neo4j', 'CouchDB', 'InfluxDB', 'Firebase', 'Supabase', 'PlanetScale', 'Prisma', 'Sequelize', 'Mongoose', 'Knex.js'
    ],
    'cloud_platforms': [
      'AWS', 'Azure', 'Google Cloud Platform', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean', 'Linode', 'Vultr', 'CloudFlare', 'Ansible', 'Chef', 'Puppet', 'Vagrant'
    ],
    'data_science': [
      'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Visualization', 'Statistics', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'MLflow', 'Kubeflow', 'Data Mining', 'Natural Language Processing', 'NLP', 'Computer Vision', 'Neural Networks', 'Reinforcement Learning'
    ],
    'mobile_development': [
      'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'Swift', 'Kotlin', 'Objective-C', 'Java', 'Dart', 'Unity', 'Unreal Engine', 'ARKit', 'ARCore', 'Firebase', 'Realm', 'Core Data'
    ],
    'devops_tools': [
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'JIRA', 'Confluence', 'Slack', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Linear', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Zeplin', 'Postman', 'Insomnia', 'Swagger', 'OpenAPI'
    ],
    'methodologies': [
      'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'Waterfall', 'Lean', 'Six Sigma', 'ITIL', 'Prince2', 'SAFe', 'Extreme Programming', 'XP', 'Pair Programming', 'Code Review', 'Design Patterns', 'SOLID Principles', 'Clean Code', 'Refactoring'
    ],
    'soft_skills': [
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Analytical Thinking', 'Critical Thinking', 'Creativity', 'Innovation', 'Adaptability', 'Time Management', 'Project Management', 'Strategic Planning', 'Decision Making', 'Conflict Resolution', 'Negotiation', 'Presentation Skills', 'Public Speaking', 'Mentoring', 'Coaching', 'Emotional Intelligence'
    ],
    'business_skills': [
      'Project Management', 'Business Analysis', 'Requirements Gathering', 'Stakeholder Management', 'Risk Management', 'Quality Assurance', 'Process Improvement', 'Change Management', 'Vendor Management', 'Budget Management', 'Financial Analysis', 'Market Research', 'Customer Service', 'Sales', 'Marketing', 'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Brand Management'
    ],
    'security': [
      'Cybersecurity', 'Information Security', 'Network Security', 'Application Security', 'Cloud Security', 'Penetration Testing', 'Vulnerability Assessment', 'Incident Response', 'Risk Assessment', 'Compliance', 'GDPR', 'HIPAA', 'SOX', 'PCI DSS', 'ISO 27001', 'NIST', 'Encryption', 'PKI', 'SSL/TLS', 'OAuth', 'SAML', 'Active Directory', 'LDAP'
    ],
    'design': [
      'UI/UX Design', 'User Experience', 'User Interface', 'Graphic Design', 'Web Design', 'Mobile Design', 'Responsive Design', 'Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Information Architecture', 'Interaction Design', 'Visual Design', 'Typography', 'Color Theory', 'Design Systems', 'Accessibility', 'WCAG', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro'
    ]
  };

  // Enhanced skill extraction with better pattern matching
  const extractSkillsFromText = (text: string): Skill[] => {
    const extractedSkills: Skill[] = [];
    const textLower = text.toLowerCase();
    const skillConfidence: { [key: string]: number } = {};

    // Flatten all skills for searching
    const allSkills = Object.values(comprehensiveSkillDatabase).flat();
    
    // Direct skill matching with context scoring
    allSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        let confidence = 0.7; // Base confidence
        
        // Boost confidence based on context
        const contextPatterns = [
          `experienced in ${skillLower}`,
          `skilled in ${skillLower}`,
          `proficient in ${skillLower}`,
          `expert in ${skillLower}`,
          `${skillLower} developer`,
          `${skillLower} engineer`,
          `${skillLower} specialist`,
          `years of ${skillLower}`,
          `${skillLower} certification`,
          `${skillLower} project`
        ];
        
        contextPatterns.forEach(pattern => {
          if (textLower.includes(pattern)) {
            confidence += 0.1;
          }
        });
        
        // Find category
        let category = 'general';
        Object.entries(comprehensiveSkillDatabase).forEach(([cat, skills]) => {
          if (skills.includes(skill)) {
            category = cat.replace('_', ' ');
          }
        });
        
        skillConfidence[skill] = Math.min(confidence, 1.0);
        extractedSkills.push({
          name: skill,
          category,
          confidence: skillConfidence[skill]
        });
      }
    });

    // Extract skills from common resume patterns
    const patterns = [
      /(?:skills?|technologies?|tools?|languages?)[:\s]*([^.]+)/gi,
      /(?:experienced in|skilled in|proficient in|knowledge of|familiar with)[:\s]*([^.]+)/gi,
      /(?:programming languages?|technical skills?|core competencies?)[:\s]*([^.]+)/gi,
      /•\s*([^•\n]+)/g,
      /-\s*([^-\n]+)/g,
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const items = match.split(/[,;|&]/).map(item => item.trim());
          items.forEach(item => {
            const cleanItem = item.replace(/^[•\-\s]*/, '').replace(/[:\s]*$/, '').trim();
            if (cleanItem.length > 2 && cleanItem.length < 50) {
              // Check if it's a known skill
              const foundSkill = allSkills.find(skill => 
                skill.toLowerCase() === cleanItem.toLowerCase() ||
                cleanItem.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(cleanItem.toLowerCase())
              );
              
              if (foundSkill && !extractedSkills.some(s => s.name === foundSkill)) {
                let category = 'general';
                Object.entries(comprehensiveSkillDatabase).forEach(([cat, skills]) => {
                  if (skills.includes(foundSkill)) {
                    category = cat.replace('_', ' ');
                  }
                });
                
                extractedSkills.push({
                  name: foundSkill,
                  category,
                  confidence: 0.6
                });
              }
            }
          });
        });
      }
    });

    // Remove duplicates and sort by confidence
    const uniqueSkills = extractedSkills.filter((skill, index, self) => 
      index === self.findIndex(s => s.name === skill.name)
    );

    return uniqueSkills.sort((a, b) => b.confidence - a.confidence);
  };

  // Enhanced skill suggestions with categories
  const getSkillSuggestions = (query: string) => {
    const allSkills = Object.values(comprehensiveSkillDatabase).flat();
    return allSkills
      .filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase()) &&
        !userSkills.includes(skill)
      )
      .slice(0, 8);
  };

  const calculateSimilarity = (userSkills: string[], jobSkills: string[]): number => {
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    
    const intersection = userSkillsLower.filter(skill => 
      jobSkillsLower.some(jobSkill => 
        jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );
    
    const union = [...new Set([...userSkillsLower, ...jobSkillsLower])];
    return intersection.length / union.length;
  };

  const calculateMatchingScore = (userSkills: string[], jobData: any): number => {
    const weights = {
      skills: 0.30,
      abilities: 0.20,
      knowledge: 0.20,
      technology_skills: 0.30
    };

    let totalScore = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (jobData[category]) {
        const categoryScore = calculateSimilarity(userSkills, jobData[category]);
        totalScore += categoryScore * weight;
      }
    });

    return totalScore * 100;
  };

  const findJobMatches = useCallback(() => {
    if (userSkills.length === 0) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const matches: JobMatch[] = [];
      
      Object.entries(jobDatabase).forEach(([jobId, jobData]) => {
        const similarity = calculateSimilarity(userSkills, [...jobData.skills, ...jobData.technology_skills]);
        const score = calculateMatchingScore(userSkills, jobData);
        
        if (similarity >= 0.2 || score >= 15) {
          const userSkillsLower = userSkills.map(s => s.toLowerCase());
          const allJobSkills = [...jobData.skills, ...jobData.technology_skills];
          
          const matchedSkills = allJobSkills.filter(skill =>
            userSkillsLower.some(userSkill =>
              userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
            )
          );

          const missingSkills = {
            skills: jobData.skills.filter(skill => !matchedSkills.includes(skill)),
            abilities: jobData.abilities.filter(ability => 
              !userSkillsLower.some(userSkill => userSkill.includes(ability.toLowerCase()))
            ),
            knowledge: jobData.knowledge.filter(knowledge => 
              !userSkillsLower.some(userSkill => userSkill.includes(knowledge.toLowerCase()))
            ),
            technology_skills: jobData.technology_skills.filter(tech => !matchedSkills.includes(tech))
          };

          matches.push({
            id: jobId,
            title: jobData.title,
            description: jobData.description,
            similarity: similarity * 100,
            score,
            matchedSkills,
            missingSkills,
            qualifies: score >= 34.62,
            salaryRange: jobData.salaryRange,
            growthRate: jobData.growthRate
          });
        }
      });

      matches.sort((a, b) => (b.score + b.similarity) - (a.score + a.similarity));
      setJobMatches(matches.slice(0, 5));
      setShowResults(true);
      setIsLoading(false);
    }, 2000);
  }, [userSkills]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsLoading(true);
      
      setTimeout(() => {
        // Simulate advanced resume processing
        const mockResumeText = `
          John Doe - Senior Software Developer
          
          TECHNICAL SKILLS:
          • Programming Languages: Python, JavaScript, TypeScript, Java, C++, Go
          • Web Technologies: React, Angular, Vue.js, Node.js, Express.js, Django, Flask
          • Databases: PostgreSQL, MongoDB, Redis, MySQL, Elasticsearch
          • Cloud Platforms: AWS, Azure, Docker, Kubernetes, Terraform
          • DevOps: Jenkins, GitLab CI, GitHub Actions, Docker, Kubernetes
          • Machine Learning: TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy
          • Tools: Git, JIRA, Confluence, Postman, Figma
          
          EXPERIENCE:
          Senior Software Developer at Tech Corp (2020-Present)
          • Developed scalable web applications using React and Node.js
          • Implemented machine learning models using Python and TensorFlow
          • Led a team of 5 developers using Agile methodologies
          • Deployed applications on AWS using Docker and Kubernetes
          
          CERTIFICATIONS:
          • AWS Certified Solutions Architect
          • Google Cloud Professional Developer
          • Certified Scrum Master
        `;
        
        const skills = extractSkillsFromText(mockResumeText);
        setExtractedSkills(skills);
        setUserSkills(skills.map(s => s.name));
        setExtractedText(`Successfully processed ${file.name}. Extracted ${skills.length} skills with advanced pattern matching.`);
        setIsLoading(false);
      }, 2500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setUploadedFile(file);
        handleFileUpload({ target: { files: [file] } } as any);
      }
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !userSkills.includes(skill)) {
      setUserSkills([...userSkills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill(skillInput);
    }
  };

  const showSkillGapAnalysis = (job: JobMatch) => {
    setSelectedJob(job);
    
    const relevantCourses: Course[] = [];
    const allMissingSkills = [
      ...job.missingSkills.skills,
      ...job.missingSkills.technology_skills
    ];

    allMissingSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      Object.entries(courseDatabase).forEach(([key, courses]) => {
        if (skillLower.includes(key) || key.includes(skillLower)) {
          relevantCourses.push(...courses);
        }
      });
    });

    if (relevantCourses.length === 0) {
      relevantCourses.push(...Object.values(courseDatabase).flat().slice(0, 4));
    }

    setCourses(relevantCourses.slice(0, 6));
    setShowSkillGap(true);
  };

  const filteredSuggestions = getSkillSuggestions(skillInput);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'programming languages': <Code className="w-4 h-4" />,
      'web technologies': <Globe className="w-4 h-4" />,
      'databases': <Database className="w-4 h-4" />,
      'cloud platforms': <Cpu className="w-4 h-4" />,
      'data science': <Brain className="w-4 h-4" />,
      'security': <Shield className="w-4 h-4" />,
      'design': <Palette className="w-4 h-4" />,
      'soft skills': <Users className="w-4 h-4" />,
      'general': <Target className="w-4 h-4" />
    };
    return icons[category] || <Target className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative">
                <Brain className="w-10 h-10 text-blue-600 mr-4" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Job Matcher Pro
                </h1>
                <p className="text-sm text-gray-500 mt-1">Advanced Career Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Powered by Transformers & O*NET</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Award className="w-4 h-4" />
                <span>Pro Version</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Next-Generation Job Matching</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"> Perfect </span>
            Career Match
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Upload your resume or enter your skills to get AI-powered job recommendations with 
            <span className="font-semibold text-blue-600"> advanced semantic analysis</span>, 
            personalized skill gap insights, and curated learning paths.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">500K+</div>
              <div className="text-sm text-gray-500">Skills Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-500">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">10K+</div>
              <div className="text-sm text-gray-500">Courses Available</div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Enhanced Resume Upload */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-blue-300/50 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    Smart Resume Analysis
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Brain className="w-3 h-3" />
                    <span>AI Powered</span>
                  </div>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50/50 scale-105' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-blue-600 font-medium">Analyzing your resume with AI...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                        {uploadedFile && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {uploadedFile ? uploadedFile.name : 'Drop your resume here or click to browse'}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        PDF, DOCX supported • Advanced skill extraction • Instant analysis
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <Upload className="w-5 h-5 inline mr-2" />
                        Choose File
                      </button>
                    </>
                  )}
                </div>

                {extractedText && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Analysis Complete</span>
                    </div>
                    <p className="text-green-700 text-sm mb-4">{extractedText}</p>
                    
                    {extractedSkills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-3">Extracted Skills by Category:</h4>
                        <div className="space-y-3">
                          {Object.entries(
                            extractedSkills.reduce((acc, skill) => {
                              if (!acc[skill.category]) acc[skill.category] = [];
                              acc[skill.category].push(skill);
                              return acc;
                            }, {} as { [key: string]: Skill[] })
                          ).map(([category, skills]) => (
                            <div key={category} className="bg-white/50 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                {getCategoryIcon(category)}
                                <span className="text-sm font-medium text-gray-700 ml-2 capitalize">
                                  {category} ({skills.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {skills.slice(0, 5).map((skill) => (
                                  <span
                                    key={skill.name}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {skill.name}
                                    <span className="ml-1 text-green-600">
                                      {Math.round(skill.confidence * 100)}%
                                    </span>
                                  </span>
                                ))}
                                {skills.length > 5 && (
                                  <span className="text-xs text-gray-500 px-2 py-1">
                                    +{skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Manual Skills Entry */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-green-300/50 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 shadow-lg">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    Manual Skill Entry
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <Target className="w-3 h-3" />
                    <span>Precision Mode</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillInputKeyPress}
                      placeholder="Type a skill and press Enter..."
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    
                    {skillInput && filteredSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => addSkill(suggestion)}
                            className="w-full px-6 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200 flex items-center justify-between group"
                          >
                            <span className="font-medium text-gray-700 group-hover:text-green-700">
                              {suggestion}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={jobPreference}
                      onChange={(e) => setJobPreference(e.target.value)}
                      placeholder="Preferred job role (optional)"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Your Skills Portfolio</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{userSkills.length} skills</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="min-h-[120px] p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                      {userSkills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <Target className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">Add skills above to build your portfolio</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {userSkills.map((skill, index) => (
                            <span
                              key={skill}
                              className="group inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-fade-in"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:text-red-200 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={findJobMatches}
                    disabled={userSkills.length === 0 || isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Analyzing Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Find Perfect Matches
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Results Section */}
        {showResults && (
          <div className="animate-fade-in">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-gray-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  Job Recommendations
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Found {jobMatches.length} matches
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                    <Award className="w-4 h-4" />
                    <span>AI Ranked</span>
                  </div>
                </div>
              </div>
              
              {jobMatches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h4>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adding more skills or adjusting your preferences to find better matches.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {jobMatches.map((job, index) => (
                    <div
                      key={job.id}
                      className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in overflow-hidden"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {job.title}
                              </h4>
                              {job.qualifies && (
                                <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                {job.salaryRange}
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {job.growthRate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                              {Math.round((job.score + job.similarity) / 2)}%
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Match Score</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Skills Match</span>
                            <span className="text-sm font-bold text-blue-600">
                              {job.matchedSkills.length} of {job.matchedSkills.length + job.missingSkills.skills.length} skills
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(job.similarity, 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.matchedSkills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-md font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.matchedSkills.length > 4 && (
                              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                                +{job.matchedSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {job.qualifies ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm font-medium text-green-600">Qualified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-orange-500 mr-2" />
                                <span className="text-sm font-medium text-orange-600">Needs Development</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>AI Matched</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => showSkillGapAnalysis(job)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          Analyze Skills Gap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Skill Gap Modal */}
        {showSkillGap && selectedJob && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      Skills Gap Analysis
                    </h3>
                    <p className="text-gray-600">Detailed breakdown and learning recommendations</p>
                  </div>
                  <button
                    onClick={() => setShowSkillGap(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedJob.title}
                    </h4>
                    <p className="text-gray-600 mb-4">{selectedJob.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {selectedJob.salaryRange}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {selectedJob.growthRate}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round(selectedJob.score)}%
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Current Score</div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${selectedJob.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">35%</div>
                      <div className="text-sm text-gray-600 font-medium">Required Score</div>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-3">
                        <div className="bg-yellow-600 h-2 rounded-full w-[35%]" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                      <div className="text-lg font-bold flex items-center mb-2">
                        {selectedJob.qualifies ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                            <span className="text-green-600">Qualified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-orange-600 mr-2" />
                            <span className="text-orange-600">Needs Development</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Status</div>
                    </div>
                  </div>
                </div>
                
                {!selectedJob.qualifies && (
                  <div className="mb-8">
                    <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Target className="w-6 h-6 text-orange-500 mr-3" />
                      Skills Development Areas
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(selectedJob.missingSkills).map(([category, skills]) =>
                        skills.length > 0 ? (
                          <div key={category} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                              {getCategoryIcon(category)}
                              <h6 className="font-bold text-gray-800 ml-2 capitalize">
                                {category.replace('_', ' ')} ({skills.length})
                              </h6>
                            </div>
                            <div className="space-y-2">
                              {skills.slice(0, 6).map((skill) => (
                                <div
                                  key={skill}
                                  className="flex items-center justify-between text-sm bg-white/70 px-4 py-2 rounded-lg"
                                >
                                  <span className="text-gray-700 font-medium">{skill}</span>
                                  <span className="text-orange-600 text-xs font-medium">Required</span>
                                </div>
                              ))}
                              {skills.length > 6 && (
                                <div className="text-xs text-gray-500 text-center py-2">
                                  +{skills.length - 6} more skills
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 text-blue-500 mr-3" />
                    Recommended Learning Path
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                      <div
                        key={index}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                            {course.level}
                          </div>
                        </div>
                        <div className="p-6">
                          <h6 className="font-bold text-gray-900 mb-2 line-clamp-2">
                            {course.title}
                          </h6>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500 font-medium">
                              {course.provider}
                            </span>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(course.rating)
                                        ? 'fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                {course.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-green-600">
                              {course.price}
                            </span>
                            <span className="text-xs text-gray-500">
                              {course.duration} • {course.students.toLocaleString()} students
                            </span>
                          </div>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                          >
                            Start Learning
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;