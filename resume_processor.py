import PyPDF2
import docx
import re
import spacy
from typing import List, Set
import os

class ResumeProcessor:
    def __init__(self):
        # Load spaCy model for NLP processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback to basic processing if spaCy model not available
            self.nlp = None
        
        # Predefined skill keywords for extraction
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'bootstrap'],
            'data': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'hadoop', 'spark', 'kafka'],
            'ml': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'gitlab'],
            'mobile': ['android', 'ios', 'flutter', 'react native', 'xamarin', 'ionic'],
            'tools': ['git', 'jira', 'confluence', 'slack', 'trello', 'figma', 'photoshop', 'illustrator'],
            'methodologies': ['agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd'],
            'soft_skills': ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking'],
            'business': ['project management', 'business analysis', 'requirements gathering', 'stakeholder management']
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
        """Extract skills only from explicit skill sections, very strictly."""
        skills = set()
        text_lower = text.lower()
        lines = [line.strip() for line in text_lower.split('\n')]

        # Define section headers that indicate the start of a skill section
        skill_section_headers = [
            'technical skills', 'skills', 'programming languages', 'frameworks', 'libraries', 'tools', 'technologies', 'databases', 'certifications'
        ]
        # Define headers that indicate a new section (to stop parsing skills)
        all_section_headers = [
            'education', 'projects', 'experience', 'certifications', 'summary', 'objective', 'profile', 'interests', 'hobbies', 'awards', 'publications', 'contact', 'personal information', 'languages', 'references', 'achievements', 'activities', 'extra-curricular', 'internship', 'work experience', 'professional experience', 'academic background', 'academic qualifications', 'academic achievements', 'academic projects', 'research', 'conference', 'paper', 'volunteer', 'leadership', 'positions of responsibility', 'positions', 'responsibilities', 'extracurricular', 'extracurricular activities', 'other'
        ] + skill_section_headers

        in_skill_section = False
        for i, line in enumerate(lines):
            line_clean = line.strip(':').strip()
            # Check if this line is a skill section header
            if any(header in line_clean for header in skill_section_headers):
                in_skill_section = True
                continue
            # If we hit another section header or a blank line, stop parsing skills
            if in_skill_section and (not line_clean or any(header in line_clean for header in all_section_headers)):
                break
            # If in skill section, parse skills from this line
            if in_skill_section and line_clean:
                # Split by common delimiters
                items = re.split(r'[•,;\|\t\-]', line_clean)
                for item in items:
                    skill_candidate = item.strip().lower()
                    # Only match if the skill is in the known skills list
                    if skill_candidate in self.all_skills:
                        skills.add(skill_candidate.title())
        return sorted(list(skills))
    
    def extract_skills_nlp(self, text: str) -> Set[str]:
        """Extract skills using spaCy NLP."""
        skills = set()
        
        try:
            doc = self.nlp(text)
            
            # Extract noun phrases that might be skills
            for chunk in doc.noun_chunks:
                chunk_text = chunk.text.lower().strip()
                if self.is_likely_skill(chunk_text):
                    skills.add(chunk_text.title())
            
            # Extract named entities
            for ent in doc.ents:
                if ent.label_ in ['ORG', 'PRODUCT', 'LANGUAGE'] and self.is_likely_skill(ent.text.lower()):
                    skills.add(ent.text.title())
        
        except Exception:
            pass  # Fall back to other methods if NLP fails
        
        return skills
    
    def extract_skills_regex(self, text: str) -> Set[str]:
        """Extract skills using regex patterns."""
        skills = set()
        
        # Common skill patterns
        patterns = [
            r'\b(?:experienced in|skilled in|proficient in|knowledge of|familiar with)\s+([^.]+)',
            r'\b(?:Programming languages?|Technologies?|Tools?|Frameworks?)[:\s]+([^.]+)',
            r'\b([\w\s]+)\s+(?:years?|experience|expertise)',
            r'•\s*([^•\n]+)',  # Bullet points
            r'-\s*([^-\n]+)',  # Dash points
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters
                items = re.split(r'[,;|&]', match)
                for item in items:
                    item = item.strip()
                    if self.is_likely_skill(item.lower()):
                        skills.add(item.title())
        
        return skills
    
    def is_likely_skill(self, text: str) -> bool:
        """Determine if text is likely a skill (stricter: only in known skills)."""
        text = text.lower().strip()
        if len(text) < 2 or len(text) > 50:
            return False
        # Only return True if in known skills
        return text in self.all_skills
    
    def extract_contact_info(self, text: str) -> dict:
        """Extract contact information from resume."""
        contact_info = {}
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone extraction
        phone_pattern = r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group()
        
        # LinkedIn extraction
        linkedin_pattern = r'(?:linkedin\.com/in/|linkedin\.com/pub/)([a-zA-Z0-9\-]+)'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact_info['linkedin'] = f"linkedin.com/in/{linkedin_match.group(1)}"
        
        return contact_info
    
    def extract_experience_years(self, text: str) -> dict:
        """Extract years of experience for different skills."""
        experience = {}
        
        # Pattern to match "X years of experience with Y"
        pattern = r'(\d+)\s+(?:years?|yrs?)\s+(?:of\s+)?(?:experience\s+)?(?:with\s+|in\s+|using\s+)?([^.,\n]+)'
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        for years, skill in matches:
            skill = skill.strip()
            if self.is_likely_skill(skill.lower()):
                experience[skill.title()] = int(years)
        
        return experience