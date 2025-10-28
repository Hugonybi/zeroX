import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { certificateService } from '../lib/certificateService';
import type { Certificate } from '../types/certificate';
import { Button } from '../components/ui/Button';

export function CertificatePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    certificateService
      .getByOrder(orderId)
      .then((data) => {
        setCertificate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load certificate:', err);
        setError('Failed to load certificate. Please try again.');
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ink border-r-transparent"></div>
          <p className="text-sm text-ink-muted">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Error</p>
          <h2 className="font-brand text-3xl uppercase tracking-[0.2em]">Certificate Not Found</h2>
        </div>
        <p className="text-sm text-ink-muted">{error || 'Certificate not found'}</p>
        <Button onClick={() => navigate('/')}>Back to Gallery</Button>
      </div>
    );
  }

  const { artwork, authenticityToken, ownershipToken, order, owner } = certificate;

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Purchase Complete</p>
        <h1 className="font-brand text-4xl uppercase tracking-[0.2em]">
          Your Certificates
        </h1>
        <p className="text-sm text-ink-muted">
          Two blockchain tokens have been minted for your artwork purchase
        </p>
      </div>

      {/* Artwork Preview */}
      <div className="rounded-lg border border-ink/10 bg-surface-secondary p-6">
        <div className="flex gap-6">
          <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded">
            <img
              src={artwork.mediaUrl}
              alt={artwork.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="font-brand text-2xl uppercase tracking-[0.15em]">{artwork.title}</h2>
            <p className="text-sm text-ink-muted">{artwork.description}</p>
            <div className="flex gap-4 text-xs text-ink-muted">
              <span>Type: {artwork.type}</span>
              {artwork.serialNumber && <span>Serial: {artwork.serialNumber}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Authenticity Certificate */}
        <div className="rounded-lg border border-ink/10 bg-surface p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">
                Proof of Origin
              </span>
              <h3 className="mt-3 font-brand text-xl uppercase tracking-[0.15em]">
                Authenticity Certificate
              </h3>
            </div>
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <p className="text-sm text-ink-muted">
            Non-transferable proof that this artwork is genuine and originated from the artist.
          </p>

          <div className="space-y-3 border-t border-ink/10 pt-4">
            <div>
              <p className="text-xs text-ink-muted">Token ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">{authenticityToken.hederaTokenId}</p>
                <button
                  onClick={() => copyToClipboard(authenticityToken.hederaTokenId, 'Token ID')}
                  className="text-ink-muted hover:text-ink"
                  title="Copy"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-ink-muted">Transaction Hash</p>
              <p className="font-mono text-xs truncate">{authenticityToken.hederaTxHash}</p>
            </div>

            <div>
              <p className="text-xs text-ink-muted">Metadata</p>
              <a
                href={authenticityToken.metadataIpfs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate block"
              >
                View on IPFS →
              </a>
            </div>
          </div>

          <a
            href={authenticityToken.hashscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full">
              View on Hedera Explorer →
            </Button>
          </a>
        </div>

        {/* Ownership Certificate */}
        <div className="rounded-lg border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-surface p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-700">
                Asset Ownership
              </span>
              <h3 className="mt-3 font-brand text-xl uppercase tracking-[0.15em]">
                Ownership Certificate
              </h3>
            </div>
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <p className="text-sm text-ink-muted">
            Transferable token representing legal ownership rights to this artwork.
          </p>

          <div className="space-y-3 border-t border-amber-500/20 pt-4">
            <div>
              <p className="text-xs text-ink-muted">Token ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">{ownershipToken.hederaTokenId}</p>
                <button
                  onClick={() => copyToClipboard(ownershipToken.hederaTokenId, 'Token ID')}
                  className="text-ink-muted hover:text-ink"
                  title="Copy"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-ink-muted">Transaction Hash</p>
              <p className="font-mono text-xs truncate">{ownershipToken.hederaTxHash}</p>
            </div>

            <div>
              <p className="text-xs text-ink-muted">Status</p>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
                <span className="text-xs">Frozen (In Treasury)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-ink-muted">Transferable</p>
                <p className="font-medium">{ownershipToken.transferable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-ink-muted">Fractions</p>
                <p className="font-medium">{ownershipToken.fractions}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-ink-muted">Metadata</p>
              <a
                href={ownershipToken.metadataIpfs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 hover:underline truncate block"
              >
                View on IPFS →
              </a>
            </div>
          </div>

          <a
            href={ownershipToken.hashscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              View on Hedera Explorer →
            </Button>
          </a>

          {/* Future Feature Hint */}
          <div className="rounded bg-amber-100/50 p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">Coming Soon</p>
            </div>
            <p className="mt-1 text-xs text-amber-700">
              Connect your Hedera wallet to claim this token and enable transfers
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="rounded-lg border border-ink/10 bg-surface-secondary p-6">
        <h3 className="mb-4 font-brand text-lg uppercase tracking-[0.15em]">Order Details</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-ink-muted">Order Reference</p>
            <p className="font-mono text-sm">{order.reference}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Amount Paid</p>
            <p className="text-sm font-semibold">{formatPrice(order.amountCents, order.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Purchase Date</p>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Owner</p>
            <p className="text-sm">{owner.name}</p>
            <p className="text-xs text-ink-muted">{owner.email}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/">
          <Button variant="secondary">Back to Gallery</Button>
        </Link>
        <Link to={`/artworks/${artwork.id}`}>
          <Button variant="secondary">View Artwork</Button>
        </Link>
      </div>
    </div>
  );
}
