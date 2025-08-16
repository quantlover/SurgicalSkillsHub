/**
 * Utility functions for generating unique IDs for the learning analytics system
 */

// Generate unique watch session ID
export function generateWatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `W${timestamp}${random}`.toUpperCase();
}

// Generate role-specific user sub-ID
export function generateUserRoleId(userId: string, role: string): string {
  // Extract numeric part from user ID or use hash
  const userIdHash = hashString(userId).substring(0, 5);
  
  // Role prefixes
  const rolePrefixes: { [key: string]: string } = {
    'learner': '1L',
    'evaluator': '1E', 
    'researcher': '1R',
    'admin': '1A'
  };
  
  const prefix = rolePrefixes[role.toLowerCase()] || '1U'; // Default to 1U for unknown roles
  return `${prefix}${userIdHash}`;
}

// Generate unique video ID (if needed)
export function generateVideoId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `V${timestamp}${random}`.toUpperCase();
}

// Helper function to create a hash from string
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

// Validate ID formats
export function validateWatchId(watchId: string): boolean {
  return /^W[A-Z0-9]{10,}$/.test(watchId);
}

export function validateUserRoleId(roleId: string): boolean {
  return /^1[LERA][A-Z0-9]{5}$/.test(roleId);
}

export function validateVideoId(videoId: string): boolean {
  // Accept both UUID format and custom V-prefixed format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customRegex = /^V[A-Z0-9]{8,}$/;
  return uuidRegex.test(videoId) || customRegex.test(videoId);
}

// Generate learning record ID with all components
export function generateLearningRecordIds(userId: string, role: string) {
  return {
    watchId: generateWatchId(),
    userRoleId: generateUserRoleId(userId, role),
    timestamp: new Date().toISOString()
  };
}

// Parse role from role ID
export function parseRoleFromRoleId(roleId: string): string {
  const roleMap: { [key: string]: string } = {
    '1L': 'learner',
    '1E': 'evaluator',
    '1R': 'researcher', 
    '1A': 'admin'
  };
  
  const prefix = roleId.substring(0, 2);
  return roleMap[prefix] || 'unknown';
}

// Generate batch of unique IDs for bulk operations
export function generateBatchIds(count: number, type: 'watch' | 'video' = 'watch'): string[] {
  const ids = new Set<string>();
  
  while (ids.size < count) {
    const id = type === 'watch' ? generateWatchId() : generateVideoId();
    ids.add(id);
  }
  
  return Array.from(ids);
}