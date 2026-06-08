import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by 8xSentinel. The definitive trust infrastructure for the account trading ecosystem.
        </p>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
