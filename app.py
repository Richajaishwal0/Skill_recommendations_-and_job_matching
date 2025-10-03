from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from job_matcher import JobMatcher
from resume_processor import ResumeProcessor

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Initialize components
print("Initializing components...")
job_matcher = JobMatcher()
print("JobMatcher initialized")
resume_processor = ResumeProcessor()
print("ResumeProcessor initialized")

print("All components ready!")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)



@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        print("Upload request received")
        
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Save file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(f"Saving file to: {filepath}")
            file.save(filepath)
            
            # Extract text from resume
            print("Extracting text...")
            resume_text = resume_processor.extract_text(filepath)
            print(f"Extracted text length: {len(resume_text)}")
            
            # Extract skills from resume
            print("Extracting skills...")
            extracted_skills = resume_processor.extract_skills(resume_text)
            print(f"Extracted skills: {extracted_skills}")
            

            
            # Clean up file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'extracted_skills': extracted_skills,
                'resume_text': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text
            })
        
        return jsonify({'error': 'Invalid file format'}), 400
    
    except Exception as e:
        print(f"Error in upload_resume: {str(e)}")
        import traceback
        traceback.print_exc()
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
        

        
        return jsonify({
            'success': True,
            'job_matches': job_matches,

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
        
        return jsonify({
            'success': True,
            'skill_gap': skill_gap
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



if __name__ == '__main__':
    print("Starting Flask server...")
    try:
        app.run(debug=True, host='127.0.0.1', port=5001)
    except Exception as e:
        print(f"Error starting server: {e}")