export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-transparent px-3 py-1 text-lg leading-[1.375rem] font-semibold text-current ring-2 ring-inset ring-current">
      {children}
    </span>
  );
}
