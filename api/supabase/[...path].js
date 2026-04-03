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
        return res.status(500).json({ 
            error: 'Server configuration error: Missing SUPABASE_ANON_KEY environment variable.',
            hint: 'Set this in Vercel Dashboard -> Settings -> Environment Variables'
        });
    }

    try {
        // Robust reconstruction for Vercel catch-all routes
        // Some Vercel versions use 'path', others use '...path' (the literal filename)
        const rawPath = req.query.path || req.query['...path'];
        let path = '';
        
        if (rawPath) {
            path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
        } else {
            // Fallback: Extract from URL if query params fail
            const urlWithoutQuery = req.url.split('?')[0];
            path = urlWithoutQuery.replace(/^\/api\/supabase\/?/, '');
        }
        
        if (!path) throw new Error("Target path missing in request. URL: " + req.url);

        // Reconstruct query string from the raw URL
        const urlParts = req.url.split('?');
        const queryString = urlParts.length > 1 ? '?' + urlParts[1] : '';
        
        // Final Supabase API URL
        // We ensure there is only one slash between rest/v1 and path
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const targetUrl = `${SUPABASE_URL}/rest/v1/${cleanPath}${queryString}`;

        console.log(`[Proxy] Routing to: ${targetUrl}`);

        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        };

        // Forward important headers for pagination and filtering
        if (req.headers.range) headers['Range'] = req.headers.range;
        if (req.headers.prefer) headers['Prefer'] = req.headers.prefer;

        // Execute the fetch
        const response = await fetch(targetUrl, { 
            method: req.method,
            headers: headers,
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
        });

        // Forward pagination range headers
        const contentRange = response.headers.get('content-range');
        if (contentRange) res.setHeader('Content-Range', contentRange);

        // Standardize output
        const data = await response.text();
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        
        return res.status(response.status).send(data);

    } catch (error) {
        console.error('[Supabase Proxy Error]:', { 
            message: error.message, 
            url: req.url,
            stack: error.stack 
        });
        
        return res.status(500).json({ 
            error: 'Internal Server Proxy Error',
            details: error.message,
            path: req.url,
            query: req.query
        });
    }


}
