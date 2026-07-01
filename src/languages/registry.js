function normalizeName(name) {
	return String(name || "")
		.trim()
		.toLowerCase();
}

export class LanguageModeRegistry {
	constructor(editorLanguages) {
		this.editorLanguages = editorLanguages;
		this.registeredNames = [];
	}

	registerAll(modes) {
		for (const mode of modes) {
			this.register(mode);
		}
	}

	register(mode) {
		const name = normalizeName(mode?.name);
		if (!name || typeof mode?.load !== "function") {
			throw new TypeError("Invalid language mode descriptor.");
		}

		// Do not shadow a language that a future Acode release may bundle.
		if (this.editorLanguages.get?.(name)) {
			console.info(`[${name}] Language support is already available.`);
			return false;
		}

		const extensions = [...new Set(mode.extensions || [])];
		this.editorLanguages.register(
			name,
			extensions,
			mode.caption || name,
			mode.load,
		);
		this.registeredNames.push(name);
		return true;
	}

	unregisterAll() {
		for (const name of this.registeredNames.reverse()) {
			this.editorLanguages.unregister(name);
		}
		this.registeredNames = [];
	}
}
