export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Prefer');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // You MUST set these environment variables in your Vercel Dashboard
    // Settings -> Environment Variables
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://szohpkcgubckxoauspmr.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
        return res.status(500).json({ error: 'Server incorrectly configured. Missing API keys.' });
    }

    try {
        // req.url is something like "/api/supabase/products_clean?select=*"
        // We strip the "/api/supabase" part to get "/products_clean?select=*"
        const supabasePathAndQuery = req.url.replace(/^\/api\/supabase/, '');
        
        // Construct the full Supabase target URL
        const targetUrl = `${SUPABASE_URL}/rest/v1${supabasePathAndQuery}`;

        // Construct headers combining required Supabase headers and client headers (for pagination)
        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        };

        if (req.headers.range) {
            headers['Range'] = req.headers.range;
        }
        if (req.headers.prefer) {
            headers['Prefer'] = req.headers.prefer;
        }

        // Fetch from the real Supabase
        const response = await fetch(targetUrl, { 
            method: req.method,
            headers: headers,
            // Only pass body if method is POST/PUT/PATCH
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
        });

        // Forward pagination content-range back to client
        const contentRange = response.headers.get('content-range');
        if (contentRange) {
            res.setHeader('Content-Range', contentRange);
        }

        // Return the response exactly as Supabase sent it
        const data = await response.text();
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        return res.status(response.status).send(data);

    } catch (error) {
        console.error('Supabase Proxy Error:', error);
        return res.status(500).json({ error: 'Internal Server Proxy Error' });
    }
}
