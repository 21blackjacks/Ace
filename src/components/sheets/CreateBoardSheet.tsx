import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

type CreateBoardSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardSheet({ open, onClose }: CreateBoardSheetProps) {
  const navigate = useNavigate();
  const createBoard = useAppStore((state) => state.createBoard);
  const [name, setName] = useState("");

  if (!open) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const boardName = name.trim();
    if (!boardName) return;
    const board = createBoard(boardName);
    setName("");
    onClose();
    navigate(`/saved/boards/${board.id}`);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[32px] border border-white/10 bg-[#08122A]/95 p-5 text-ace-text shadow-ace-glow backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Create board</h2>
          <p className="mt-1 text-sm text-ace-secondary">Name the collection now. You can add places anytime.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close create board" className="grid size-10 place-items-center rounded-full bg-white/10">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label htmlFor="create-board-name" className="text-sm font-bold text-ace-secondary">
          Board name
        </label>
        <input
          id="create-board-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Date Night Ideas"
          className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-base font-semibold outline-none placeholder:text-ace-secondary"
        />
        <button type="submit" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-ace-purple to-ace-cyan px-5 text-base font-bold text-white shadow-ace-glow">
          <Plus size={18} />
          Create Board
        </button>
      </form>
    </div>
  );
}
