export default async (req, context) => {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'Netlify Functions'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
