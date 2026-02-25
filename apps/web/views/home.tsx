const Home = () => {
	return (
		<section className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
			<div className="flex flex-col items-center gap-3">
				<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Open Source Analytics
				</span>
				<h1 className="text-5xl font-bold tracking-tight">Traytic</h1>
				<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
					Privacy-first, real-time analytics for developers. A self-hostable alternative to Vercel
					Analytics and Cloudflare Analytics.
				</p>
			</div>

			<div className="flex items-center gap-3 text-xs text-muted-foreground">
				<span className="rounded-full border border-border px-3 py-1">Dashboard — coming soon</span>
			</div>
		</section>
	);
};

export default Home;
