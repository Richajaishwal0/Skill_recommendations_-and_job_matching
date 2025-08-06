from flask import Flask, render_template, request, jsonify, session
import os
import sqlite3
import json
from datetime import datetime
from job_matcher import JobMatcher
from resume_processor import ResumeProcessor
from course_recommender import CourseRecommender
from database import DatabaseManager

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize components
job_matcher = JobMatcher()
resume_processor = ResumeProcessor()
course_recommender = CourseRecommender()
db_manager = DatabaseManager()

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Save file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Extract text from resume
            resume_text = resume_processor.extract_text(filepath)
            
            # Extract skills from resume
            extracted_skills = resume_processor.extract_skills(resume_text)
            
            # Store in session
            session['resume_text'] = resume_text
            session['extracted_skills'] = extracted_skills
            
            # Clean up file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'extracted_skills': extracted_skills,
                'resume_text': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text
            })
        
        return jsonify({'error': 'Invalid file format'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/match_jobs', methods=['POST'])
def match_jobs():
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        job_preference = data.get('job_preference', '')
        
        if not skills:
            return jsonify({'error': 'No skills provided'}), 400
        
        # Get job matches
        job_matches = job_matcher.find_matches(skills, job_preference)
        
        # Store session data
        session_id = db_manager.store_session(skills, job_matches)
        session['session_id'] = session_id
        
        return jsonify({
            'success': True,
            'job_matches': job_matches,
            'session_id': session_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_skill_gap', methods=['POST'])
def get_skill_gap():
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        user_skills = data.get('skills', [])
        
        if not job_id or not user_skills:
            return jsonify({'error': 'Missing job_id or skills'}), 400
        
        # Get skill gap analysis
        skill_gap = job_matcher.analyze_skill_gap(job_id, user_skills)
        
        # Get course recommendations
        courses = course_recommender.recommend_courses(skill_gap['missing_skills'])
        
        return jsonify({
            'success': True,
            'skill_gap': skill_gap,
            'recommended_courses': courses
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_suggestions', methods=['POST'])
def get_suggestions():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        suggestions = job_matcher.get_skill_suggestions(query)
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ['pdf', 'docx']

def secure_filename(filename):
    import re
    filename = re.sub(r'[^\w\s-]', '', filename).strip()
    return re.sub(r'[-\s]+', '-', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)