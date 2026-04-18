import { App, PluginSettingTab, Setting } from 'obsidian'
import LanguageTaggerPlugin from './main'

export interface LanguageTaggerPluginSettings {
	mySetting: string
}

export const DEFAULT_SETTINGS: LanguageTaggerPluginSettings = {
	mySetting: 'default',
}

export class LanguageTaggerPluginSettingTab extends PluginSettingTab {
	plugin: LanguageTaggerPlugin

	constructor(app: App, plugin: LanguageTaggerPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc("It's a secret")
			.addText(text =>
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings.mySetting)
					.onChange(async value => {
						this.plugin.settings.mySetting = value
						await this.plugin.saveSettings()
					}),
			)
	}
}
