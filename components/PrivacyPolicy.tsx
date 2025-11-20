
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in pb-20">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Your privacy is a top priority for MagicPDF ("we", "our", "us"). 
              This Privacy Policy explains how we collect, use, and protect your information 
              when you use our multi-tool web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Local File Processing</h2>
            <p>
              The core feature of MagicPDF is that <strong>your files are not uploaded to our servers</strong> for processing. 
              Our tools (PDF Merge, Split, Conversion, etc.) operate entirely client-side, right in your web browser, 
              using modern WebAssembly and JavaScript technologies.
            </p>
            <p className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              <strong>Security Note:</strong> This architecture ensures your sensitive documents never leave your device, providing maximum security and confidentiality compared to traditional server-based PDF tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies & Usage Data</h2>
            <p>
              We use cookies to enhance your user experience, analyze traffic, and personalize content.
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-600">
              <li><strong>Essential Cookies:</strong> Necessary for the technical operation of the site.</li>
              <li><strong>Analytical Cookies:</strong> Allow us to understand how users interact with the site.</li>
              <li><strong>Advertising Cookies:</strong> Used by our advertising partners to serve relevant ads.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Advertising (Google AdSense)</h2>
            <p>
              We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites.
            </p>
            <div className="mt-3 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <ul className="list-disc list-inside space-y-2">
                <li>
                    Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.
                </li>
                <li>
                    Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ad Settings</a>.
                </li>
                </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. GDPR & CCPA Compliance</h2>
            <p>
              In accordance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you have rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-600">
              <li>Right to access and rectification.</li>
              <li>Right to erasure ("Right to be forgotten").</li>
              <li>Right to opt-out of the sale of personal data (we do not sell your data).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us via our platform.
            </p>
          </section>
        </div>
        
        <div className="mt-12 border-t border-gray-100 pt-8 text-center">
           <a href="#" className="inline-block bg-gray-900 text-white py-3 px-8 rounded-lg font-semibold shadow hover:bg-gray-800 transition-all">
             Back to Home
           </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
