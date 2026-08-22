// Protects the page: redirect to login if not logged in
const studentId = localStorage.getItem('studentId');
if (!studentId) {
  window.location.href = 'index.html';
}

const params = new URLSearchParams(window.location.search);
const assignmentId = params.get('id');

let currentStatus = 'Pending';

async function loadAssignment() {
  try {
    const res = await fetch(`/api/submissions?studentId=${studentId}`);
    const assignments = await res.json();
    const a = assignments.find(x => x.assignmentId === assignmentId);

    if (!a) {
      document.getElementById('aTitle').textContent = 'Assignment not found';
      return;
    }

    currentStatus = a.status;

    document.getElementById('aTitle').textContent = a.title;
    document.getElementById('aDue').textContent = `Due: ${a.dueDate}, ${a.dueTime}`;
    document.getElementById('aDesc').textContent = a.description;

    const statusEl = document.getElementById('aStatus');
    statusEl.textContent = a.status;
    statusEl.className = 'badge ' +
      (a.status === 'Submitted' ? 'badge-submitted'
       : a.status === 'Overdue' ? 'badge-overdue'
       : 'badge-pending');

    const btn = document.getElementById('markDoneBtn');
    if (a.status === 'Submitted') {
      btn.disabled = true;
      btn.textContent = 'ALREADY SUBMITTED';
      btn.style.opacity = '0.6';
    }
  } catch (err) {
    console.error('Failed to load assignment', err);
  }
}

document.getElementById('markDoneBtn').addEventListener('click', async () => {
  const msgBox = document.getElementById('submitMsg');
  msgBox.textContent = '';

  if (currentStatus === 'Submitted') return;

  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, studentId })
    });
    const data = await res.json();

    if (data.success) {
      msgBox.style.color = '#059669';
      msgBox.textContent = 'Assignment submitted successfully!';
      loadAssignment();
    } else {
      msgBox.style.color = '#dc2626';
      msgBox.textContent = data.message || 'Submission failed.';
    }
  } catch (err) {
    msgBox.style.color = '#dc2626';
    msgBox.textContent = 'Could not connect to server.';
  }
});

loadAssignment();
