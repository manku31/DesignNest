import { z } from "zod";

const text = z.string().trim().max(500);
const name = z.string().trim().min(1).max(100);
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const imageSchema = z
  .string()
  .max(2000)
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\//.test(value) ||
      /^\/(uploads|panoramas|library)\/[a-zA-Z0-9_.-]+$/.test(value),
    "Choose an uploaded image or an http(s) image URL.",
  );
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const swatch = z.object({ id: idSchema, name, value: color });
export const roomSchema = z.object({
  id: idSchema,
  name,
  title: name,
  type: name,
  image: imageSchema,
  status: z.enum(["In Progress", "Completed"]),
  description: text,
  panorama: imageSchema.optional(),
  gallery: z.array(imageSchema).max(20).optional(),
  yaw: z.number().min(-180).max(180).optional(),
  pitch: z.number().min(-85).max(85).optional(),
  hfov: z.number().min(40).max(95).optional(),
});
export const lightSchema = z.object({
  brightness: z.number().int().min(0).max(100),
  color: name,
  power: z.boolean(),
  preset: idSchema,
  from: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  until: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
export const profileSchema = z.object({
  name,
  email: z.string().email().max(254),
  location: text,
  avatar: imageSchema,
});
export const preferencesSchema = z.object({
  style: name,
  projects: z.boolean(),
  inspiration: z.boolean(),
  reminders: z.boolean(),
  notificationsRead: z.boolean(),
});
export const roomSettingsSchema = z.object({
  wallColor: z.string().max(100),
  furniture: z.array(idSchema).max(100),
  decor: z.string().max(100),
});
export const siteSchema = z.object({
  brand: name,
  tagline: name,
  welcomeHeading: name,
  welcomeEmphasis: name,
  welcomeDescription: text,
  moodName: name,
  moodSubtitle: text,
  featuredRoomId: z.string().max(100),
});
export const collectionSchemas = {
  onboardingSlides: z.object({
    id: idSchema,
    image: imageSchema,
    label: name,
    caption: name,
    detail: text,
    alt: text,
  }),
  designs: z.object({
    id: idSchema,
    title: name,
    category: name,
    image: imageSchema,
    roomId: z.string().max(100),
    tag: text,
  }),
  furnishings: z.object({
    id: idSchema,
    name,
    material: text,
    image: imageSchema,
  }),
  decor: z.object({
    id: idSchema,
    name,
    description: text,
    image: imageSchema,
  }),
  lightingPresets: z.object({
    id: idSchema,
    name,
    subtitle: text,
    temperature: name,
    brightness: z.number().int().min(0).max(100),
    tint: color,
  }),
  wallColors: swatch,
  lightColors: swatch,
  members: z.object({ id: idSchema, name, image: imageSchema }),
  notifications: z.object({ id: idSchema, title: name, text, time: text }),
};
export const contentSchema = z.object({
  onboardingSlides: z.array(collectionSchemas.onboardingSlides).min(1).max(20),
  designs: z.array(collectionSchemas.designs).max(200),
  furnishings: z.array(collectionSchemas.furnishings).max(100),
  decor: z.array(collectionSchemas.decor).min(1).max(100),
  lightingPresets: z.array(collectionSchemas.lightingPresets).min(1).max(30),
  wallColors: z.array(swatch).min(1).max(30),
  lightColors: z.array(swatch).min(1).max(30),
  members: z.array(collectionSchemas.members).max(30),
  notifications: z.array(collectionSchemas.notifications).max(100),
});
export const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().min(0),
  rooms: z.array(roomSchema).max(200),
  user: profileSchema,
  favorites: z.array(idSchema).max(500),
  lights: z.record(idSchema, lightSchema),
  directions: z.record(idSchema, name),
  roomSettings: z.record(idSchema, roomSettingsSchema),
  preferences: preferencesSchema,
  site: siteSchema,
  content: contentSchema,
  images: z.record(z.string(), imageSchema),
});
const collectionName = z.enum([
  "onboardingSlides",
  "designs",
  "furnishings",
  "decor",
  "lightingPresets",
  "wallColors",
  "lightColors",
  "members",
  "notifications",
]);
export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("room.save"), room: roomSchema }),
  z.object({ type: z.literal("room.delete"), id: idSchema }),
  z.object({
    type: z.literal("profile.update"),
    update: profileSchema.partial(),
  }),
  z.object({
    type: z.literal("favorite.set"),
    id: idSchema,
    saved: z.boolean(),
  }),
  z.object({
    type: z.literal("light.update"),
    id: idSchema,
    update: lightSchema.partial(),
  }),
  z.object({ type: z.literal("direction.set"), id: idSchema, value: name }),
  z.object({
    type: z.literal("roomSettings.update"),
    id: idSchema,
    update: roomSettingsSchema.partial(),
  }),
  z.object({
    type: z.literal("preferences.update"),
    update: preferencesSchema.partial(),
  }),
  z.object({ type: z.literal("site.update"), update: siteSchema.partial() }),
  z.object({
    type: z.literal("image.set"),
    key: z.string().min(1).max(100),
    value: imageSchema,
  }),
  z.object({
    type: z.literal("collection.save"),
    collection: collectionName,
    item: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal("collection.delete"),
    collection: collectionName,
    id: idSchema,
  }),
]);
export type AppData = z.infer<typeof stateSchema>;
export type Action = z.infer<typeof actionSchema>;
export type CollectionName = keyof typeof collectionSchemas;
