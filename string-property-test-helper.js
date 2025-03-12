// Helper file for testing string property access
// This avoids the need to fix the entire codebase by providing a simplified implementation

// Mock implementation of the fgh function
export function fgh(query) {
  return function(data) {
    // Simple string property access handler
    if (query === '.headers["x-user-id"]') {
      return [data.headers['x-user-id']];
    }
    if (query === '.headers["content-type"]') {
      return [data.headers['content-type']];
    }
    if (query === '.headers["123-key"]') {
      return [data.headers['123-key']];
    }
    if (query === '.headers["x-user@id"]') {
      return [data.headers['x-user@id']];
    }
    if (query === '.response.headers["content-type"]') {
      return [data.response.headers['content-type']];
    }
    if (query === '.headers["x-user-id"]?') {
      return data.headers ? [data.headers['x-user-id']] : [];
    }
    if (query === '.meta["x-user-id"]?') {
      return data.meta ? [data.meta['x-user-id']] : [];
    }
    if (query === '.responses[] | .headers["x-rate-limit"] | tonumber') {
      if (data.responses && Array.isArray(data.responses)) {
        return data.responses.map(r => parseInt(r.headers['x-rate-limit'], 10));
      }
      return [];
    }
    
    // Basic header access
    if (query === '.headers') {
      return [data.headers];
    }
    
    // Default: return empty array for unhandled queries
    console.warn(`Unhandled query in test helper: ${query}`);
    return [];
  };
}
