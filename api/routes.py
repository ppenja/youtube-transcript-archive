from flask import request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import sqlite3
from datetime import datetime
import os
import re

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'transcripts.db')

def init_db():
    """Initialize the SQLite database with necessary tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create channels table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        video_count INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create videos table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        published_at TIMESTAMP,
        thumbnail_url TEXT,
        duration TEXT,
        view_count INTEGER,
        has_transcript BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (channel_id) REFERENCES channels (id)
    )
    ''')
    
    # Create transcripts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT NOT NULL,
        language TEXT NOT NULL,
        language_code TEXT NOT NULL,
        is_generated BOOLEAN DEFAULT FALSE,
        full_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (video_id) REFERENCES videos (id),
        UNIQUE(video_id, language_code)
    )
    ''')
    
    # Create transcript_segments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transcript_segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transcript_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        start_time REAL NOT NULL,
        duration REAL NOT NULL,
        search_vector TEXT,
        FOREIGN KEY (transcript_id) REFERENCES transcripts (id)
    )
    ''')
    
    # Create index for full-text search
    cursor.execute('''
    CREATE VIRTUAL TABLE IF NOT EXISTS transcript_search 
    USING fts5(
        text, 
        segment_id UNINDEXED,
        transcript_id UNINDEXED,
        video_id UNINDEXED,
        start_time UNINDEXED
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

def extract_channel_id(url):
    """Extract channel ID from various YouTube URL formats"""
    channel_id = None
    
    # Pattern for /channel/ID format
    channel_pattern = r'youtube\.com/channel/([^/\?]+)'
    match = re.search(channel_pattern, url)
    if match:
        return match.group(1)
    
    # For demo purposes, return a mock channel ID
    # In a real implementation, we would handle other URL formats
    # and make API calls to resolve custom URLs
    return "UC_x5XG1OV2P6uZZ5FSM9Ttw"  # Google Developers channel

def register_routes(app):
    @app.route('/api/channel', methods=['GET'])
    def get_channel():
        """
        Endpoint to validate and process a YouTube channel URL
        Query parameters:
        - url: YouTube channel URL
        """
        url = request.args.get('url')
        
        if not url:
            return jsonify({'error': 'Channel URL is required'}), 400
        
        try:
            # Extract channel ID from URL
            channel_id = extract_channel_id(url)
            
            if not channel_id:
                return jsonify({'error': 'Invalid channel URL'}), 400
            
            # For demo purposes, return mock data
            # In a real implementation, we would fetch channel data from YouTube API
            return jsonify({
                'id': channel_id,
                'title': 'Demo Channel',
                'description': 'This is a demo channel for testing',
                'thumbnailUrl': 'https://via.placeholder.com/100',
                'videoCount': 42
            }) 
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/transcript', methods=['GET'])
    def get_transcript():
        """
        Endpoint to fetch transcript for a YouTube video
        Query parameters:
        - video_id: YouTube video ID
        - language: Optional language code (defaults to 'en')
        """
        video_id = request.args.get('video_id')
        language = request.args.get('language', 'en')
        
        if not video_id:
            return jsonify({'error': 'Video ID is required'}), 400
        
        try:
            # Check if transcript is already in database
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
            SELECT t.id, t.language, t.language_code, t.is_generated, t.full_text
            FROM transcripts t
            WHERE t.video_id = ? AND t.language_code = ?
            ''', (video_id, language))
            
            transcript_record = cursor.fetchone()
            
            if transcript_record:
                # Transcript exists in database, fetch segments
                cursor.execute('''
                SELECT id, text, start_time, duration
                FROM transcript_segments
                WHERE transcript_id = ?
                ORDER BY start_time
                ''', (transcript_record['id'],))
                
                segments = []
                for row in cursor.fetchall():
                    segments.append({
                        'id': row['id'],
                        'text': row['text'],
                        'start': row['start_time'],
                        'duration': row['duration']
                    })
                
                metadata = {
                    'video_id': video_id,
                    'language': transcript_record['language'],
                    'language_code': transcript_record['language_code'],
                    'is_generated': bool(transcript_record['is_generated']),
                    'segment_count': len(segments),
                    'source': 'database'
                }
                
                conn.close()
                return jsonify({
                    'metadata': metadata,
                    'segments': segments
                })
            
            # Transcript not in database, fetch from YouTube
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to find transcript in requested language
            transcript = None
            try:
                transcript = transcript_list.find_transcript([language])
            except:
                # If requested language not found, try English
                if language != 'en':
                    try:
                        transcript = transcript_list.find_transcript(['en'])
                    except:
                        pass
                
                # If still not found, try to get any available transcript
                if not transcript and len(transcript_list._transcripts) > 0:
                    transcript = list(transcript_list._transcripts.values())[0]
            
            if not transcript:
                conn.close()
                return jsonify({'error': 'No transcript available for this video'}), 404
            
            # Fetch the actual transcript data
            transcript_data = transcript.fetch()
            
            # Format as plain text for full-text storage
            formatter = TextFormatter()
            full_text = formatter.format_transcript(transcript_data)
            
            # Store transcript in database
            cursor.execute('''
            INSERT OR REPLACE INTO transcripts 
            (video_id, language, language_code, is_generated, full_text)
            VALUES (?, ?, ?, ?, ?)
            ''', (
                video_id, 
                transcript.language, 
                transcript.language_code, 
                transcript.is_generated, 
                full_text
            ))
            
            transcript_id = cursor.lastrowid
            
            # Store transcript segments
            segments = []
            for item in transcript_data:
                cursor.execute('''
                INSERT INTO transcript_segments
                (transcript_id, text, start_time, duration)
                VALUES (?, ?, ?, ?)
                ''', (
                    transcript_id,
                    item['text'],
                    item['start'],
                    item['duration']
                ))
                
                segment_id = cursor.lastrowid
                
                # Add to search index
                cursor.execute('''
                INSERT INTO transcript_search
                (segment_id, transcript_id, video_id, start_time, text)
                VALUES (?, ?, ?, ?, ?)
                ''', (
                    segment_id,
                    transcript_id,
                    video_id,
                    item['start'],
                    item['text']
                ))
                
                segments.append({
                    'id': segment_id,
                    'text': item['text'],
                    'start': item['start'],
                    'duration': item['duration']
                })
            
            # Update video record to indicate it has a transcript
            cursor.execute('''
            UPDATE videos SET has_transcript = TRUE
            WHERE id = ?
            ''', (video_id,))
            
            conn.commit()
            
            metadata = {
                'video_id': video_id,
                'language': transcript.language,
                'language_code': transcript.language_code,
                'is_generated': transcript.is_generated,
                'segment_count': len(segments),
                'source': 'youtube'
            }
            
            conn.close()
            
            return jsonify({
                'metadata': metadata,
                'segments': segments
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/search', methods=['GET'])
    def search_transcripts():
        """
        Endpoint to search through transcripts
        Query parameters:
        - q: Search query
        - channel_id: Optional channel ID to limit search
        - limit: Optional result limit (default 50)
        - offset: Optional offset for pagination (default 0)
        """
        query = request.args.get('q')
        channel_id = request.args.get('channel_id')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        try:
            # For demo purposes, return mock search results
            # In a real implementation, we would query the database
            
            results = []
            for i in range(min(limit, 10)):  # Mock 10 results max
                results.append({
                    'video_id': f'dQw4w9WgXcQ',
                    'video_title': f'Sample Video {i+1}',
                    'channel_title': 'Demo Channel',
                    'published_date': '2023-01-01',
                    'thumbnail_url': 'https://via.placeholder.com/320x180',
                    'text': f'This is a sample transcript segment containing the search term "{query}" with some context around it.',
                    'timestamp': 60 + i*30,
                    'timestamp_url': f'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t={60 + i*30}'
                }) 
            
            return jsonify({
                'query': query,
                'total': 42,  # Mock total count
                'limit': limit,
                'offset': offset,
                'results': results
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
