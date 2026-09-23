export const stockImageSources = {
  living:
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1000&q=85",
  lounge:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85",
  bedroom:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=85",
  kitchen:
    "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=85",
  chair:
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",
  details:
    "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=85",
  dining:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=85",
  emma: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  oliver:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
  sophia:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80",
};

export const images = Object.fromEntries(
  Object.keys(stockImageSources).map((name) => [name, `/library/${name}.jpg`]),
) as Record<keyof typeof stockImageSources, string>;

export type RoomType = string;

export interface RoomPanorama {
  id: string;
  roomType: RoomType;
  image: string;
  title: string;
  description: string;
  yaw: number;
  pitch: number;
  hfov: number;
}

export const panoramas: RoomPanorama[] = [
  {
    id: "living-room",
    roomType: "Living Room",
    image: "/panoramas/living-room-panorama.png",
    title: "Warmth, in every direction.",
    description: "Soft bouclé, natural oak, and a warm evening glow.",
    yaw: 0,
    pitch: -3,
    hfov: 72,
  },
  {
    id: "bedroom",
    roomType: "Bedroom",
    image: "/panoramas/bedroom-panorama.png",
    title: "A quieter point of view.",
    description: "Layered linen, walnut details, and space to unwind.",
    yaw: 0,
    pitch: -3,
    hfov: 72,
  },
  {
    id: "kitchen",
    roomType: "Kitchen",
    image: "/panoramas/kitchen-panorama.png",
    title: "Every angle, considered.",
    description: "Travertine, warm walnut, and everyday rituals.",
    yaw: 0,
    pitch: -3,
    hfov: 72,
  },
];

export const tourSpeeds = [
  { label: "1×", degreesPerSecond: 8 },
  { label: "1.5×", degreesPerSecond: 12 },
  { label: "2×", degreesPerSecond: 16 },
];

export function panoramaForRoom(type: RoomType) {
  return panoramas.find((panorama) => panorama.roomType === type)!;
}

export interface Room {
  id: string;
  name: string;
  title: string;
  type: RoomType;
  image: string;
  status: "In Progress" | "Completed";
  description: string;
  panorama?: string;
  gallery?: string[];
  yaw?: number;
  pitch?: number;
  hfov?: number;
}

export const rooms: Room[] = [
  {
    id: "living-room",
    name: "Living Room",
    title: "Modern Living Room",
    type: "Living Room",
    image: images.living,
    status: "In Progress",
    description: "Warm textures. Quiet moments.",
  },
  {
    id: "bedroom",
    name: "Bedroom",
    title: "Luxury Bedroom",
    type: "Bedroom",
    image: images.bedroom,
    status: "Completed",
    description: "Your own peaceful retreat.",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    title: "Minimalist Kitchen",
    type: "Kitchen",
    image: images.kitchen,
    status: "In Progress",
    description: "Made for everyday rituals.",
  },
];

export const members = [
  { name: "Emma Johnson", image: images.emma },
  { name: "Oliver Chen", image: images.oliver },
  { name: "Sophia Miller", image: images.sophia },
];

export const profile = {
  name: "Emma Johnson",
  email: "emma.johnson@email.com",
  location: "San Francisco, CA",
  avatar: images.emma,
  projects: 12,
  saved: 48,
  rooms: 5,
};

export const onboardingSlides = [
  {
    image: images.living,
    label: "THE ART OF FEELING AT HOME",
    caption: "Warm minimalism",
    detail: "A softer way to live",
    alt: "Warm modern living room with a sculptural pendant, textured sofa, and natural wood",
  },
  {
    image: images.bedroom,
    label: "YOUR EVERYDAY SANCTUARY",
    caption: "Quiet luxury",
    detail: "Room to slow down",
    alt: "Softly lit bedroom with neutral textiles and warm bedside lighting",
  },
  {
    image: images.lounge,
    label: "THOUGHTFULLY, UNIQUELY YOU",
    caption: "Natural harmony",
    detail: "Designed around your life",
    alt: "Airy contemporary interior with warm wood and natural light",
  },
];

export const lightingPresets = [
  {
    id: "warm",
    name: "Warm",
    subtitle: "Cozy & Relaxing",
    temperature: "2700K",
    brightness: 64,
    tint: "#F5A55A",
  },
  {
    id: "natural",
    name: "Natural",
    subtitle: "Balanced",
    temperature: "4000K",
    brightness: 80,
    tint: "#F5E5C5",
  },
  {
    id: "bright",
    name: "Bright White",
    subtitle: "Focused",
    temperature: "6000K",
    brightness: 100,
    tint: "#E7F0FF",
  },
];

export const lightColors = [
  { name: "Soft white", value: "#FFF8EA" },
  { name: "Ocean blue", value: "#BCE8EC" },
  { name: "Warm amber", value: "#F2D585" },
  { name: "Rose pink", value: "#E89FAF" },
  { name: "Lavender", value: "#B49BE0" },
];

export const wallColors = [
  { name: "Warm linen", value: "#C8B08A" },
  { name: "Soft stone", value: "#B0ABA0" },
  { name: "Sage green", value: "#858B71" },
  { name: "Terracotta", value: "#B17B62" },
  { name: "Deep charcoal", value: "#494641" },
];

export const savedDesigns = [
  {
    id: "living-room",
    title: "Warm minimalism",
    category: "Living Room",
    image: images.living,
    roomId: "living-room",
    tag: "WARM & INVITING",
  },
  {
    id: "bedroom",
    title: "A quiet retreat",
    category: "Bedroom",
    image: images.bedroom,
    roomId: "bedroom",
    tag: "REST & RESTORE",
  },
  {
    id: "natural-living",
    title: "Natural harmony",
    category: "Living Room",
    image: images.lounge,
    roomId: "living-room",
    tag: "NATURALLY YOU",
  },
  {
    id: "kitchen",
    title: "Everyday elegance",
    category: "Kitchen",
    image: images.kitchen,
    roomId: "kitchen",
    tag: "LESS, BUT BETTER",
  },
  {
    id: "dining",
    title: "Gather together",
    category: "Living Room",
    image: images.dining,
    roomId: "living-room",
    tag: "MAKE MEMORIES",
  },
  {
    id: "details",
    title: "Considered details",
    category: "Living Room",
    image: images.details,
    roomId: "living-room",
    tag: "SMALL PLEASURES",
  },
];

export const furnishings = [
  {
    id: "chair",
    name: "The accent chair",
    material: "Bouclé · Warm ivory",
    image: images.chair,
  },
  {
    id: "pendant",
    name: "Sculptural lighting",
    material: "Brass · Soft amber",
    image: images.lamp,
  },
];

export const notifications = [
  {
    title: "Your space is taking shape",
    text: "Sophia added a new mood board to Modern Living Room.",
    time: "12 min ago",
  },
  {
    title: "A little inspiration for you",
    text: "Explore our new collection of warm, natural interiors.",
    time: "2 hours ago",
  },
];

export const initialLight = {
  brightness: 64,
  color: "Warm amber",
  power: true,
  preset: "warm",
  from: "18:00",
  until: "23:00",
};
