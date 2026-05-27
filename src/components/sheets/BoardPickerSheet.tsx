import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { PlaceImage } from "../places/PlaceImage";

type BoardPickerSheetProps = {
  open: boolean;
  placeIds: string[];
  sourceBoardId?: string;
  moveMode?: boolean;
  onClose: () => void;
};

export function BoardPickerSheet({ open, placeIds, sourceBoardId, moveMode = false, onClose }: BoardPickerSheetProps) {
  const boards = useAppStore((state) => state.boards);
  const places = useAppStore((state) => state.places);
  const addPlaceToBoard = useAppStore((state) => state.addPlaceToBoard);
  const movePlaceBetweenBoards = useAppStore((state) => state.movePlaceBetweenBoards);
  const createBoard = useAppStore((state) => state.createBoard);
  const [newBoardName, setNewBoardName] = useState("");

  if (!open) return null;

  const addToBoard = (boardId: string) => {
    placeIds.forEach((placeId) => {
      if (moveMode && sourceBoardId && sourceBoardId !== boardId) {
        movePlaceBetweenBoards(placeId, sourceBoardId, boardId);
        return;
      }
      addPlaceToBoard(placeId, boardId);
    });
    onClose();
  };

  const submitNewBoard = (event: FormEvent) => {
    event.preventDefault();
    const name = newBoardName.trim();
    if (!name) return;
    const board = createBoard(name);
    placeIds.forEach((placeId) => addPlaceToBoard(placeId, board.id));
    setNewBoardName("");
    onClose();
  };

  const placeById = new Map(places.map((place) => [place.id, place]));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#08122A]/95 p-5 text-ace-text shadow-ace-glow backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{moveMode ? "Move to board" : "Add to board"}</h2>
          <p className="mt-1 text-sm text-ace-secondary">Saved Places stays updated automatically.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close board picker" className="grid size-10 place-items-center rounded-full bg-white/10">
          <X size={20} />
        </button>
      </header>

      <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
        {boards.map((board) => {
          const coverPlace = board.placeIds.map((id) => placeById.get(id)).find((place): place is (typeof places)[number] => Boolean(place));

          return (
            <button
              type="button"
              key={board.id}
              onClick={() => addToBoard(board.id)}
              className="flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] p-3 text-left"
            >
              {coverPlace ? (
                <PlaceImage
                  place={coverPlace}
                  alt={`${board.name} cover`}
                  wrapperClassName="block size-12 overflow-hidden rounded-2xl"
                  imageClassName="size-full object-cover"
                  attributionClassName="absolute bottom-0 right-0 max-w-full truncate rounded-tl bg-black/60 px-1 text-[7px] font-bold text-white/80"
                  maxWidthPx={300}
                />
              ) : (
                <div className="size-12 rounded-2xl bg-white/10" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{board.name}</span>
                <span className="text-sm font-semibold text-ace-secondary">{board.placeIds.length} places</span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submitNewBoard} className="mt-5 flex gap-3">
        <label className="sr-only" htmlFor="new-board-name">
          New board name
        </label>
        <input
          id="new-board-name"
          value={newBoardName}
          onChange={(event) => setNewBoardName(event.target.value)}
          placeholder="New board name"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold outline-none placeholder:text-ace-secondary"
        />
        <button type="submit" className="grid min-h-12 w-14 place-items-center rounded-2xl bg-gradient-to-r from-ace-purple to-ace-cyan text-white">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
