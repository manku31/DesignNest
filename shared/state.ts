import { initialLight } from "../src/data/mockData";
import { collectionSchemas, type Action, type AppData } from "./schema";

// Apply individual operations to the latest state; one phone cannot overwrite
// another phone's unrelated changes with an out-of-date whole-document save.
export function applyAction(previous: AppData, action: Action): AppData {
  const state = structuredClone(previous);
  switch (action.type) {
    case "room.save": {
      const index = state.rooms.findIndex((room) => room.id === action.room.id);
      if (index < 0) state.rooms.push(action.room);
      else state.rooms[index] = action.room;
      break;
    }
    case "room.delete":
      state.rooms = state.rooms.filter((room) => room.id !== action.id);
      state.content.designs = state.content.designs.filter(
        (design) => design.roomId !== action.id,
      );
      state.favorites = state.favorites.filter(
        (id) =>
          id !== action.id &&
          (state.rooms.some((room) => room.id === id) ||
            state.content.designs.some((design) => design.id === id)),
      );
      delete state.lights[action.id];
      delete state.lights[`${action.id}-device-2`];
      delete state.directions[action.id];
      delete state.roomSettings[action.id];
      if (state.site.featuredRoomId === action.id)
        state.site.featuredRoomId = state.rooms[0]?.id ?? "";
      break;
    case "profile.update":
      state.user = { ...state.user, ...action.update };
      break;
    case "favorite.set":
      state.favorites = state.favorites.filter((id) => id !== action.id);
      if (action.saved) state.favorites.push(action.id);
      break;
    case "light.update":
      state.lights[action.id] = {
        ...(state.lights[action.id] ?? {
          ...initialLight,
          brightness: action.id.endsWith("-device-2") ? 42 : 64,
        }),
        ...action.update,
      };
      break;
    case "direction.set":
      state.directions[action.id] = action.value;
      break;
    case "roomSettings.update":
      state.roomSettings[action.id] = {
        ...(state.roomSettings[action.id] ?? {
          wallColor: state.content.wallColors[0].name,
          furniture: [],
          decor: state.content.decor[0].name,
        }),
        ...action.update,
      };
      break;
    case "preferences.update":
      state.preferences = { ...state.preferences, ...action.update };
      break;
    case "site.update":
      state.site = { ...state.site, ...action.update };
      break;
    case "image.set":
      state.images[action.key] = action.value;
      break;
    case "collection.save": {
      const item = collectionSchemas[action.collection].parse(action.item);
      const items = state.content[action.collection] as { id: string }[];
      const index = items.findIndex((entry) => entry.id === item.id);
      if (index < 0) items.push(item);
      else items[index] = item;
      break;
    }
    case "collection.delete": {
      const items = state.content[action.collection];
      const index = items.findIndex((item) => item.id === action.id);
      if (index >= 0) items.splice(index, 1);
      if (action.collection === "designs")
        state.favorites = state.favorites.filter((id) => id !== action.id);
      break;
    }
  }
  return state;
}
