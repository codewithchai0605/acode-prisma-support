import plugin from "../plugin.json";
import { languageModes } from "./languages";
import { LanguageModeRegistry } from "./languages/registry";

class AcodePlugin {
	constructor() {
		this.registry = null;
	}

	async init() {
		const editorLanguages = acode.require("editorLanguages");
		if (!editorLanguages?.register || !editorLanguages?.unregister) {
			throw new Error(
				"This Acode version does not expose the CodeMirror language registration API.",
			);
		}

		this.registry = new LanguageModeRegistry(editorLanguages);
		this.registry.registerAll(languageModes);
	}

	async destroy() {
		this.registry?.unregisterAll();
		this.registry = null;
	}
}

if (window.acode) {
	const acodePlugin = new AcodePlugin();

	acode.setPluginInit(plugin.id, async (baseUrl, $page, context) => {
		acodePlugin.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
		await acodePlugin.init($page, context?.cacheFile, context?.cacheFileUrl);
	});

	acode.setPluginUnmount(plugin.id, () => acodePlugin.destroy());
}
