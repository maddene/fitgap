import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const store = getStore('assessments');
  const url = new URL(req.url);
  const method = req.method;

  try {
    // Get user from Netlify Identity
    const user = context.clientContext?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = user.sub;

    // GET /assessments - List all assessments for user
    if (method === 'GET' && !url.searchParams.get('id')) {
      const { blobs } = await store.list({ prefix: `${userId}/` });

      const assessments = await Promise.all(
        blobs.map(async (blob) => {
          const data = await store.get(blob.key);
          return data ? JSON.parse(data) : null;
        })
      );

      const sorted = assessments
        .filter(a => a !== null)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return new Response(JSON.stringify(sorted), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET /assessments?id=xxx - Get single assessment
    if (method === 'GET' && url.searchParams.get('id')) {
      const assessmentId = url.searchParams.get('id');
      const key = `${userId}/${assessmentId}`;
      const data = await store.get(key);

      if (!data) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /assessments - Save assessment
    if (method === 'POST') {
      const body = await req.json();
      const { assessmentId, ...data } = body;

      const key = `${userId}/${assessmentId}`;

      const assessmentData = {
        ...data,
        id: assessmentId,
        userId,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: data.status || 'in_progress',
      };

      await store.set(key, JSON.stringify(assessmentData));

      return new Response(JSON.stringify({ success: true, data: assessmentData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DELETE /assessments?id=xxx - Delete assessment
    if (method === 'DELETE' && url.searchParams.get('id')) {
      const assessmentId = url.searchParams.get('id');
      const key = `${userId}/${assessmentId}`;
      await store.delete(key);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
