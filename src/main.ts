import { getFrontMatterInfo, Notice, Plugin } from 'obsidian'
import {
	DEFAULT_SETTINGS,
	LanguageTaggerPluginSettings,
	LanguageTaggerPluginSettingTab,
} from './settings'

const koRegex = /[ㄱ-ㅎ가-힣]/

export default class LanguageTaggerPlugin extends Plugin {
	settings: LanguageTaggerPluginSettings

	async updateLanguageTags() {
		const list = this.app.vault.getMarkdownFiles()

		for (const tfile of list) {
			// filter out non-top level notes
			if (!tfile.parent?.isRoot()) continue

			const rawContent = await this.app.vault.read(tfile)

			const cache = this.app.metadataCache.getFileCache(tfile)

			let content = rawContent

			// check if frontmatter actually exists in this file
			if (cache && cache.frontmatter) {
				// The 'offset' is the exact character count where the frontmatter
				// (including the closing '---') finishes.
				// prettier-ignore
				const endOffset = (cache.frontmatterPosition?.end.offset ?? (getFrontMatterInfo(content).contentStart - 1) + 1)

				// slice the string from the end of the frontmatter onwards
				content = rawContent.substring(endOffset).trimStart()
			}

			if (koRegex.test(content) || koRegex.test(tfile.basename)) {
				this.app.fileManager.processFrontMatter(tfile, frontmatter => {
					frontmatter['lang'] = 'ko'
				})
			} else {
				this.app.fileManager.processFrontMatter(tfile, frontmatter => {
					frontmatter['lang'] = 'en'
				})
			}
		}

		new Notice('Language has tags has been applied.')
	}

	async onload() {
		await this.loadSettings()

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'update-language-tags',
			name: 'Update language tags',
			callback: () => {
				this.updateLanguageTags()
			},
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LanguageTaggerPluginSettingTab(this.app, this))

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(
				() => {
					this.updateLanguageTags()
				},
				5 * 60 * 1000,
			),
		)
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<LanguageTaggerPluginSettings>,
		)
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
