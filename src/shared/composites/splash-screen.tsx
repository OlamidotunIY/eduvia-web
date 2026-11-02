export function SplashScreen({ message = 'Loading Eduvia…' }: { message?: string }) {
  return <main className="grid min-h-svh place-items-center bg-background p-6 text-sm text-muted-foreground">{message}</main>
}
