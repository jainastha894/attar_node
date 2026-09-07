// WhatsApp Button Click Tracker
function trackWhatsAppClick(productId, productName, industry, source) {
  // Track the click asynchronously (don't block navigation)
  fetch('/api/track-enquiry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId: productId || null,
      productName: productName || 'Business Enquiry (Floating)',
      industry: industry || null,
      source: source || 'floating'
    })
  }).catch(err => {
    console.error('Error tracking WhatsApp click:', err);
  });
}

