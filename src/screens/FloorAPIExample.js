/**
 * FLOOR COMPONENT API INTEGRATION EXAMPLES
 * =========================================
 *
 * This file contains examples of how to integrate the Floor component with your backend API.
 * The Floor component now uses percentage-based positioning to handle different screen sizes.
 */

// ============================================================================
// EXAMPLE 1: Sending player position to API when they move
// ============================================================================

/*
In Floor.jsx, the handlePress function already calls sendPositionToAPI:

const handlePress = useCallback(async (event) => {
  const { locationX, locationY } = event.nativeEvent;

  moveToPosition(locationX, locationY);

  // This sends percentage values (0-100) to your API
  await sendPositionToAPI(locationX, locationY);
  // Example output: { x: 45.23, y: 67.89 }
}, [moveToPosition, sendPositionToAPI]);

To implement the actual API call, update the sendPositionToAPI function:

const sendPositionToAPI = useCallback(async (x, y) => {
  const position = formatPositionForAPI(x, y, width, height);

  try {
    const response = await fetch('https://your-api.com/api/player/position', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: JSON.stringify({
        userId: 'current-user-id',
        x: position.x,  // Percentage value (0-100)
        y: position.y,  // Percentage value (0-100)
      }),
    });

    const data = await response.json();
    console.log('Position updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending position:', error);
  }
}, [width, height]);
*/

// ============================================================================
// EXAMPLE 2: Receiving position updates from WebSocket/API
// ============================================================================

/*
When you receive position updates from your server (via WebSocket or polling),
use the updateOtherUsersPosition or moveOtherUser functions:

// Example: Using WebSocket
useEffect(() => {
  const ws = new WebSocket('wss://your-api.com/ws');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'user_moved') {
      // Single user moved
      moveOtherUser(data.userId, data.x, data.y);
      // Example data: { userId: '123', x: 45.5, y: 67.2 }
    }

    if (data.type === 'users_list') {
      // Full list of users with their positions
      updateOtherUsersPosition(data.users);
      // Example data: {
      //   users: [
      //     { id: '1', x: 25.5, y: 30.2, color: '#FF6B6B' },
      //     { id: '2', x: 75.0, y: 60.5, color: '#4ECDC4' },
      //   ]
      // }
    }
  };

  return () => ws.close();
}, [moveOtherUser, updateOtherUsersPosition]);
*/

// ============================================================================
// EXAMPLE 3: Fetching users on component mount
// ============================================================================

/*
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch('https://your-api.com/api/users/positions');
      const data = await response.json();

      // API returns percentage values
      // Example: [
      //   { id: '1', x: 25.5, y: 30.2, color: '#FF6B6B' },
      //   { id: '2', x: 75.0, y: 60.5, color: '#4ECDC4' },
      // ]

      updateOtherUsersPosition(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (width > 0 && height > 0) {
    fetchUsers();
  }
}, [width, height, updateOtherUsersPosition]);
*/

// ============================================================================
// EXAMPLE 4: Real-time position updates with polling
// ============================================================================

/*
useEffect(() => {
  if (width === 0 || height === 0) return;

  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch('https://your-api.com/api/users/positions');
      const data = await response.json();

      // Update all users' positions
      updateOtherUsersPosition(data.users);
    } catch (error) {
      console.error('Error polling positions:', error);
    }
  }, 1000); // Poll every second

  return () => clearInterval(pollInterval);
}, [width, height, updateOtherUsersPosition]);
*/

// ============================================================================
// EXAMPLE 5: Converting between percentage and absolute values manually
// ============================================================================

/*
import { formatPositionForAPI, parsePositionFromAPI } from '../utils/positionUtils';

// Convert absolute coordinates to percentage (for API)
const absoluteX = 300;
const absoluteY = 450;
const containerWidth = 800;
const containerHeight = 1200;

const percentagePosition = formatPositionForAPI(
  absoluteX,
  absoluteY,
  containerWidth,
  containerHeight
);
// Result: { x: 37.5, y: 37.5 }

// Convert percentage back to absolute (from API)
const apiPosition = { x: 37.5, y: 37.5 };
const absolutePosition = parsePositionFromAPI(
  apiPosition,
  containerWidth,
  containerHeight
);
// Result: { x: 300, y: 450 }
*/

// ============================================================================
// API DATA FORMAT SPECIFICATION
// ============================================================================

/*
SENDING TO API (Player Position):
{
  "userId": "string",
  "x": 45.23,      // Percentage from left (0-100)
  "y": 67.89       // Percentage from top (0-100)
}

RECEIVING FROM API (Other Users):
{
  "users": [
    {
      "id": "string",
      "x": 25.5,     // Percentage from left (0-100)
      "y": 30.2,     // Percentage from top (0-100)
      "color": "#FF6B6B"  // Optional: user color
    }
  ]
}

WEBSOCKET MESSAGE (Single User Movement):
{
  "type": "user_moved",
  "userId": "string",
  "x": 45.5,       // Percentage from left (0-100)
  "y": 67.2        // Percentage from top (0-100)
}
*/

export default null; // This is just a documentation file
