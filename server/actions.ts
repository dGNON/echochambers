'use server';

export async function fetchAgents(page = 1) {
  const response = await fetch(
    `${process.env.COOKIE_API_URL}?interval=_7Days&page=${page}&pageSize=5`,
    {
      headers: {
        'x-api-key': process.env.COOKIE_API_KEY || ''
      }
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}