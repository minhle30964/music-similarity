# 🎵 Song Similarity Finder

A modern web application that helps users discover songs similar to their favorites based on artist top tracks, genre-based searches, and Spotify embedding for playback.

## ✨ Features

### 🖥️ UI/UX
- **Modern, Clean Design** – A sleek, intuitive interface with a focus on simplicity
- **Dark Mode & Light Mode** – Supports user preferences for aesthetics
- **Responsive Layout** – Works seamlessly on desktop, tablet, and mobile

### 🔍 Core Features
- **Search for a Song** – Type a song name and see results in real time
- **Find Similar Songs** – Recommendations based on:
  - Artist's top tracks
  - Genre-matching search queries
- **View Song Details** – Track name, artist, album, and popularity
- **Embedded Song Player**:
  - oEmbed Player if user is logged out (simple preview)
  - iFrame API if user is logged in (full playback inside app)

### 🎛 Interactive Features
- **Save Favorites** – Bookmark songs for future reference
- **Generate & Export Playlist** – Create a Spotify playlist from discovered songs (if logged in)

### 🔑 Authentication & Personalization
- **Spotify OAuth Login** – Log in with your Spotify account
- **Personalized Suggestions** – If logged in, fetch user's top tracks for better recommendations

## 🛠️ Tech Stack

- **Frontend**: React, Material-UI, Chart.js
- **Backend**: Flask, Spotipy (Spotify API wrapper)
- **Authentication**: Spotify OAuth

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Spotify Developer Account (for API credentials)

### Setup

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd song-similarity-finder
   ```

2. **Set up Spotify API credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new application
   - Add `http://localhost:3000/callback` as a Redirect URI
   - Copy your Client ID and Client Secret
   - Update the `backend/.env` file with your credentials:
     ```
     SPOTIFY_CLIENT_ID=your_spotify_client_id
     SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
     SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
     ```

3. **Install dependencies and start the application**
   ```
   chmod +x start.sh
   ./start.sh
   ```

   This script will:
   - Set up a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Start both the backend and frontend servers

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## 📱 User Journey

1. **Landing Page** 🏠
   - Clean UI with a search bar: "Find Similar Songs"
   - Background shows a subtle music visualizer

2. **Searching for a Song** 🔍
   - Type a song name into the search bar
   - Search results appear instantly with album covers, artist names, and popularity ratings
   - Select a song from the list

3. **Finding Similar Songs** 🎶
   - App fetches artist's top tracks and genre-matching tracks
   - List of recommended songs appears with song details and play buttons

4. **Listening to Recommendations** 🎧
   - Click play to listen to songs
   - Different player experiences based on login status

5. **Saving & Exporting Music** 💾
   - Save songs to favorites
   - Create Spotify playlists from recommendations

## 🧑‍💻 Development

### Backend Structure
- Flask REST API with Spotify integration
- Endpoints for authentication, search, recommendations, and playlist management

### Frontend Structure
- React components for UI elements
- Context providers for theme and authentication state
- Material-UI for responsive design

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Spotipy](https://spotipy.readthedocs.io/)
- [Material-UI](https://mui.com/)
- [React](https://reactjs.org/)
