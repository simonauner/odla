import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { useGarden } from "@/lib/garden";

export function SetupPage() {
  const [garden, setGarden] = useGarden();
  const navigate = useNavigate();
  const zones = useQuery({ queryKey: ["zones"], queryFn: api.zones });
  const crops = useQuery({ queryKey: ["crops"], queryFn: api.crops });

  const toggleCrop = (id: string) =>
    setGarden((g) => ({ ...g, crops: g.crops.includes(id) ? g.crops.filter((c) => c !== id) : [...g.crops, id] }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-lg font-semibold">Var odlar du?</h2>
        <p className="mb-3 text-sm text-stone-500">Välj odlingszon. Karta och förslag utifrån din position kommer senare.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {zones.data?.map((z) => (
            <label key={z.zone} className="flex cursor-pointer gap-3 rounded-lg border border-stone-200 p-3 has-checked:border-leaf-600 has-checked:bg-leaf-50 dark:border-stone-800 dark:has-checked:bg-stone-900">
              <input type="radio" name="zone" checked={garden.zone === z.zone} onChange={() => setGarden((g) => ({ ...g, zone: z.zone }))} />
              <span>
                <span className="font-medium">{z.label}</span>
                <span className="block text-xs text-stone-500">{z.examples}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Vad vill du odla {garden.year}?</h2>
        <div className="flex flex-wrap gap-2">
          {crops.data?.map((c) => {
            const outsideZone = garden.zone !== null && (garden.zone < c.zones.min || garden.zone > c.zones.max);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCrop(c.id)}
                aria-pressed={garden.crops.includes(c.id)}
                className="rounded-full border border-stone-300 px-4 py-1.5 aria-pressed:border-leaf-600 aria-pressed:bg-leaf-600 aria-pressed:text-white dark:border-stone-700"
                title={outsideZone ? "Svårt i din zon utan växthus" : undefined}
              >
                {c.name}
                {outsideZone && " ⚠︎"}
              </button>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        disabled={garden.zone === null || garden.crops.length === 0}
        onClick={() => navigate({ to: "/" })}
        className="rounded-lg bg-leaf-600 px-5 py-2 font-medium text-white disabled:opacity-40"
      >
        Visa min plan
      </button>
    </div>
  );
}
