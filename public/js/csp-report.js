/**
 * CSP Violation Report Handler
 * 
 * This script handles Content Security Policy violation reports.
 * In a production environment, you might want to log these violations to a secure endpoint.
 */

// Only run in browsers
if (typeof window !== 'undefined') {
  window.addEventListener('securitypolicyviolation', function(e) {
    // Log CSP violations to the console in development
    console.warn('CSP Violation:', {
      'blockedURI': e.blockedURI,
      'violatedDirective': e.violatedDirective,
      'originalPolicy': e.originalPolicy
    });
    
    // In a production environment, you could send this data to your server
    // for logging and analysis
    /*
    fetch('/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => console.error('Error reporting CSP violation:', err));
    */
  });
} 