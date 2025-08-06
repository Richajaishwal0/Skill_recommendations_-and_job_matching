import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional

class DatabaseManager:
    def __init__(self, db_path: str = 'job_matcher.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_skills TEXT NOT NULL,
                job_matches TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user_profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                name TEXT,
                skills TEXT,
                resume_text TEXT,
                contact_info TEXT,
                experience_years TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create job_applications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS job_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                job_id TEXT NOT NULL,
                job_title TEXT NOT NULL,
                match_score REAL NOT NULL,
                status TEXT DEFAULT 'interested',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions (session_id)
            )
        ''')
        
        # Create course_recommendations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS course_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                course_title TEXT NOT NULL,
                course_provider TEXT NOT NULL,
                course_url TEXT,
                skill_category TEXT,
                recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions (session_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_session(self, user_skills: List[str], job_matches: List[Dict]) -> str:
        """Store a new session with user skills and job matches."""
        import uuid
        session_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO sessions (session_id, user_skills, job_matches)
                VALUES (?, ?, ?)
            ''', (session_id, json.dumps(user_skills), json.dumps(job_matches)))
            
            conn.commit()
            return session_id
        
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"Database error: {str(e)}")
        
        finally:
            conn.close()
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session data by session ID."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT session_id, user_skills, job_matches, created_at, updated_at
                FROM sessions
                WHERE session_id = ?
            ''', (session_id,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'session_id': row[0],
                    'user_skills': json.loads(row[1]),
                    'job_matches': json.loads(row[2]),
                    'created_at': row[3],
                    'updated_at': row[4]
                }
            return None
        
        finally:
            conn.close()
    
    def store_user_profile(self, profile_data: Dict) -> int:
        """Store user profile data."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO user_profiles 
                (email, name, skills, resume_text, contact_info, experience_years)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                profile_data.get('email'),
                profile_data.get('name'),
                json.dumps(profile_data.get('skills', [])),
                profile_data.get('resume_text'),
                json.dumps(profile_data.get('contact_info', {})),
                json.dumps(profile_data.get('experience_years', {}))
            ))
            
            conn.commit()
            return cursor.lastrowid
        
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"Database error: {str(e)}")
        
        finally:
            conn.close()
    
    def get_user_profile(self, email: str) -> Optional[Dict]:
        """Retrieve user profile by email."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT email, name, skills, resume_text, contact_info, experience_years, created_at, updated_at
                FROM user_profiles
                WHERE email = ?
            ''', (email,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'email': row[0],
                    'name': row[1],
                    'skills': json.loads(row[2]) if row[2] else [],
                    'resume_text': row[3],
                    'contact_info': json.loads(row[4]) if row[4] else {},
                    'experience_years': json.loads(row[5]) if row[5] else {},
                    'created_at': row[6],
                    'updated_at': row[7]
                }
            return None
        
        finally:
            conn.close()
    
    def store_job_application(self, session_id: str, job_data: Dict) -> int:
        """Store job application data."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO job_applications (session_id, job_id, job_title, match_score)
                VALUES (?, ?, ?, ?)
            ''', (
                session_id,
                job_data.get('job_id'),
                job_data.get('title'),
                job_data.get('score', 0)
            ))
            
            conn.commit()
            return cursor.lastrowid
        
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"Database error: {str(e)}")
        
        finally:
            conn.close()
    
    def store_course_recommendation(self, session_id: str, course_data: Dict) -> int:
        """Store course recommendation data."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO course_recommendations 
                (session_id, course_title, course_provider, course_url, skill_category)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                session_id,
                course_data.get('title'),
                course_data.get('provider'),
                course_data.get('url'),
                course_data.get('skill_category', 'general')
            ))
            
            conn.commit()
            return cursor.lastrowid
        
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"Database error: {str(e)}")
        
        finally:
            conn.close()
    
    def get_user_statistics(self, session_id: str) -> Dict:
        """Get user statistics for a session."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Get job applications count
            cursor.execute('''
                SELECT COUNT(*) FROM job_applications WHERE session_id = ?
            ''', (session_id,))
            job_applications = cursor.fetchone()[0]
            
            # Get course recommendations count
            cursor.execute('''
                SELECT COUNT(*) FROM course_recommendations WHERE session_id = ?
            ''', (session_id,))
            course_recommendations = cursor.fetchone()[0]
            
            # Get session data
            session_data = self.get_session(session_id)
            
            return {
                'job_applications': job_applications,
                'course_recommendations': course_recommendations,
                'total_skills': len(session_data.get('user_skills', [])) if session_data else 0,
                'job_matches': len(session_data.get('job_matches', [])) if session_data else 0
            }
        
        finally:
            conn.close()
    
    def cleanup_old_sessions(self, days_old: int = 30):
        """Clean up sessions older than specified days."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                DELETE FROM sessions 
                WHERE created_at < datetime('now', '-' || ? || ' days')
            ''', (days_old,))
            
            cursor.execute('''
                DELETE FROM job_applications 
                WHERE session_id NOT IN (SELECT session_id FROM sessions)
            ''')
            
            cursor.execute('''
                DELETE FROM course_recommendations 
                WHERE session_id NOT IN (SELECT session_id FROM sessions)
            ''')
            
            conn.commit()
            
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"Database error: {str(e)}")
        
        finally:
            conn.close()