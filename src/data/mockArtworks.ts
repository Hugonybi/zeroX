export interface MockArtwork {
  id: string;
  title: string;
  artist: string;
  price: string;
  imageUrl?: string;
}

export const mockArtworks: MockArtwork[] = [
  {
    id: "art-001",
    title: "Digital Dreamscape 01",
    artist: "Lina Okafor",
    price: "₦950,000",
  },
  {
    id: "art-002",
    title: "Echoes of Lagos",
    artist: "Tunde Babs",
    price: "₦1,200,000",
  },
  {
    id: "art-003",
    title: "Chromatic Memory",
    artist: "Ada Ehi",
    price: "₦780,000",
  },
  {
    id: "art-004",
    title: "Neon River Study",
    artist: "Ifeanyi Udo",
    price: "₦1,450,000",
  },
];
