# Frontend Integration Guide: Dual Certificates

## 🎨 UI Updates Needed

### 1. Order Confirmation / Certificate Page

**Current**: Shows single authenticity token
**New**: Show BOTH tokens with clear distinction

#### Component Structure
```tsx
interface CertificateData {
  ownershipToken: {
    hederaTokenId: string;
    hederaTxHash: string;
    metadataIpfs: string;
    transferable: boolean;
    fractions: number;
    hashscanUrl: string;
  };
  authenticityToken: {
    hederaTokenId: string;
    hederaTxHash: string;
    metadataIpfs: string;
    hashscanUrl: string;
  };
  artwork: {
    id: string;
    title: string;
    mediaUrl: string;
    // ... other fields
  };
  order: {
    id: string;
    reference: string;
    amountCents: number;
    currency: string;
  };
  owner: {
    name: string;
    email: string;
  };
}
```

#### API Call
```typescript
// Fetch dual certificate data
async function getCertificate(orderId: string): Promise<CertificateData> {
  const response = await api.get(`/ownership/order/${orderId}`);
  return response.data;
}
```

#### UI Layout Suggestion

```tsx
<CertificatePage>
  <ArtworkPreview artwork={data.artwork} />
  
  <CertificateSection>
    <h2>Your Certificates</h2>
    
    {/* Authenticity Certificate */}
    <CertificateCard type="authenticity">
      <Badge>Proof of Origin</Badge>
      <h3>Authenticity Certificate</h3>
      <p>Non-transferable proof this artwork is genuine</p>
      
      <InfoGrid>
        <InfoItem label="Token ID" value={data.authenticityToken.hederaTokenId} />
        <InfoItem label="Transaction" value={data.authenticityToken.hederaTxHash} />
        <InfoItem label="Metadata" value={data.authenticityToken.metadataIpfs} />
      </InfoGrid>
      
      <Button href={data.authenticityToken.hashscanUrl} external>
        View on Hedera Explorer
      </Button>
    </CertificateCard>
    
    {/* Ownership Certificate */}
    <CertificateCard type="ownership" highlight>
      <Badge>Asset Ownership</Badge>
      <h3>Ownership Certificate</h3>
      <p>Transferable token representing legal ownership rights</p>
      
      <InfoGrid>
        <InfoItem label="Token ID" value={data.ownershipToken.hederaTokenId} />
        <InfoItem label="Transaction" value={data.ownershipToken.hederaTxHash} />
        <InfoItem label="Transferable" value={data.ownershipToken.transferable ? "Yes" : "No"} />
        <InfoItem label="Status" value="Frozen (In Treasury)" />
      </InfoGrid>
      
      <Button href={data.ownershipToken.hashscanUrl} external>
        View on Hedera Explorer
      </Button>
      
      {/* Future feature hint */}
      <FutureFeature>
        <Icon name="wallet" />
        <p>Soon: Connect your Hedera wallet to claim this token</p>
      </FutureFeature>
    </CertificateCard>
  </CertificateSection>
  
  <OrderDetails order={data.order} />
</CertificatePage>
```

### 2. Artist Dashboard

Show ownership status for sold artworks:

```tsx
<ArtworkRow>
  <ArtworkImage src={artwork.mediaUrl} />
  <ArtworkInfo>
    <h3>{artwork.title}</h3>
    <Status>Sold to {order.buyer.name}</Status>
  </ArtworkInfo>
  <TokenStatus>
    <StatusBadge status="minted">✓ Authenticity</StatusBadge>
    <StatusBadge status="minted">✓ Ownership</StatusBadge>
  </TokenStatus>
  <Button onClick={() => viewCertificates(artwork.id)}>
    View Certificates
  </Button>
</ArtworkRow>
```

### 3. Admin Panel

For handling failed mints:

```tsx
interface FailedOrder {
  id: string;
  reference: string;
  orderStatus: 'mint_failed' | 'ownership_mint_failed';
  artwork: { title: string };
  buyer: { name: string };
}

function AdminMintFailures() {
  const [failedOrders, setFailedOrders] = useState<FailedOrder[]>([]);
  
  const retryMint = async (orderId: string) => {
    await api.post('/ownership/admin/re-mint', { orderId });
    toast.success('Ownership token re-minted successfully');
    // Refresh list
  };
  
  return (
    <Table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Artwork</th>
          <th>Buyer</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {failedOrders.map(order => (
          <tr key={order.id}>
            <td>{order.reference}</td>
            <td>{order.artwork.title}</td>
            <td>{order.buyer.name}</td>
            <td>
              <Badge color={
                order.orderStatus === 'mint_failed' ? 'red' : 'orange'
              }>
                {order.orderStatus === 'mint_failed' 
                  ? 'Authenticity Failed' 
                  : 'Ownership Failed'}
              </Badge>
            </td>
            <td>
              {order.orderStatus === 'ownership_mint_failed' && (
                <Button onClick={() => retryMint(order.id)}>
                  Retry Ownership Mint
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
```

## 🎨 Design Suggestions

### Visual Hierarchy

**Authenticity Certificate** (subtle)
- Muted background (gray/blue)
- Icon: Shield or checkmark
- Emphasis: "Verified Origin"

**Ownership Certificate** (prominent)
- Gradient or bold background
- Icon: Crown, key, or deed
- Emphasis: "Your Asset"

### Mobile Responsive
```tsx
<ResponsiveStack>
  {/* Mobile: Stack vertically */}
  <CertificateCard />
  <CertificateCard />
  
  {/* Desktop: Side by side */}
</ResponsiveStack>
```

## 🔗 Example API Integration

```typescript
// src/services/certificates.ts

export interface Certificate {
  ownershipToken: OwnershipToken;
  authenticityToken: AuthenticityToken;
  artwork: Artwork;
  order: Order;
  owner: Owner;
}

export const certificatesApi = {
  getByOrder: async (orderId: string): Promise<Certificate> => {
    const response = await httpClient.get(`/ownership/order/${orderId}`);
    return response.data;
  },
  
  getByArtwork: async (artworkId: string): Promise<Certificate> => {
    const response = await httpClient.get(`/ownership/artwork/${artworkId}`);
    return response.data;
  },
  
  // Admin only
  retryMint: async (orderId: string): Promise<void> => {
    await httpClient.post('/ownership/admin/re-mint', { orderId });
  }
};
```

## 📱 Routes to Add/Update

```typescript
// In your router
{
  path: '/certificate/:orderId',
  element: <CertificatePage />,
  loader: async ({ params }) => {
    return certificatesApi.getByOrder(params.orderId);
  }
}

{
  path: '/admin/mint-failures',
  element: <AdminMintFailures />,
  guard: AdminGuard
}
```

## ✅ Checklist

Frontend updates:

- [ ] Update certificate page to show both tokens
- [ ] Add distinct visual styling for each certificate type
- [ ] Show "frozen in treasury" status for ownership token
- [ ] Add Hashscan explorer links for both tokens
- [ ] Update artist dashboard to show dual token status
- [ ] Create admin panel for failed mints
- [ ] Add "Coming Soon: Claim to Wallet" UI hint
- [ ] Test responsive layout on mobile
- [ ] Add loading states for API calls
- [ ] Handle error states gracefully

## 🎯 Priority Order

1. **High**: Update post-purchase certificate page (buyer sees both)
2. **Medium**: Artist dashboard updates (show status)
3. **Low**: Admin panel (manual intervention only)

---

**Note**: Ownership tokens are currently frozen in treasury. The "transfer to wallet" feature will be a future enhancement. For MVP, focus on displaying both certificates clearly!
