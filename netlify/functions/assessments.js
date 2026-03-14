import { getStore } from '@netlify/blobs';

// Helper to decode JWT without verification (since we don't have access to the secret on free tier)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export default async (req, context) => {
  const store = getStore('assessments');
  const url = new URL(req.url);
  const method = req.method;

  try {
    // Debug logging
    console.log('Function called:', { method, url: url.pathname });
    console.log('Context:', {
      hasClientContext: !!context.clientContext,
      hasUser: !!context.clientContext?.user,
      authHeader: req.headers.get('authorization') ? 'present' : 'missing'
    });

    // Try to get user from context first (if available on paid plans)
    let user = context.clientContext?.user;
    let userId;

    // If not available, manually decode the JWT from Authorization header
    if (!user) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('No authorization header or invalid format');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = decodeJWT(token);

      if (!decoded || !decoded.sub) {
        console.error('Invalid or missing token payload');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        console.error('Token expired');
        return new Response(JSON.stringify({ error: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      userId = decoded.sub;
      console.log('Manually decoded JWT for user:', userId);
    } else {
      userId = user.sub;
      console.log('Got user from context:', userId);
    }

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
