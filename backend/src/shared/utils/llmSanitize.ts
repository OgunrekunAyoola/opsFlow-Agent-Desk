/**
 * Sanitizes input text before sending it to the LLM
 * to prevent prompt injection and remove sensitive data patterns.
 */
export function sanitizeForLLM(text: string): string {
  if (!text) return '';
  
  // 1. Remove potential system prompt injection attempts
  // Strip common escape sequences or instructions like "Ignore all previous instructions"
  let sanitized = text.replace(/(ignore|start|reset|system|user|assistant|instruction|prompt)\s+(all|previous|above|below)?\s+(instructions|prompts|messages|context)/gi, '[REDACTED_INSTRUCTION]');
  
  // 2. Remove markdown code block escapes
  sanitized = sanitized.replace(/```/g, "'''");
  
  // 3. Remove characters that might be used for formatting exploits
  // (Optional, depending on LLM robustness)
  
  return sanitized.trim();
}
