# CareerSync - AI-Powered Job Matching System

A modern full-stack application that uses AI to match job seekers with relevant opportunities based on their skills and experience.

## Features

- **Resume Analysis**: Upload PDF/DOCX resumes for automatic skill extraction
- **Manual Skills Entry**: Add skills manually with intelligent suggestions
- **AI Job Matching**: Advanced matching using sentence transformers and O*NET data
- **Skills Gap Analysis**: Detailed analysis of missing skills for target jobs
- **Modern UI**: Professional React interface with animations and glass morphism effects

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Flask** REST API
- **Sentence Transformers** for AI matching
- **PyPDF2** & **python-docx** for resume processing
- **scikit-learn** for similarity calculations

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Download spaCy model (optional)
python -m spacy download en_core_web_sm
```

### Frontend Setup
```bash
# Install Node dependencies
npm install
```

## Usage

### Start Backend
```bash
python app.py
# Server runs on http://localhost:5001
```

### Start Frontend
```bash
npm run dev
# App runs on http://localhost:5173
```

### Or use batch files:
```bash
# Windows
start_backend.bat
start_frontend.bat
```

## API Endpoints

- `POST /upload_resume` - Upload and process resume
- `POST /match_jobs` - Find job matches based on skills
- `POST /get_skill_gap` - Analyze skills gap for specific job
- `POST /get_suggestions` - Get skill suggestions for autocomplete

## Project Structure

```
├── src/                    # React frontend
│   ├── App.tsx            # Main React component
│   ├── index.css          # Tailwind styles & animations
│   └── main.tsx           # React entry point
├── app.py                 # Flask backend API
├── job_matcher.py         # AI job matching logic
├── resume_processor.py    # Resume text & skill extraction
├── uploads/               # Temporary file storage
└── requirements.txt       # Python dependencies
```

## Key Components

### JobMatcher
- Uses sentence-transformers for semantic matching
- Implements O*NET job database with 5 job categories
- Calculates weighted scores across skills, abilities, knowledge
- Configurable similarity thresholds (0.1 similarity, 10.0 score)

### ResumeProcessor
- Extracts text from PDF/DOCX files
- Uses regex patterns for exact skill matching
- Comprehensive skill database (200+ skills across 10 categories)
- Word boundary matching to avoid false positives

### React Frontend
- Modern glass morphism design with dark animated background
- Real-time skill suggestions and validation
- Responsive job cards with detailed matching information
- Smooth animations and professional styling

## Configuration

### Matching Thresholds (job_matcher.py)
```python
self.threshold = 0.1      # Minimum similarity score
self.min_score = 10.0     # Minimum matching score
```

### Skill Categories (resume_processor.py)
- Programming languages
- Web technologies
- Databases & cloud
- Machine learning
- Mobile development
- DevOps tools
- Soft skills
- Business skills

## Development

### Adding New Jobs
Edit the `onet_data` dictionary in `job_matcher.py` with O*NET job codes and requirements.

### Adding New Skills
Update the `skill_keywords` dictionary in `resume_processor.py` with new skill categories.

### Styling Changes
Modify `src/index.css` for animations and `src/App.tsx` for component styling.

## License

MIT License - see LICENSE file for details.