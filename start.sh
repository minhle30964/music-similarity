#!/bin/bash

# Song Similarity Finder Startup Script

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Song Similarity Finder Application...${NC}"

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}Setting up Python virtual environment...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo -e "${GREEN}Python virtual environment already exists.${NC}"
fi

# Check if Spotify credentials are set
if grep -q "your_spotify_client_id" backend/.env; then
    echo -e "${RED}WARNING: Spotify API credentials not set!${NC}"
    echo -e "${RED}Please update the backend/.env file with your Spotify API credentials.${NC}"
    echo -e "${RED}You can get these from https://developer.spotify.com/dashboard${NC}"
fi

# Start backend in background
echo -e "${BLUE}Starting Flask backend...${NC}"
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to start...${NC}"
sleep 3

# Start frontend with NODE_OPTIONS flag for compatibility
echo -e "${BLUE}Starting React frontend...${NC}"
cd frontend
NODE_OPTIONS=--openssl-legacy-provider npm start &
FRONTEND_PID=$!
cd ..

# Function to handle script termination
function cleanup {
    echo -e "${BLUE}Shutting down services...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    echo -e "${GREEN}Application stopped.${NC}"
    exit
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Song Similarity Finder is running!${NC}"
echo -e "${GREEN}Backend: http://localhost:5000${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the application${NC}"

# Keep script running
wait
