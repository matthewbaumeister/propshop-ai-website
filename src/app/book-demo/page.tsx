import Link from 'next/link'

export default function BookDemoPage() {
	return (
		<div className="min-h-screen bg-[#0B1220] text-white">
			<div className="container mx-auto px-4 py-24 flex items-center justify-center">
				<div className="max-w-2xl text-center">
					<h1 className="text-5xl font-extrabold tracking-tight mb-4">Book a Demo</h1>
					<p className="text-lg text-gray-300 mb-8">
						This page is coming soon. We&apos;re polishing the experience to make scheduling effortless.
					</p>
					<Link href="/" className="inline-flex items-center gap-2 bg-[#2D5BFF] hover:bg-[#1e4bd8] text-white font-semibold px-6 py-3 rounded-lg transition-colors">
						<span>Return to Home</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
