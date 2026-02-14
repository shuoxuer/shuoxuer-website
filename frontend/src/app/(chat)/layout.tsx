export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {children}
    </div>
  );
}
