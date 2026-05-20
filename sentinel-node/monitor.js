import dotenv from 'dotenv'
dotenv.config();

import https from 'https';
import { performance } from 'perf_hooks';
import { connectToDatabase } from './db.js';


// --- PILLAR 1: THE TOOL (The logic to measure speed) ---
const checkWebsite = (url) => {
    return new Promise((resolve, reject) => {
        const urlData = new URL(url);
        const startTime = performance.now();
        let dnsTime, tcpTime, ttfbTime;

        // Add headers to avoid being blocked as a bot
        const options = {
            method: 'GET',
            headers: {
                // This makes your script look like a Chrome browser
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 5000
        };

        const request = https.request(urlData,options, (response) => {
            // Fires when the first byte of data arrives
            response.once('readable', () => {
                ttfbTime = performance.now() - startTime;
            });
            response.on('data', () => {}); // Consumes data to finish request
            response.on('end', () => {
                const totalTime = performance.now() - startTime;
                resolve({
                    url,
                    status: response.statusCode,
                    dns: dnsTime ? dnsTime.toFixed(2) : "0",
                    tcp: tcpTime ? tcpTime.toFixed(2) : "0",
                    ttfb: ttfbTime ? ttfbTime.toFixed(2) : "0",
                    total: totalTime.toFixed(2)
                });
            });
        });

        // Captures DNS and Connection times
        request.on('socket', (socket) => {
            socket.on('lookup', () => { dnsTime = performance.now() - startTime; });
            socket.on('connect', () => { tcpTime = performance.now() - startTime; });
        });

        request.on('error', (err) => reject(err));
        request.end();
    });
};

// --- PILLAR 2: THE VOICE (Discord Alerts) ---

const sendAlert = async (url, errorMsg) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
   // DEBUG: Check if the URL is actually being loaded
  if(!webhookUrl) return;

  // only log this when we really try to send
  console.log(`🔔 Sending Discord alert for: ${url}`)
  
   
  const data = JSON.stringify({
    content : `🚨 **ALERT: Website Down!**\n**URL:** ${url}\n**Error:** ${errorMsg}\n**Time:** ${new Date().toLocaleString()}`
  });

    const urlData = new URL(webhookUrl);
    const options = {
        hostname: urlData.hostname,
        path: urlData.pathname + urlData.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 204 || res.statusCode === 200){
        console.log(`✅ Discord alert delivered for ${url}`);
       
      }else{
         console.error(`❌ Discord rejected alert. Status: ${res.statusCode}`)
      }
    });
    req.on('error', (e) => console.error("❌ Network error sending to Discord:", e.message));
    req.write(data);
    req.end();
  
}

// --- PILLAR 3: THE WORKER (The loop that saves to MongoDB) ---
async function startSystem() {
     // 1. Get the main Database object from your connection tool
    // Assuming your connectToDatabase() in db.js returns the database object
    const {db, pingsCollection} = await connectToDatabase();


    // 2. Now you can easily grab any collection you want from that one 'db'
    const targetsCollection = db.collection('targets');

    console.log("🚀 Monitoring system started...");

    // 3. The actual work function
    const performChecks = async () => {

          const sitesFromDB = await targetsCollection.find({}).toArray();

          // if theDB is empty , use fallback so system doesn't crash
            //const targets = sitesFromDB.length > 0 
           // ? sitesFromDB.map(s => s.url)
           // : ['https://www.google.com'];
           if(sitesFromDB.length === 0){
            console.log("⏸️ No sites to monitor. Waiting for new targets...");
            return; // Exit the function early if there's nothing to do
           }
           const targets = sitesFromDB.map(s => s.url)

        for (const url of targets) {
            try {
                const stats = await checkWebsite(url);

                const isHealthy = stats.status < 400 || stats.status === 403;
                // if status is not 200 (OK) , it might be a problem
               // if(stats.status >= 400 && stats.status !== 403){
               if(!isHealthy){
                  await sendAlert(url, `Status Code: ${stats.status}`);
                  console.log(stats.status);
                }
                
                // Prepare the data for MongoDB
                const result = {
                    timestamp: new Date(),
                    metadata: { url: stats.url },
                    latency: {
                        dns: parseFloat(stats.dns),
                        tcp: parseFloat(stats.tcp),
                        ttfb: parseFloat(stats.ttfb),
                        total: parseFloat(stats.total)
                    },
                    status: stats.status,
                    online: isHealthy
                };

                await pingsCollection.insertOne(result);
                console.log(`✅ Saved: ${url} (${stats.total}ms)`);
            } catch (error) {
              // This is total failure (DNS failed or Timeout)
                console.error(`❌ Failed: ${url} - ${error.message}`);
                await sendAlert(url, error.message); //tell discord
            }
        }
    };

    // Run once immediately, then every 60 seconds
    performChecks();
    setInterval(performChecks, 60000);
}

// Start the whole thing
startSystem();