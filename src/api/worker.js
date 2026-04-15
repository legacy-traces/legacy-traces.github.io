// Cloudflare Worker Script with KV (For User Management)
// Deployment Instructions:
// 1. Ensure you have a KV namespace bound as "USERS_KV" in your wrangler.toml
// 2. Add these endpoints to your existing Cloudflare Worker routing logic

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            });
        }
        
        const url = new URL(request.url);
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        };
        
        const type = url.searchParams.get("type");
        
        // 🚨 NEW Admin Backend Protection for orders!
        if (type === "order" && request.method === "GET") {
            const email = url.searchParams.get("email");
            
            if (email !== "legacytraces24@gmail.com") {
                return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers });
            }
            // (Put your actual DB fetching logic here, if this worker supports it)
        }
        
        if (request.method !== 'POST' && request.method !== 'GET') {
            return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
        }
        
        try {
            // 1️⃣ Create User endpoint
            if (url.pathname === '/api/user/create') {
                const { email, name } = await request.json();
                
                if (!email) {
                    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers });
                }
                
                const key = `user:${email}`;
                
                // Fetch existing using KV
                const existingUserStr = await env.USERS_KV.get(key);
                
                // If exists: Return existing user (DO NOT BLINDLY OVERWRITE)
                if (existingUserStr) {
                    const user = JSON.parse(existingUserStr);
                    return new Response(JSON.stringify(user), { status: 200, headers });
                } 
                
                // If not exists: Create new record
                const newUser = { 
                    email, 
                    name: name || "", 
                    phone: "", 
                    address: "" 
                };
                
                await env.USERS_KV.put(key, JSON.stringify(newUser));
                return new Response(JSON.stringify(newUser), { status: 201, headers });
            }
            
            // 2️⃣ Update User endpoint
            if (url.pathname === '/api/user/update') {
                const { email, phone, address } = await request.json();
                
                if (!email) {
                    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers });
                }
                
                const key = `user:${email}`;
                
                // Fetch existing user from KV
                const existingUserStr = await env.USERS_KV.get(key);
                
                if (!existingUserStr) {
                    return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers });
                }
                
                // Parse correctly
                const user = JSON.parse(existingUserStr);
                
                // Update specific fields only
                user.phone = phone !== undefined ? phone : user.phone;
                user.address = address !== undefined ? address : user.address;
                
                // Save back to KV
                await env.USERS_KV.put(key, JSON.stringify(user));
                
                return new Response(JSON.stringify(user), { status: 200, headers });
            }
            
            return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
            
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
        }
    }
}
