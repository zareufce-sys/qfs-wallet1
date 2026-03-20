import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const DEPOSIT_OPTIONS = [
  {
    id: 'btc',
    label: 'Bitcoin (BTC)',
    address: 'bc1qwd00ladfwklgglmftczj3qe8syfcd8rk5y3gf6',
    qrData: 'bitcoin:bc1qwd00ladfwklgglmftczj3qe8syfcd8rk5y3gf6',
  },
  {
    id: 'eth',
    label: 'Ethereum (ETH)',
    address: '0xfd1a8accc8c1907aeb054a3baa473dbc3421294f',
    qrData: 'ethereum:0xfd1a8accc8c1907aeb054a3baa473dbc3421294f',
  },
  {
    id: 'usdt',
    label: 'Tether (USDT - ERC20)',
    address: '0xfd1a8accc8c1907aeb054a3baa473dbc3421294f',
    qrData: 'ethereum:0xfd1a8accc8c1907aeb054a3baa473dbc3421294f',
  },
];

function formatUsd(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);
}

function ActivationImage({ src, alt, side }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`finish-activation-image finish-activation-image-${side}`}>
      {!failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <div className="finish-activation-image-fallback">
          Image not found: {src}
        </div>
      )}
    </div>
  );
}

function QrCodeImage({ option, size = 240 }) {
  const generatedQr = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(option.qrData || option.address)}`;

  return (
    <img
      src={generatedQr}
      alt={`${option.label} deposit QR code`}
    />
  );
}

export default function FinishActivation() {
  const { user } = useAuth();
  const [selectedCryptoId, setSelectedCryptoId] = useState('');
  const [previewOption, setPreviewOption] = useState(null);

  const depositById = {
    btc: Number(user?.deposit_btc),
    eth: Number(user?.deposit_eth),
    usdt: Number(user?.deposit_usdt),
  };

  const getOptionAmount = (id) => {
    const configured = depositById[id];
    const safeValue = Number.isFinite(configured) && configured >= 0 ? configured : 100;
    return formatUsd(safeValue);
  };

  const optionsWithAmounts = DEPOSIT_OPTIONS.map((option) => ({
    ...option,
    amount: getOptionAmount(option.id),
  }));

  const selectedOption = optionsWithAmounts.find((option) => option.id === selectedCryptoId) || null;

  return (
    <div className="finish-activation-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Finish Activation</h2>
          <p className="page-sub">
            To complete the activation, please deposit funds into your QFS wallet using the QR codes below.
            The required deposit amount will be displayed once you click on one of the QR codes and select the
            cryptocurrency you wish to use for the deposit.
          </p>
        </div>
      </div>

      <div className="finish-activation-card">
        <ActivationImage
          src="/finish-activation-left.png"
          alt="QFS card on technology background"
          side="left"
        />
        <ActivationImage
          src="/finish-activation-right.png"
          alt="QFS card front and back render"
          side="right"
        />
      </div>

      <div className="finish-activation-deposit-card">
        <div className="finish-activation-deposit-header">
          <h3>Select Deposit Cryptocurrency</h3>
          <label htmlFor="crypto-select">Cryptocurrency</label>
          <select
            id="crypto-select"
            value={selectedCryptoId}
            onChange={(event) => setSelectedCryptoId(event.target.value)}
          >
            <option value="">Choose a cryptocurrency</option>
            {optionsWithAmounts.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finish-activation-qr-grid">
          {optionsWithAmounts.map((option) => {
            const isSelected = option.id === selectedCryptoId;

            return (
              <button
                type="button"
                key={option.id}
                className={`finish-activation-qr-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedCryptoId(option.id);
                  setPreviewOption(option);
                }}
              >
                <QrCodeImage option={option} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="finish-activation-amount-panel">
          {selectedOption ? (
            <>
              <p className="amount-title">Required Deposit Amount (USD)</p>
              <p className="amount-value">{selectedOption.amount}</p>
              <p className="amount-address">Wallet Address: {selectedOption.address}</p>
            </>
          ) : (
            <p className="amount-placeholder">
              Click a QR code or choose a cryptocurrency to view the required deposit amount.
            </p>
          )}
        </div>
      </div>

      {previewOption && (
        <div className="qr-preview-overlay" onClick={() => setPreviewOption(null)}>
          <div className="qr-preview-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="qr-preview-close"
              onClick={() => setPreviewOption(null)}
            >
              Close
            </button>
            <h4>{previewOption.label} QR Code</h4>
            <QrCodeImage option={previewOption} size={340} />
            <p className="qr-preview-address-label">Wallet Address</p>
            <p className="qr-preview-address">{previewOption.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
