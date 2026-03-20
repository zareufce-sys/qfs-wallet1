import React from 'react';

export default function Activation() {
  return (
    <div className="activation-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">QFS Wallet & Card Activation</h2>
          <p className="page-sub">To activate your QFS Wallet and receive your QFS Card, please follow the activation procedure below.</p>
        </div>
      </div>

      <div className="activation-card">
        <h3 className="activation-section-title">Activation Process</h3>

        <ol className="activation-list">
          <li>
            <h4>Create Your QFS Wallet</h4>
            <p>After registering on the platform, your personal QFS Wallet will be automatically generated and securely linked to your account.</p>
          </li>
          <li>
            <h4>Wallet Activation Deposit</h4>
            <p>To activate your wallet, an initial activation deposit must be made to your personal QFS Wallet.</p>
            <p>This deposit is required to complete the activation and verification process within the system.</p>
          </li>
          <li>
            <h4>Your Deposit Remains Yours</h4>
            <p>The activation deposit is not a fee and is not lost. The full amount is credited directly to your QFS Wallet balance, where it remains available for your use after activation.</p>
          </li>
          <li>
            <h4>Wallet Verification & Activation</h4>
            <p>Once the activation deposit is received and confirmed, your QFS Wallet will be fully activated and ready to receive and manage your funds.</p>
          </li>
          <li>
            <h4>Funds Allocation to Your QFS Card</h4>
            <p>After the wallet activation is completed, your funds will be linked and accessible through your QFS Card.</p>
          </li>
          <li>
            <h4>Card Issuance & Delivery</h4>
            <p>Your personalized QFS Card will be issued and securely shipped to the address you provided during registration.</p>
          </li>
        </ol>

        <h3 className="activation-section-title">Important Information</h3>
        <ul className="activation-bullets">
          <li>The activation deposit is required only once to activate your wallet.</li>
          <li>The deposited amount remains your property and stays in your QFS Wallet.</li>
          <li>After activation, you will have full access to your wallet and card services.</li>
          <li>Your QFS Card allows you to securely access and manage your funds.</li>
        </ul>

        <h3 className="activation-section-title">Secure Financial Access</h3>
        <p className="activation-paragraph">The QFS system is designed to provide a secure and transparent financial infrastructure, allowing users reliable access and control over their digital financial assets.</p>
      </div>
    </div>
  );
}
