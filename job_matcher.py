from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import pandas as pd
from typing import List, Dict, Tuple

class JobMatcher:
    def __init__(self):
        self.model = SentenceTransformer('all-mpnet-base-v2')
        self.threshold = 0.1
        self.min_score = 10.0
        self.onet_data = self.load_onet_data()
        self.job_embeddings = self.precompute_job_embeddings()
        
    def load_onet_data(self) -> Dict:
        """Load O*NET job data with skills, abilities, knowledge, etc."""
        # Mock O*NET data - in production, this would be loaded from actual O*NET database
        return {
            "15-1132.00": {
                "title": "Software Developer",
                "description": "Research, design, and develop computer and network software or specialized utility programs.",
                "skills": ["Programming", "Software Development", "Java", "Python", "JavaScript", "React", "Node.js", "SQL", "Git", "Agile Methodologies"],
                "abilities": ["Problem Solving", "Analytical Thinking", "Attention to Detail", "Communication", "Teamwork"],
                "knowledge": ["Computer Science", "Software Engineering", "Database Systems", "Web Development", "System Design"],
                "work_activities": ["Analyzing Information", "Thinking Creatively", "Working with Computers", "Communicating with Others"],
                "task_ratings": {"Programming": 4.5, "Testing": 4.2, "Documentation": 3.8, "Collaboration": 4.0},
                "tools_used": ["IDE", "Version Control", "Database Management Systems", "Testing Frameworks"],
                "technology_skills": ["React", "Angular", "Docker", "AWS", "Kubernetes", "Machine Learning", "APIs"]
            },
            "15-1121.00": {
                "title": "Data Scientist",
                "description": "Develop and implement a set of techniques or analytics applications to transform raw data into meaningful information.",
                "skills": ["Machine Learning", "Python", "R", "SQL", "Statistics", "Data Visualization", "Deep Learning", "TensorFlow", "Pandas", "NumPy"],
                "abilities": ["Statistical Analysis", "Problem Solving", "Critical Thinking", "Pattern Recognition", "Communication"],
                "knowledge": ["Statistics", "Mathematics", "Machine Learning", "Data Mining", "Business Intelligence"],
                "work_activities": ["Analyzing Data", "Interpreting Information", "Making Decisions", "Communicating Results"],
                "task_ratings": {"Data Analysis": 4.8, "Model Building": 4.6, "Visualization": 4.2, "Reporting": 4.0},
                "tools_used": ["Python", "R", "Tableau", "Power BI", "Jupyter Notebooks", "SQL Databases"],
                "technology_skills": ["TensorFlow", "PyTorch", "Scikit-learn", "Apache Spark", "Hadoop", "AWS", "Azure"]
            },
            "11-3021.00": {
                "title": "Marketing Manager",
                "description": "Plan, direct, or coordinate marketing policies and programs, such as determining the demand for products and services.",
                "skills": ["Marketing Strategy", "Digital Marketing", "SEO", "Social Media Marketing", "Content Marketing", "Analytics", "Campaign Management"],
                "abilities": ["Strategic Planning", "Communication", "Leadership", "Creativity", "Analytical Thinking"],
                "knowledge": ["Marketing", "Sales", "Customer Service", "Communications", "Business Administration"],
                "work_activities": ["Developing Strategies", "Coordinating Work", "Communicating with Others", "Making Decisions"],
                "task_ratings": {"Strategy Development": 4.5, "Campaign Management": 4.3, "Analytics": 4.0, "Team Leadership": 4.2},
                "tools_used": ["Google Analytics", "CRM Systems", "Social Media Platforms", "Email Marketing Tools"],
                "technology_skills": ["Google Ads", "Facebook Ads", "HubSpot", "Salesforce", "Adobe Creative Suite", "SEMrush"]
            },
            "13-2011.00": {
                "title": "Financial Analyst",
                "description": "Conduct quantitative analyses of information involving investment programs or financial data of public or private institutions.",
                "skills": ["Financial Analysis", "Excel", "Financial Modeling", "Valuation", "Risk Assessment", "Forecasting", "SQL"],
                "abilities": ["Analytical Thinking", "Attention to Detail", "Problem Solving", "Mathematical Skills", "Communication"],
                "knowledge": ["Finance", "Economics", "Accounting", "Statistics", "Business Administration"],
                "work_activities": ["Analyzing Financial Data", "Preparing Reports", "Making Recommendations", "Monitoring Markets"],
                "task_ratings": {"Financial Modeling": 4.6, "Analysis": 4.8, "Reporting": 4.2, "Forecasting": 4.4},
                "tools_used": ["Excel", "Bloomberg Terminal", "Financial Software", "Database Systems"],
                "technology_skills": ["Python", "R", "SQL", "Tableau", "PowerBI", "VBA", "MATLAB"]
            },
            "17-2061.00": {
                "title": "Computer Hardware Engineer",
                "description": "Research, design, develop, or test computer or computer-related equipment for commercial, industrial, military, or scientific use.",
                "skills": ["Hardware Design", "Circuit Design", "VHDL", "Verilog", "PCB Design", "Testing", "Debugging"],
                "abilities": ["Technical Skills", "Problem Solving", "Attention to Detail", "Analytical Thinking", "Innovation"],
                "knowledge": ["Computer Engineering", "Electronics", "Mathematics", "Physics", "Design"],
                "work_activities": ["Designing Equipment", "Testing Hardware", "Analyzing Problems", "Documenting Processes"],
                "task_ratings": {"Design": 4.7, "Testing": 4.5, "Analysis": 4.6, "Documentation": 4.0},
                "tools_used": ["CAD Software", "Oscilloscopes", "Logic Analyzers", "Simulation Tools"],
                "technology_skills": ["FPGA", "ARM", "Embedded Systems", "IoT", "Microcontrollers", "Altium Designer"]
            }
        }
    
    def precompute_job_embeddings(self) -> Dict:
        """Precompute embeddings for all jobs to improve performance."""
        embeddings = {}
        for job_id, job_data in self.onet_data.items():
            # Combine all relevant text for embedding
            combined_text = f"{job_data['title']} {job_data['description']} {' '.join(job_data['skills'])} {' '.join(job_data['abilities'])} {' '.join(job_data['knowledge'])}"
            embeddings[job_id] = self.model.encode([combined_text])[0]
        return embeddings
    
    def find_matches(self, user_skills: List[str], job_preference: str = "") -> List[Dict]:
        """Find job matches based on user skills and preferences."""
        # Create user profile embedding
        user_profile = ' '.join(user_skills)
        if job_preference:
            user_profile += f" {job_preference}"
        
        user_embedding = self.model.encode([user_profile])[0]
        
        matches = []
        
        for job_id, job_data in self.onet_data.items():
            # Calculate similarity with precomputed embeddings
            similarity = cosine_similarity(
                [user_embedding], 
                [self.job_embeddings[job_id]]
            )[0][0]
            
            # Calculate detailed matching score using the paper's approach
            score = self.calculate_matching_score(user_skills, job_data)
            
            if similarity >= self.threshold or score >= self.min_score:
                matches.append({
                    'job_id': job_id,
                    'title': job_data['title'],
                    'description': job_data['description'],
                    'similarity': float(similarity),
                    'score': float(score),
                    'skills_match': self.get_skills_match(user_skills, job_data['skills']),
                    'missing_skills': self.get_missing_skills(user_skills, job_data)
                })
        
        # Sort by combined score
        matches.sort(key=lambda x: (x['score'] + x['similarity'] * 50) / 2, reverse=True)
        
        return matches[:5]  # Return top 5 matches
    
    def calculate_matching_score(self, user_skills: List[str], job_data: Dict) -> float:
        """Calculate matching score based on the paper's formula (Equation 1)."""
        weights = {
            'skills': 0.30,
            'abilities': 0.20,
            'knowledge': 0.20,
            'work_activities': 0.15,
            'technology_skills': 0.15
        }
        
        total_score = 0
        
        for category, weight in weights.items():
            if category in job_data:
                category_score = self.calculate_category_score(user_skills, job_data[category])
                total_score += category_score * weight
        
        return total_score * 100  # Convert to percentage
    
    def calculate_category_score(self, user_skills: List[str], job_requirements: List[str]) -> float:
        """Calculate similarity score for a specific category."""
        if not job_requirements:
            return 0
        
        user_text = ' '.join(user_skills)
        job_text = ' '.join(job_requirements)
        
        user_embedding = self.model.encode([user_text])[0]
        job_embedding = self.model.encode([job_text])[0]
        
        similarity = cosine_similarity([user_embedding], [job_embedding])[0][0]
        return max(0, similarity)
    
    def get_skills_match(self, user_skills: List[str], job_skills: List[str]) -> Dict:
        """Get detailed skills matching information."""
        user_skills_lower = [skill.lower() for skill in user_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        matched = []
        for skill in job_skills:
            if skill.lower() in user_skills_lower:
                matched.append(skill)
        
        return {
            'matched_skills': matched,
            'match_percentage': (len(matched) / len(job_skills)) * 100 if job_skills else 0,
            'total_required': len(job_skills),
            'total_matched': len(matched)
        }
    
    def get_missing_skills(self, user_skills: List[str], job_data: Dict) -> Dict:
        """Get missing skills across all categories."""
        user_skills_lower = [skill.lower() for skill in user_skills]
        
        missing = {
            'skills': [],
            'abilities': [],
            'knowledge': [],
            'technology_skills': []
        }
        
        for category in missing.keys():
            if category in job_data:
                for item in job_data[category]:
                    if item.lower() not in user_skills_lower:
                        missing[category].append(item)
        
        return missing
    
    def analyze_skill_gap(self, job_id: str, user_skills: List[str]) -> Dict:
        """Analyze skill gap for a specific job."""
        if job_id not in self.onet_data:
            return {'error': 'Job not found'}
        
        job_data = self.onet_data[job_id]
        score = self.calculate_matching_score(user_skills, job_data)
        
        return {
            'job_title': job_data['title'],
            'current_score': score,
            'qualification_threshold': self.min_score,
            'qualifies': score >= self.min_score,
            'missing_skills': self.get_missing_skills(user_skills, job_data),
            'skills_match': self.get_skills_match(user_skills, job_data['skills']),
            'hot_technologies': job_data.get('technology_skills', [])[:5]
        }
    
    def get_skill_suggestions(self, query: str) -> List[str]:
        """Get skill suggestions for autocomplete."""
        all_skills = set()
        
        for job_data in self.onet_data.values():
            all_skills.update(job_data.get('skills', []))
            all_skills.update(job_data.get('technology_skills', []))
        
        query_lower = query.lower()
        suggestions = [skill for skill in all_skills if query_lower in skill.lower()]
        
        return sorted(suggestions)[:10]