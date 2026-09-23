import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import Chip from "../components/Chip";
import IconButton from "../components/IconButton";
import Image from "../components/Image";
import Modal from "../components/Modal";

export default function Favorites() {
  const {
    favorites,
    toggleFavorite,
    rooms,
    content: { designs: savedDesigns },
  } = useApp();
  const [params, setParams] = useSearchParams();
  const discover = params.get("view") === "discover";
  const [filter, setFilter] = useState("All spaces");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const customRooms = rooms
    .filter((room) => !savedDesigns.some((design) => design.id === room.id))
    .map((room) => ({
      id: room.id,
      title: room.name,
      category: room.type,
      image: room.image,
      roomId: room.id,
      tag: "YOUR OWN CREATION",
    }));
  const designs = [
    ...savedDesigns.map((design) => {
      const room = rooms.find((room) => room.id === design.id);
      return room
        ? { ...design, image: room.image, category: room.type }
        : design;
    }),
    ...customRooms,
  ];
  const visible = designs.filter(
    (design) =>
      (discover || favorites.includes(design.id)) &&
      (filter === "All spaces" || design.category === filter) &&
      `${design.title} ${design.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selectedDesign = designs.find((design) => design.id === selected);
  return (
    <main className="page collection-page favorites-page page-enter">
      <header className="simple-header">
        <Link to="/home" className="icon-button" aria-label="Back to home">
          <ArrowLeft size={20} />
        </Link>
        <span>COLLECT WHAT MOVES YOU</span>
        <IconButton
          label={searchOpen ? "Close design search" : "Search designs"}
          onClick={() => {
            setSearchOpen(!searchOpen);
            setSearch("");
          }}
        >
          {searchOpen ? <X size={19} /> : <Search size={19} />}
        </IconButton>
      </header>
      <div className="collection-intro">
        <p className="eyebrow">
          <span />A LITTLE INSPIRATION, ALWAYS
        </p>
        <h1>
          {discover ? (
            <>
              Find your feeling<span>.</span>
            </>
          ) : (
            <>
              Your kind of beautiful<span>.</span>
            </>
          )}
        </h1>
        <p>
          {discover
            ? "Considered spaces. Endless possibilities."
            : "The spaces you love, all in one place."}
        </p>
      </div>
      <div className="collection-view-tabs">
        <button
          onClick={() => setParams({})}
          className={!discover ? "selected" : ""}
        >
          <Heart size={15} />
          Saved collection
        </button>
        <button
          onClick={() => setParams({ view: "discover" })}
          className={discover ? "selected" : ""}
        >
          <Sparkles size={15} />
          Discover
        </button>
      </div>
      {searchOpen && (
        <label className="search-field">
          <Search size={18} />
          <input
            autoFocus
            aria-label="Search saved designs"
            placeholder="A space, a style, a feeling…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      )}
      <div className="filter-row no-scrollbar snap-x">
        {[
          "All spaces",
          ...new Set(designs.map((design) => design.category)),
        ].map((item) => (
          <Chip
            key={item}
            active={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </Chip>
        ))}
      </div>
      <div className="collection-count">
        <span>
          {visible.length}{" "}
          {visible.length === 1 ? "inspiration" : "inspirations"}
        </span>
        <span>CURATED BY {discover ? "DESIGNNEST" : "YOU"}</span>
      </div>
      <div className="favorites-grid">
        {visible.map((design) => (
          <article className="favorite-card" key={design.id}>
            <div className="favorite-photo">
              <button
                className="favorite-open"
                aria-label={`View ${design.title}`}
                onClick={() => setSelected(design.id)}
              >
                <Image
                  src={design.image}
                  alt={`${design.title}, a ${design.category.toLowerCase()} design`}
                />
              </button>
              <IconButton
                label={
                  favorites.includes(design.id)
                    ? `Unsave ${design.title}`
                    : `Save ${design.title}`
                }
                aria-pressed={favorites.includes(design.id)}
                className={`favorite-heart ${favorites.includes(design.id) ? "is-saved" : ""}`}
                onClick={() => toggleFavorite(design.id)}
              >
                <Heart
                  size={16}
                  fill={favorites.includes(design.id) ? "currentColor" : "none"}
                />
              </IconButton>
              <span className="favorite-category">{design.category}</span>
            </div>
            <div className="favorite-caption">
              <h2>{design.title}</h2>
              <span>{design.tag}</span>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Heart size={32} strokeWidth={1.2} />
          <h2>{search ? "Nothing here just yet" : "Room for inspiration"}</h2>
          <p>
            {search
              ? "Try a different search or room type."
              : "Save the spaces that make you feel at home."}
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setSearch("");
              setFilter("All spaces");
              setParams({ view: "discover" });
            }}
          >
            Explore design ideas
            <ArrowUpRight size={18} />
          </button>
        </div>
      )}
      <p className="page-signoff">GOOD DESIGN STARTS WITH A FEELING.</p>
      {selectedDesign && (
        <Modal title={selectedDesign.title} onClose={() => setSelected(null)}>
          <Image
            className="inspiration-detail"
            src={selectedDesign.image}
            alt={selectedDesign.title}
          />
          <p className="eyebrow mt-5">{selectedDesign.tag}</p>
          <p className="modal-description">
            Natural textures, considered details, and a little room to breathe.
            Make this feeling your own.
          </p>
          <button
            className="primary-button"
            onClick={() => toggleFavorite(selectedDesign.id)}
          >
            <Heart
              size={17}
              fill={
                favorites.includes(selectedDesign.id) ? "currentColor" : "none"
              }
            />
            {favorites.includes(selectedDesign.id)
              ? "Saved to your collection"
              : "Save to your collection"}
          </button>
          {rooms.some((room) => room.id === selectedDesign.roomId) && (
            <Link
              className="secondary-button"
              to={`/room/${selectedDesign.roomId}`}
            >
              Explore this space
              <ArrowUpRight size={17} />
            </Link>
          )}
        </Modal>
      )}
    </main>
  );
}
