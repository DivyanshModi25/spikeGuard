export default function DeveloperGuide() {
  return (
    <div className="min-h-screen bg-[#222222] text-white px-6 py-10 font-sans overflow-y-auto h-[100vh] custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-orange-600 mb-8">📘 Developer Integration Guide</h1>

        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          Welcome to the log portal integration guide. This documentation helps you push logs from your apps to our portal, enabling powerful insights and real-time analysis.
        </p>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">🔑 Step 1: Get Your API Key</h2>
          <div className="bg-[#2c2c2c] p-6 rounded-2xl shadow-lg">
            <p className="mb-4">Follow these steps to generate your API key:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Visit your dashboard: <a href="https://yourportal.com/dashboard" className="text-orange-500 underline">https://yourportal.com/dashboard</a></li>
              <li>Go to the <strong>API Keys</strong> section</li>
              <li>Click <strong>Generate New Key</strong> and securely copy your key</li>
              <li>Store it securely; treat it like a password</li>
            </ol>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">⚙️ Step 2: Configure Logging</h2>
          <div className="bg-[#2c2c2c] p-6 rounded-2xl shadow-lg">
            <p className="mb-4">Here's an example of how to push logs in a Node.js app using Axios:</p>
            <pre className="bg-black text-green-400 text-sm rounded-xl p-4 overflow-auto">
{`const axios = require('axios');

const logData = {
  level: 'info',
  service: 'auth-service',
  message: 'User login successful',
  userId: 'abc123',
  timestamp: new Date().toISOString(),
};

axios.post('https://yourportal.com/api/logs', logData, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE'
  }
})
.then(() => console.log('Log pushed successfully'))
.catch(err => console.error('Error pushing log:', err));`}
            </pre>

            <p className="mt-4">✅ Use JSON structure for logs. Include fields like <code className="text-orange-400">level</code>, <code className="text-orange-400">message</code>, <code className="text-orange-400">timestamp</code>, and any custom tags.</p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">📊 Step 3: View and Analyze Logs</h2>
          <div className="bg-[#2c2c2c] p-6 rounded-2xl shadow-lg">
            <p className="mb-4">Go to the <span className="text-orange-500">Analytics</span> tab in your dashboard to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>📈 View real-time logs across all services</li>
              <li>🔍 Filter by <strong>level</strong>, <strong>userId</strong>, <strong>tags</strong></li>
              <li>📆 Navigate historical logs using time range filters</li>
              <li>📂 Download logs as JSON or CSV</li>
              <li>🚨 Set up alert rules for critical log levels</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">🔧 Supported Platforms</h2>
          <div className="bg-[#2c2c2c] p-6 rounded-2xl shadow-lg">
            <p className="mb-4">Our SDKs make integration simple across environments:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Node.js</strong> – npm install <code className="text-orange-400">@yourcompany/logger</code></li>
              <li><strong>Python</strong> – pip install <code className="text-orange-400">yourcompany-logger</code></li>
              <li><strong>Java</strong> – Maven dependency support</li>
              <li><strong>Docker</strong> – Include our logging agent in your container</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">📥 Need Help?</h2>
          <div className="bg-[#2c2c2c] p-6 rounded-2xl shadow-lg">
            <p className="mb-4">We’re here for you. If you hit any issues:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Check out our <a href="https://yourportal.com/docs" className="text-orange-500 underline">full documentation</a></li>
              <li>Email support at <span className="text-orange-400">support@yourportal.com</span></li>
              <li>Join our developer community on <a href="https://discord.gg/yourportal" className="text-orange-500 underline">Discord</a></li>
            </ul>
          </div>
        </section>

        <footer className="text-sm text-gray-400 border-t border-gray-700 pt-6 text-center">
          © 2025 YourCompany Inc. • <a href="/privacy" className="text-gray-500 hover:text-orange-500">Privacy</a> • <a href="/terms" className="text-gray-500 hover:text-orange-500">Terms</a>
        </footer>
      </div>
    </div>
  );
}