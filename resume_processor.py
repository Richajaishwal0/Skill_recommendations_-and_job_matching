import PyPDF2
import docx
import re
from typing import List, Set
import os

class ResumeProcessor:
    def __init__(self):
        # spaCy is optional - use basic processing if not available
        self.nlp = None
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
        except (ImportError, OSError):
            # Fallback to basic processing if spaCy not available
            pass
        
        # Comprehensive skill keywords for extraction
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'c', 'vb.net', 'dart', 'elixir', 'haskell', 'clojure'],
            'web': ['html', 'css', 'react', 'angular', 'vue.js', 'vue', 'nodejs', 'node.js', 'express', 'django', 'flask', 'bootstrap', 'tailwind', 'sass', 'less', 'jquery', 'webpack', 'vite', 'next.js', 'nuxt.js', 'gatsby', 'svelte'],
            'data': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'hadoop', 'spark', 'kafka', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'cassandra', 'dynamodb', 'firebase', 'supabase'],
            'ml': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 'jupyter', 'keras', 'opencv', 'nltk', 'spacy', 'transformers'],
            'cloud': ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab', 'github actions', 'circleci', 'heroku', 'vercel', 'netlify', 'digitalocean'],
            'mobile': ['android', 'ios', 'flutter', 'react native', 'xamarin', 'ionic', 'cordova', 'unity', 'kotlin', 'swift', 'objective-c'],
            'tools': ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello', 'asana', 'figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator', 'postman', 'insomnia'],
            'methodologies': ['agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'waterfall', 'lean', 'six sigma', 'itil'],
            'soft_skills': ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking', 'critical thinking', 'creativity', 'time management', 'project management'],
            'business': ['project management', 'business analysis', 'requirements gathering', 'stakeholder management', 'risk management', 'quality assurance', 'process improvement', 'change management']
        }
        
        # Flatten all skills for easier searching
        self.all_skills = set()
        for category in self.skill_keywords.values():
            self.all_skills.update(category)
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF or DOCX file."""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self.extract_from_pdf(file_path)
        elif file_extension == '.docx':
            return self.extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    def extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
        
        return text
    
    def extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        text = ""
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {str(e)}")
        
        return text
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using exact matching."""
        skills = set()
        text_lower = text.lower()
        
        # Create word boundaries for each skill to avoid partial matches
        for skill in self.all_skills:
            skill_lower = skill.lower()
            # Use word boundaries to match exact skills
            pattern = r'\b' + re.escape(skill_lower) + r'\b'
            if re.search(pattern, text_lower):
                skills.add(skill.title())
        
        # Also extract from common skill listing patterns
        skill_patterns = [
            r'(?:skills?|technologies?|tools?|languages?)[:\s]*([^\n.]+)',
            r'(?:experienced in|skilled in|proficient in|knowledge of)[:\s]*([^\n.]+)',
            r'•\s*([^•\n]+)',  # Bullet points
            r'-\s*([^-\n]+)',  # Dash points
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters and check each item
                items = re.split(r'[,;|&]', match)
                for item in items:
                    item_clean = item.strip().lower()
                    if item_clean in self.all_skills:
                        skills.add(item_clean.title())
        
        return sorted(list(skills))
    

    
