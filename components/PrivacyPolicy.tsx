
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p>
              La protection de votre vie privée est une priorité absolue pour Magic PDF ("nous", "notre"). 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
              lorsque vous utilisez notre application web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Traitement des Fichiers (Fonctionnement Local)</h2>
            <p>
              La caractéristique principale de Magic PDF est que <strong>vos fichiers ne sont pas téléchargés sur nos serveurs</strong> pour le traitement, 
              sauf indication contraire explicite. La grande majorité de nos outils (Fusion, Division, Conversion, etc.) fonctionnent entièrement 
              côté client, dans votre navigateur web, grâce aux technologies WebAssembly et JavaScript modernes.
            </p>
            <p className="mt-2">
              Cela signifie que vos documents sensibles ne quittent jamais votre appareil, garantissant une sécurité et une confidentialité maximales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Cookies et Données de Navigation</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience utilisateur, analyser le trafic et personnaliser le contenu.
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement technique du site.</li>
              <li><strong>Cookies analytiques :</strong> Nous permettent de comprendre comment les utilisateurs interagissent avec le site.</li>
              <li><strong>Cookies publicitaires :</strong> Utilisés par nos partenaires publicitaires pour diffuser des annonces pertinentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Publicité (Google AdSense)</h2>
            <p>
              Nous utilisons Google AdSense pour diffuser des publicités. Google utilise des cookies pour diffuser des annonces basées sur vos visites antérieures sur notre site web ou sur d'autres sites web.
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                Google utilise des cookies publicitaires pour permettre à ses partenaires et à lui-même de diffuser des annonces à vos utilisateurs en fonction de leur visite sur vos sites et/ou d'autres sites sur Internet.
              </li>
              <li>
                Les utilisateurs peuvent désactiver la publicité personnalisée en visitant les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Paramètres des annonces</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. RGPD et CCPA</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et au California Consumer Privacy Act (CCPA), vous disposez de droits concernant vos données personnelles :
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Droit d'accès et de rectification.</li>
              <li>Droit à l'effacement ("droit à l'oubli").</li>
              <li>Droit de refuser la vente de vos données personnelles (nous ne vendons pas vos données).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Nous Contacter</h2>
            <p>
              Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous contacter via notre page de contact ou par email.
            </p>
          </section>
        </div>
        
        <div className="mt-10 text-center">
           <a href="#" className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors">
             Retour à l'accueil
           </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
