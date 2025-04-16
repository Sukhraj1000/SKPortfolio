/**
 * Cursor gradient effect script
 * This file handles the interactive background gradient effect that follows the cursor
 */
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('mousemove', function(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    const bg = document.getElementById('gradient-bg');
    if (bg) {
      // Use template literals for safer string concatenation
      bg.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(125, 39, 255, 0.08), transparent 40%)`;
    }
  });
}); 