import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl animate-fade-in pb-20">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full"></div>

        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 font-orbitron">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-4">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">1. Introduction</h2>
            <p>
              Your privacy is a top priority for Prompt Minds ("we", "our", "us"). 
              This Privacy Policy explains how we collect, use, and protect your information 
              when you use our multi-tool web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">2. Local File Processing</h2>
            <p>
              The core feature of Prompt Minds is that <strong>your files are not uploaded to our servers</strong> for processing, 
              unless explicitly stated otherwise for specific cloud-based features. The vast majority of our tools (PDF Merge, Split, Conversion, etc.) 
              operate entirely client-side, right in your web browser, using modern WebAssembly and JavaScript technologies.
            </p>
            <p className="mt-2 p-3 bg-slate-800/50 border-l-4 border-green-500 rounded-r-md">
              This means your sensitive documents never leave your device, ensuring maximum security and confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">3. Cookies & Usage Data</h2>
            <p>
              We use cookies to enhance your user experience, analyze traffic, and personalize content.
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Essential Cookies:</strong> Necessary for the technical operation of the site.</li>
              <li><strong className="text-slate-200">Analytical Cookies:</strong> Allow us to understand how users interact with the site.</li>
              <li><strong className="text-slate-200">Advertising Cookies:</strong> Used by our advertising partners to serve relevant ads.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">4. Advertising (Google AdSense)</h2>
            <p>
              We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites.
            </p>
            <div className="mt-3 text-sm bg-slate-800 p-4 rounded-lg border border-slate-700">
                <ul className="list-disc list-inside space-y-2">
                <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.
                </li>
                <li>
                    Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ad Settings</a>.
                </li>
                </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">5. GDPR & CCPA Compliance</h2>
            <p>
              In accordance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you have rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-slate-400">
              <li>Right to access and rectification.</li>
              <li>Right to erasure ("Right to be forgotten").</li>
              <li>Right to opt-out of the sale of personal data (we do not sell your data).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-3 font-orbitron">6. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us via our platform.
            </p>
          </section>
        </div>
        
        <div className="mt-12 text-center">
           <a href="#" className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
             Back to Home
           </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;