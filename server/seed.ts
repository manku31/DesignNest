import * as mock from "../src/data/mockData";
import { stateSchema } from "../shared/schema";

export function createSeed() {
  return stateSchema.parse({
    version: 1,
    revision: 0,
    rooms: mock.rooms.map((room) => ({
      ...room,
      panorama: mock.panoramaForRoom(room.type)?.image ?? "",
      gallery: [],
    })),
    user: mock.profile,
    favorites: mock.savedDesigns.map((design) => design.id),
    lights: {
      "living-room": mock.initialLight,
      "living-room-device-2": { ...mock.initialLight, brightness: 42 },
    },
    directions: {},
    roomSettings: {},
    preferences: {
      style: "Warm minimalism",
      projects: true,
      inspiration: true,
      reminders: false,
      notificationsRead: false,
    },
    site: {
      brand: "DesignNest",
      tagline: "INTERIORS",
      welcomeHeading: "Beautiful Spaces,",
      welcomeEmphasis: "Thoughtfully Designed.",
      welcomeDescription:
        "Transform your house into a home with personalized interior design.",
      moodName: "Warm Neutral",
      moodSubtitle: "Your everyday calm",
      featuredRoomId: "living-room",
    },
    images: mock.images,
    content: {
      onboardingSlides: mock.onboardingSlides.map((slide, index) => ({
        ...slide,
        id: `slide-${index + 1}`,
      })),
      designs: mock.savedDesigns,
      furnishings: mock.furnishings,
      lightingPresets: mock.lightingPresets,
      decor: [
        {
          id: "natural",
          name: "Natural textures",
          description: "A considered finishing touch",
          image: mock.images.details,
        },
        {
          id: "sculptural",
          name: "Sculptural accents",
          description: "Objects with a little character",
          image: mock.images.dining,
        },
      ],
      wallColors: mock.wallColors.map((item, index) => ({
        ...item,
        id: `wall-${index}`,
      })),
      lightColors: mock.lightColors.map((item, index) => ({
        ...item,
        id: `light-${index}`,
      })),
      members: mock.members.map((item, index) => ({
        ...item,
        id: `member-${index}`,
      })),
      notifications: mock.notifications.map((item, index) => ({
        ...item,
        id: `notification-${index}`,
      })),
    },
  });
}
