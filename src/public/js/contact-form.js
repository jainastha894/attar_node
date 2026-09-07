(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('contactFormStatus');
  const whatsappLink = document.getElementById('contactWhatsAppLink');
  let sending = false;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const fields = ['firstName', 'lastName', 'email', 'phone', 'subject', 'message'];
    const data = Object.fromEntries(fields.map(name => [name, form.elements[name].value.trim()]));
    const required = fields.filter(name => name !== 'phone');
    if (required.some(name => !data[name])) {
      status.textContent = 'Please complete all required fields.';
      status.classList.remove('hidden');
      return;
    }

    const subject = form.elements.subject.selectedOptions[0]?.textContent.trim() || data.subject;
    const message = [
      'Hello Arjanmal Attarchand, I have an enquiry from your website.', '',
      `Name: ${data.firstName} ${data.lastName}`, `Email: ${data.email}`,
      ...(data.phone ? [`Phone: ${data.phone}`] : []),
      `Subject: ${subject}`, '', 'Message:', data.message
    ].join('\n');
    const whatsappUrl = `https://wa.me/${form.dataset.whatsappNumber}?text=${encodeURIComponent(message)}`;
    // Open during the visitor's click so browsers do not block the tab after the request.
    // It is navigated to WhatsApp only after the enquiry has been saved successfully.
    let chatWindow = null;
    try {
      chatWindow = window.open('about:blank', '_blank');
      if (chatWindow) chatWindow.opener = null;
    } catch { /* The success link remains available if popups are blocked. */ }
    const buttons = [...form.querySelectorAll('button[type="submit"]')];
    sending = true;
    buttons.forEach(button => { button.disabled = true; });
    status.textContent = 'Sending your enquiry…';
    status.classList.remove('hidden');
    try {
      const response = await fetch('/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to save your enquiry. Please try again.');
      whatsappLink.href = whatsappUrl;
      form.classList.add('hidden');
      document.getElementById('successMessage').classList.remove('hidden');
      if (chatWindow && !chatWindow.closed) {
        try { chatWindow.location.replace(whatsappUrl); } catch { chatWindow.close(); }
      }
    } catch (error) {
      if (chatWindow && !chatWindow.closed) chatWindow.close();
      status.textContent = error.message || 'Unable to send your enquiry. Please try again.';
    } finally {
      sending = false;
      buttons.forEach(button => { button.disabled = false; });
    }
  });
})();
