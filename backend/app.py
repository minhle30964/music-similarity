import os
import json
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure session
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'spotify-login-session'

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI')
SCOPE = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private'

# Create Spotify OAuth Manager
def create_spotify_oauth():
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope=SCOPE
    )

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/login', methods=['GET'])
def login():
    """Login with Spotify"""
    sp_oauth = create_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({"auth_url": auth_url})

@app.route('/api/callback', methods=['GET'])
def callback():
    """Callback from Spotify OAuth"""
    sp_oauth = create_spotify_oauth()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    
    # Save token info in session
    session['token_info'] = token_info
    return redirect('http://localhost:3000/dashboard')

@app.route('/api/token', methods=['GET'])
def get_token():
    """Get current token from session"""
    try:
        token_info = session.get('token_info', None)
        if not token_info:
            return jsonify({"error": "No token info"}), 401
        
        # Check if token needs refresh
        sp_oauth = create_spotify_oauth()
        if sp_oauth.is_token_expired(token_info):
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = token_info
            
        return jsonify({"token": token_info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user', methods=['GET'])
def get_user():
    """Get current user info"""
    try:
        token_info = session.get('token_info', None)
        if not token_info:
            return jsonify({"error": "Not logged in"}), 401
        
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_info = sp.current_user()
        return jsonify(user_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_track():
    """Search for tracks"""
    query = request.args.get('q', '')
    
    try:
        token_info = session.get('token_info', None)
        
        # Use token if available, otherwise create client credentials
        if token_info:
            sp = spotipy.Spotify(auth=token_info['access_token'])
        else:
            client_credentials_manager = spotipy.oauth2.SpotifyClientCredentials(
                client_id=SPOTIFY_CLIENT_ID, 
                client_secret=SPOTIFY_CLIENT_SECRET
            )
            sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        
        results = sp.search(q=query, type='track', limit=10)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/similar-songs', methods=['GET'])
def get_similar_songs():
    """Get similar songs based on a track ID"""
    track_id = request.args.get('track_id', '')
    
    if not track_id:
        return jsonify({"error": "No track ID provided"}), 400
    
    try:
        # Always use client credentials for this endpoint to ensure it works for both
        # authenticated and non-authenticated users
        client_credentials_manager = spotipy.oauth2.SpotifyClientCredentials(
            client_id=SPOTIFY_CLIENT_ID, 
            client_secret=SPOTIFY_CLIENT_SECRET
        )
        
        # Check if we have valid credentials
        if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
            return jsonify({"error": "Spotify API credentials not configured"}), 500
            
        sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        
        # Get track details to find artist and genre
        track = sp.track(track_id)
        artist_id = track['artists'][0]['id']
        
        # Get the track's market/country (default to US if not available)
        track_market = track.get('available_markets', [])
        country_code = track_market[0] if track_market else 'US'
        
        # Get artist's top tracks using the track's market
        artist_top_tracks = sp.artist_top_tracks(artist_id, country=country_code)
        
        # Get artist's genres
        artist_info = sp.artist(artist_id)
        genres = artist_info.get('genres', [])
        print(f"Artist genres: {genres}")
        
        # Initialize categorized similar songs
        artist_top_tracks_list = []
        album_tracks_list = []
        genre_tracks_list = []
        track_ids = set()  # To track all IDs across categories
        
        # Even if no genres are found, we'll create a fallback genre based on artist name
        primary_genre = genres[0] if genres else f"{track['artists'][0]['name']} Style"
        
        try:
            # Get artist's top tracks
            for item in artist_top_tracks['tracks']:
                if item['id'] != track_id and item['id'] not in track_ids:
                    track_ids.add(item['id'])
                    artist_top_tracks_list.append(item)
            
            # Get tracks from the same album
            try:
                # Get the album of the current track
                album_id = track['album']['id']
                album_tracks = sp.album_tracks(album_id, market=country_code)
                
                # Add tracks from the same album
                for item in album_tracks['items']:
                    if item['id'] != track_id and item['id'] not in track_ids:
                        # Create a full track object with album info
                        full_track = sp.track(item['id'])
                        track_ids.add(item['id'])
                        album_tracks_list.append(full_track)
                        
                        if len(album_tracks_list) >= 10:
                            break
            except Exception as album_error:
                print(f"Warning: Album tracks error: {str(album_error)}")
            
            # Always try to get genre-based tracks, even if no genres are found
            try:
                # Determine the best search query
                artist_name = track['artists'][0]['name']
                
                if genres:
                    primary_genre = genres[0]
                    print(f"Searching for tracks with genre: {primary_genre}")
                    # Try with genre and artist name
                    genre_query = f"{primary_genre} {artist_name}"
                else:
                    # Fallback to artist Style if no genres available
                    primary_genre = f"{artist_name} Style"
                    print(f"No genres found, using artist Style: {primary_genre}")
                    genre_query = f"similar to {artist_name}"
                
                # First search attempt
                genre_results = sp.search(q=genre_query, type='track', limit=15, market=country_code)
                
                # If we didn't get enough results, try alternative searches
                if len(genre_results['tracks']['items']) < 3:
                    print(f"Not enough results, trying alternative search")
                    
                    # Try different queries based on what we have
                    if genres:
                        # Just use the genre name
                        genre_query = primary_genre
                    else:
                        # Use popular music similar to the artist
                        genre_query = f"popular {artist_name} type"
                    
                    genre_results = sp.search(q=genre_query, type='track', limit=20, market=country_code)
                
                # Add tracks from the search results
                for item in genre_results['tracks']['items']:
                    if item['id'] != track_id and item['id'] not in track_ids:
                        track_ids.add(item['id'])
                        genre_tracks_list.append(item)
                        
                        if len(genre_tracks_list) >= 10:
                            break
                
                # If we still don't have enough tracks, use a more generic search
                if len(genre_tracks_list) < 3:
                    print(f"Still not enough tracks, using popular music search")
                    popular_query = "popular music 2025"
                    popular_results = sp.search(q=popular_query, type='track', limit=10, market=country_code)
                    
                    for item in popular_results['tracks']['items']:
                        if item['id'] != track_id and item['id'] not in track_ids:
                            track_ids.add(item['id'])
                            genre_tracks_list.append(item)
                            
                            if len(genre_tracks_list) >= 10:
                                break
                
                print(f"Found {len(genre_tracks_list)} tracks for {primary_genre}")
            except Exception as genre_error:
                print(f"Warning: Genre search error: {str(genre_error)}")
        except Exception as e:
            print(f"Warning: Error getting similar tracks: {str(e)}")
            # If we have no tracks in any category, raise the exception
            if not artist_top_tracks_list and not album_tracks_list and not genre_tracks_list:
                raise
        
        # Limit each category to 10 results
        artist_top_tracks_list = artist_top_tracks_list[:10]
        album_tracks_list = album_tracks_list[:10]
        genre_tracks_list = genre_tracks_list[:10]
        
        return jsonify({
            "categories": {
                "artist": {
                    "name": f"{track['artists'][0]['name']}'s Top Tracks",
                    "tracks": artist_top_tracks_list
                },
                "album": {
                    "name": f"From Album: {track['album']['name']}",
                    "tracks": album_tracks_list
                },
                "genre": {
                    "name": f"{primary_genre} Tracks",
                    "tracks": genre_tracks_list
                }
            }
        })
    except Exception as e:
        print(f"Error in get_similar_songs: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/top-tracks', methods=['GET'])
def get_user_top_tracks():
    """Get user's top tracks"""
    try:
        token_info = session.get('token_info', None)
        if not token_info:
            return jsonify({"error": "Not logged in"}), 401
        
        sp = spotipy.Spotify(auth=token_info['access_token'])
        top_tracks = sp.current_user_top_tracks(limit=10, time_range='medium_term')
        return jsonify(top_tracks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create-playlist', methods=['POST'])
def create_playlist():
    """Create a playlist with the provided tracks"""
    try:
        token_info = session.get('token_info', None)
        if not token_info:
            return jsonify({"error": "Not logged in"}), 401
        
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_info = sp.current_user()
        user_id = user_info['id']
        
        data = request.json
        playlist_name = data.get('name', 'Similar Songs Playlist')
        track_ids = data.get('track_ids', [])
        
        if not track_ids:
            return jsonify({"error": "No tracks provided"}), 400
        
        # Create playlist
        playlist = sp.user_playlist_create(
            user=user_id,
            name=playlist_name,
            public=True,
            description="Created with Song Similarity Finder"
        )
        
        # Add tracks to playlist
        sp.playlist_add_items(playlist['id'], track_ids)
        
        return jsonify({"playlist": playlist})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/favorites', methods=['GET', 'POST', 'DELETE'])
def manage_favorites():
    """Manage user favorites"""
    try:
        token_info = session.get('token_info', None)
        if not token_info:
            return jsonify({"error": "Not logged in"}), 401
        
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_info = sp.current_user()
        user_id = user_info['id']
        
        # Handle different HTTP methods
        if request.method == 'GET':
            # We'll use a playlist named "Favorites" to store favorite tracks
            playlists = sp.user_playlists(user_id)
            favorites_playlist = None
            
            for playlist in playlists['items']:
                if playlist['name'] == 'Song Similarity Finder Favorites':
                    favorites_playlist = playlist
                    break
            
            if favorites_playlist:
                tracks = sp.playlist_tracks(favorites_playlist['id'])
                return jsonify({"favorites": tracks})
            else:
                # Create favorites playlist if it doesn't exist
                favorites_playlist = sp.user_playlist_create(
                    user=user_id,
                    name='Song Similarity Finder Favorites',
                    public=False,
                    description="Your favorite tracks from Song Similarity Finder"
                )
                return jsonify({"favorites": {"items": []}})
                
        elif request.method == 'POST':
            data = request.json
            track_id = data.get('track_id')
            
            if not track_id:
                return jsonify({"error": "No track ID provided"}), 400
            
            # Find or create favorites playlist
            playlists = sp.user_playlists(user_id)
            favorites_playlist = None
            
            for playlist in playlists['items']:
                if playlist['name'] == 'Song Similarity Finder Favorites':
                    favorites_playlist = playlist
                    break
            
            if not favorites_playlist:
                favorites_playlist = sp.user_playlist_create(
                    user=user_id,
                    name='Song Similarity Finder Favorites',
                    public=False,
                    description="Your favorite tracks from Song Similarity Finder"
                )
            
            # Add track to favorites
            sp.playlist_add_items(favorites_playlist['id'], [track_id])
            return jsonify({"success": True})
            
        elif request.method == 'DELETE':
            data = request.json
            track_id = data.get('track_id')
            
            if not track_id:
                return jsonify({"error": "No track ID provided"}), 400
            
            # Find favorites playlist
            playlists = sp.user_playlists(user_id)
            favorites_playlist = None
            
            for playlist in playlists['items']:
                if playlist['name'] == 'Song Similarity Finder Favorites':
                    favorites_playlist = playlist
                    break
            
            if not favorites_playlist:
                return jsonify({"error": "Favorites playlist not found"}), 404
            
            # Remove track from favorites
            sp.playlist_remove_all_occurrences_of_items(
                favorites_playlist['id'], 
                [track_id]
            )
            return jsonify({"success": True})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
