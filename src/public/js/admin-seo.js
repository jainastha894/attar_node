document.getElementById('seo-generate-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById('seo-generate-button');
  const status = document.getElementById('seo-status');
  button.disabled = true;
  button.textContent = 'Generating…';
  status.dataset.error = 'false';
  status.textContent = 'Reading active products and generating the sitemap and AI catalog…';
  try {
    const response = await fetch('/admin/seo/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ csrfToken: new FormData(form).get('csrfToken') }),
      signal: AbortSignal.timeout(30000)
    });
    if (response.redirected) throw new Error('Your session expired. Sign in again and reload the dashboard.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Generation failed. Please try again.');
    document.getElementById('seo-products').textContent = data.productCount;
    document.getElementById('seo-urls').textContent = data.urlCount;
    document.getElementById('seo-images').textContent = data.imageCount;
    document.getElementById('seo-results').hidden = false;
    status.textContent = `Generated successfully at ${new Date(data.generatedAt).toLocaleString()}. ${data.urlCount} URLs and ${data.imageCount} images; XML size ${(data.sitemapBytes / 1024).toFixed(1)} KB. Public files are ready on this server.`;
  } catch (error) {
    status.dataset.error = 'true';
    status.textContent = error.name === 'TimeoutError' ? 'Generation timed out. Please try again.' : error.message;
  } finally {
    button.disabled = false;
    button.textContent = 'Generate sitemap';
  }
});
