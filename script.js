// Keep footer year current.
const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = String(new Date().getFullYear());

// Give visitors a contact option that does not depend on their default email app.
const copyEmailButton = document.querySelector('.copy-email');
const copyStatus = document.getElementById('copy-status');

if (copyEmailButton && copyStatus) {
  copyEmailButton.addEventListener('click', async () => {
    const email = copyEmailButton.dataset.email;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = 'Email address copied. You can paste it into any email app.';
      copyEmailButton.textContent = 'Copied ✓';
    } catch (error) {
      // Still tell people exactly how to reach out if the clipboard is blocked.
      copyStatus.textContent = 'Please copy this address: ' + email;
      copyEmailButton.textContent = 'Copy email address';
    }
  });
}
