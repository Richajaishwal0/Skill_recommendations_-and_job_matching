import requests
from typing import List, Dict
import json
import random

class CourseRecommender:
    def __init__(self):
        # Mock course database - in production, integrate with real APIs
        self.courses_db = {
            'python': [
                {
                    'title': 'Complete Python Bootcamp',
                    'provider': 'Udemy',
                    'rating': 4.6,
                    'students': 1234567,
                    'duration': '22 hours',
                    'level': 'Beginner to Advanced',
                    'url': 'https://www.udemy.com/course/complete-python-bootcamp',
                    'price': '$94.99',
                    'description': 'Learn Python like a Professional! Start from basics and go all the way to creating your own applications.'
                },
                {
                    'title': 'Python for Data Science and Machine Learning',
                    'provider': 'Coursera',
                    'rating': 4.5,
                    'students': 234567,
                    'duration': '25 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.coursera.org/specializations/python-data-science',
                    'price': '$49/month',
                    'description': 'Master Python for data science and machine learning with hands-on projects.'
                }
            ],
            'javascript': [
                {
                    'title': 'JavaScript: The Complete Guide',
                    'provider': 'Udemy',
                    'rating': 4.7,
                    'students': 345678,
                    'duration': '52 hours',
                    'level': 'All Levels',
                    'url': 'https://www.udemy.com/course/javascript-the-complete-guide',
                    'price': '$84.99',
                    'description': 'Modern JavaScript from the beginning! Learn JavaScript from scratch and become a JavaScript expert.'
                }
            ],
            'react': [
                {
                    'title': 'React - The Complete Guide',
                    'provider': 'Udemy',
                    'rating': 4.6,
                    'students': 456789,
                    'duration': '48 hours',
                    'level': 'Beginner to Advanced',
                    'url': 'https://www.udemy.com/course/react-the-complete-guide',
                    'price': '$94.99',
                    'description': 'Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Routing, Animations, Next.js and way more!'
                }
            ],
            'machine learning': [
                {
                    'title': 'Machine Learning Course',
                    'provider': 'Coursera',
                    'rating': 4.9,
                    'students': 678901,
                    'duration': '60 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.coursera.org/learn/machine-learning',
                    'price': '$49/month',
                    'description': 'Learn about the most effective machine learning techniques, and gain practice implementing them.'
                }
            ],
            'sql': [
                {
                    'title': 'The Complete SQL Bootcamp',
                    'provider': 'Udemy',
                    'rating': 4.5,
                    'students': 123456,
                    'duration': '9 hours',
                    'level': 'Beginner to Advanced',
                    'url': 'https://www.udemy.com/course/the-complete-sql-bootcamp',
                    'price': '$84.99',
                    'description': 'Learn SQL quickly and effectively with this comprehensive course.'
                }
            ],
            'aws': [
                {
                    'title': 'AWS Certified Solutions Architect',
                    'provider': 'Udemy',
                    'rating': 4.5,
                    'students': 234567,
                    'duration': '26 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.udemy.com/course/aws-certified-solutions-architect-associate',
                    'price': '$94.99',
                    'description': 'Pass the AWS Solutions Architect Associate Exam with this comprehensive course.'
                }
            ],
            'docker': [
                {
                    'title': 'Docker Mastery',
                    'provider': 'Udemy',
                    'rating': 4.6,
                    'students': 145678,
                    'duration': '19 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.udemy.com/course/docker-mastery',
                    'price': '$89.99',
                    'description': 'Build, compose, deploy, and manage Docker containers from development to production.'
                }
            ],
            'kubernetes': [
                {
                    'title': 'Kubernetes for Developers',
                    'provider': 'Coursera',
                    'rating': 4.4,
                    'students': 67890,
                    'duration': '15 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.coursera.org/learn/kubernetes-for-developers',
                    'price': '$49/month',
                    'description': 'Learn how to deploy, use, and maintain applications on Kubernetes.'
                }
            ],
            'data analysis': [
                {
                    'title': 'Data Analysis with Python',
                    'provider': 'Coursera',
                    'rating': 4.5,
                    'students': 178901,
                    'duration': '20 hours',
                    'level': 'Intermediate',
                    'url': 'https://www.coursera.org/learn/data-analysis-with-python',
                    'price': '$49/month',
                    'description': 'Learn how to analyze data using Python and popular libraries like pandas and NumPy.'
                }
            ],
            'digital marketing': [
                {
                    'title': 'Digital Marketing Masterclass',
                    'provider': 'Udemy',
                    'rating': 4.4,
                    'students': 89012,
                    'duration': '23 hours',
                    'level': 'All Levels',
                    'url': 'https://www.udemy.com/course/digital-marketing-masterclass',
                    'price': '$94.99',
                    'description': 'Master digital marketing with this comprehensive course covering SEO, social media, and more.'
                }
            ]
        }
        
        # General courses for common missing skills
        self.general_courses = [
            {
                'title': 'Communication Skills for Professionals',
                'provider': 'Coursera',
                'rating': 4.3,
                'students': 45678,
                'duration': '12 hours',
                'level': 'All Levels',
                'url': 'https://www.coursera.org/learn/communication-skills',
                'price': '$49/month',
                'description': 'Develop essential communication skills for professional success.'
            },
            {
                'title': 'Project Management Fundamentals',
                'provider': 'Udemy',
                'rating': 4.4,
                'students': 56789,
                'duration': '8 hours',
                'level': 'Beginner',
                'url': 'https://www.udemy.com/course/project-management-fundamentals',
                'price': '$79.99',
                'description': 'Learn the fundamentals of project management and become a better leader.'
            },
            {
                'title': 'Leadership Skills Development',
                'provider': 'Coursera',
                'rating': 4.5,
                'students': 34567,
                'duration': '16 hours',
                'level': 'Intermediate',
                'url': 'https://www.coursera.org/learn/leadership-skills',
                'price': '$49/month',
                'description': 'Develop leadership skills that will help you succeed in any role.'
            }
        ]
    
    def recommend_courses(self, missing_skills: Dict[str, List[str]]) -> List[Dict]:
        """Recommend courses based on missing skills."""
        recommendations = []
        
        # Prioritize technical skills
        skill_priority = ['skills', 'technology_skills', 'knowledge', 'abilities']
        
        for category in skill_priority:
            if category in missing_skills:
                for skill in missing_skills[category][:3]:  # Limit to top 3 per category
                    courses = self.find_courses_for_skill(skill)
                    if courses:
                        recommendations.extend(courses[:2])  # Top 2 courses per skill
        
        # Remove duplicates and limit to 5 recommendations
        seen = set()
        unique_recommendations = []
        
        for course in recommendations:
            if course['title'] not in seen:
                seen.add(course['title'])
                unique_recommendations.append(course)
                if len(unique_recommendations) >= 5:
                    break
        
        # Fill with general courses if needed
        while len(unique_recommendations) < 3:
            general_course = random.choice(self.general_courses)
            if general_course['title'] not in seen:
                unique_recommendations.append(general_course)
                seen.add(general_course['title'])
        
        return unique_recommendations
    
    def find_courses_for_skill(self, skill: str) -> List[Dict]:
        """Find courses for a specific skill."""
        skill_lower = skill.lower()
        
        # Direct match
        if skill_lower in self.courses_db:
            return self.courses_db[skill_lower]
        
        # Partial match
        for key, courses in self.courses_db.items():
            if skill_lower in key or key in skill_lower:
                return courses
        
        # Fuzzy match based on keywords
        matches = []
        for key, courses in self.courses_db.items():
            if self.similarity_score(skill_lower, key) > 0.6:
                matches.extend(courses)
        
        return matches
    
    def similarity_score(self, skill1: str, skill2: str) -> float:
        """Calculate similarity score between two skills."""
        skill1_words = set(skill1.split())
        skill2_words = set(skill2.split())
        
        if not skill1_words or not skill2_words:
            return 0
        
        intersection = skill1_words.intersection(skill2_words)
        union = skill1_words.union(skill2_words)
        
        return len(intersection) / len(union)
    
    def get_course_by_category(self, category: str) -> List[Dict]:
        """Get courses by category."""
        category_mappings = {
            'programming': ['python', 'javascript', 'java'],
            'web_development': ['javascript', 'react', 'html', 'css'],
            'data_science': ['python', 'machine learning', 'sql', 'data analysis'],
            'cloud': ['aws', 'docker', 'kubernetes'],
            'marketing': ['digital marketing', 'seo', 'social media']
        }
        
        courses = []
        if category in category_mappings:
            for skill in category_mappings[category]:
                courses.extend(self.find_courses_for_skill(skill))
        
        return courses[:5]  # Return top 5
    
    def get_trending_courses(self) -> List[Dict]:
        """Get trending courses based on high ratings and student count."""
        all_courses = []
        for courses in self.courses_db.values():
            all_courses.extend(courses)
        
        # Sort by rating and student count
        trending = sorted(all_courses, key=lambda x: (x['rating'], x['students']), reverse=True)
        
        return trending[:5]
    
    def search_courses(self, query: str) -> List[Dict]:
        """Search courses by query."""
        results = []
        query_lower = query.lower()
        
        for skill, courses in self.courses_db.items():
            if query_lower in skill:
                results.extend(courses)
            else:
                for course in courses:
                    if (query_lower in course['title'].lower() or 
                        query_lower in course['description'].lower()):
                        results.append(course)
        
        return results[:10]  # Return top 10 results