export async function fetchPendingReviewPrompts() {
  try {
    const response = await fetch('/api/review-prompts/pending', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.prompts || [];
  } catch {
    return [];
  }
}

export async function dismissReviewPrompt(promptId) {
  await fetch(`/api/review-prompts/${promptId}/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
}
