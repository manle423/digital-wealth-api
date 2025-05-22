import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Render a Handlebars template file with provided data.
 * Searches through multiple folders like 'email', 'notification', etc.
 * @param templateName The template file name (without the file extension)
 * @param data The data to be passed into the template
 * @param folderNames Optional, an array of folder names to search for the template
 * @returns The rendered HTML
 */
export function renderTemplate(templateName: string, data: any, folderNames: string[] = ['email', 'notification']): string {
	try {
		// Try to find the template in each folder
		for (const folderName of folderNames) {
			const templatePath = path.resolve(
				process.cwd(),
				'src/modules/task-queue/templates',
				folderName,
				'views',
				`${templateName}.template.hbs`
			);

			if (fs.existsSync(templatePath)) {
				// Register any custom helpers if needed
				Handlebars.registerHelper('eq', function (a, b) {
					return a === b;
				});

				const templateSource = fs.readFileSync(templatePath, 'utf-8');
				const template = Handlebars.compile(templateSource);
				return template(data);
			}
		}

		throw new Error(`Template ${templateName} not found in any of the folders: ${folderNames.join(', ')}`);
	} catch (error) {
		console.error(`Error rendering template "${templateName}":`, error);
		return `<p>Error rendering template: ${templateName}</p>`;
	}
}
