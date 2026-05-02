import { ACCENT } from "@/app/constants/colors";

export interface Winner {
  id: string
  name: string
  imageUrl: string
}

interface IWinnerList {
  winners: Winner[]
  onAddWinner: () => void
  onRemoveWinner: (index: number) => void
  onMoveWinner: (index: number, direction: 'up' | 'down') => void
  onChangeWinner: (index: number, patch: Partial<Pick<Winner, 'name' | 'imageUrl'>>) => void
}

function WinnerField({ name, onRemove, onMoveUp, onMoveDown, onChangeName, onChangeImage }: Winner & {
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onChangeName: (v: string) => void
  onChangeImage: (url: string) => void
}) {
  const btnClass = `cursor-pointer text-xs font-bold uppercase border border-solid border-[${ACCENT}] text-[${ACCENT}] px-2 py-1 hover:bg-[${ACCENT}] hover:text-black transition-colors`

  return <div className={`flex flex-col gap-2 border border-solid border-[${ACCENT}] py-2 pl-2 pr-2`}>
    <div className="flex items-center gap-2">
      <span className={`text-sm w-12 shrink-0 text-[${ACCENT}] border-l-4 border-double border-[${ACCENT}] pl-1`}>Name</span>
      <input value={name} onChange={(e) => onChangeName(e.target.value)} className={`flex-1 min-w-0 border border-solid border-[${ACCENT}] outline-none pl-2 bg-black text-white`} />
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm w-12 shrink-0 text-[${ACCENT}] border-l-4 border-double border-[${ACCENT}] pl-1`}>Image</span>
      <label className={`flex-1 text-center cursor-pointer text-xs font-bold uppercase border border-solid border-[${ACCENT}] text-[${ACCENT}] px-2 py-1 hover:bg-[${ACCENT}] hover:text-black transition-colors`}>
        Upload file
        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChangeImage(URL.createObjectURL(file))
        }} />
      </label>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm w-12 shrink-0" />
      <button type="button" onClick={onRemove} className={`flex-1 text-center ${btnClass}`}>Remove</button>
      <button type="button" onClick={onMoveUp} className={btnClass}>↑</button>
      <button type="button" onClick={onMoveDown} className={btnClass}>↓</button>
    </div>
  </div>;
}

export function WinnerList({ winners, onAddWinner, onRemoveWinner, onMoveWinner, onChangeWinner }: IWinnerList) {
  const winnersComponents = winners.map((winner, i) => {
    return <WinnerField
      key={winner.id}
      id={winner.id}
      name={winner.name}
      imageUrl={winner.imageUrl}
      onRemove={() => onRemoveWinner(i)}
      onMoveUp={() => onMoveWinner(i, 'up')}
      onMoveDown={() => onMoveWinner(i, 'down')}
      onChangeName={(v) => onChangeWinner(i, { name: v })}
      onChangeImage={(url) => onChangeWinner(i, { imageUrl: url })}
    />
  })

  return <div className="flex flex-col gap-2">
    <button
      type="button"
      className={`border-2 border-[${ACCENT}] px-3 py-2 text-xs font-bold uppercase text-[${ACCENT}] hover:bg-[${ACCENT}] hover:text-black transition-colors cursor-pointer`}
      onClick={onAddWinner}
    >
      Add Winner
    </button>
    {winnersComponents}
  </div>
}
