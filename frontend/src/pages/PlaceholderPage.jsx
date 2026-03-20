import React from 'react';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/bills': {
    title: 'Activation',
    subtitle: 'Activation tools and requests will be available here.',
  },
  '/finish-activation': {
    title: 'Finish Activation',
    subtitle: 'Complete the final activation steps for your wallet and card here.',
  },
  '/notifications': {
    title: 'Notifications',
    subtitle: 'No notifications available.',
  },
  '/card': {
    title: 'My Card',
    subtitle: 'Card controls and card settings will live here.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Profile, security, and app preferences are coming here.',
  },
  '/support': {
    title: 'Call Center',
    subtitle: 'Support contacts and call options will be listed on this page.',
  },
  '/help': {
    title: 'Help',
    subtitle: 'Contact support if you are experiencing issues with your QFS Wallet.',
  },
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || {
    title: 'Coming Soon',
    subtitle: 'This page is under construction.',
  };
  const bodyMessage = pathname === '/notifications'
    ? 'You currently have no notifications. New alerts will appear here when available.'
    : pathname === '/help'
      ? 'If you are experiencing any issues or difficulties with your QFS Wallet, our support team is here to assist you.'
    : 'We are preparing this section for a better experience on desktop and mobile.';

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{meta.title}</h2>
          <p className="page-sub">{meta.subtitle}</p>
        </div>
      </div>
      <div className="placeholder-card">
        <p>{bodyMessage}</p>
        {pathname === '/help' && (
          <>
            <p>
              Please contact our support team directly on Telegram at <strong>@QFSSupportSystem</strong>, where a
              representative will help you resolve your issue as quickly as possible.
            </p>
            <p>
              For faster assistance, we recommend including a brief description of the problem you are
              experiencing when you reach out.
            </p>
            <p>Thank you for your patience and for being part of our community.</p>
          </>
        )}
      </div>
    </div>
  );
}
