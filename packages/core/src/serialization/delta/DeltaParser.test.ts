import { describe, expect, it, test } from 'vitest';
import { DocumentDelta } from './Delta';
import { parseToJson } from './DeltaParser';

describe('marks', () => {
	describe('bdi', () => {
		describe.for(['ltr', 'rtl', 'auto', undefined])('keeps the text direction %s', (value) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								direction: value,
							},
							insert: '\n',
						},
					],
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [],
								}
							],
							attrs: {
								dir: value ?? 'ltr',
							},
						},
					],
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});

			test('after text', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							insert: 'bdi',
						},
						{
							attributes: {
								direction: value,
							},
							insert: '\n',
						},
					],
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: 'bdi',
									marks: [],
								}
							],
							attrs: {
								dir: value ?? 'ltr',
							},
						},
					],
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});

			test('after text and empty paragraph', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							insert: 'bdi',
						},
						{
							attributes: {
								direction: value,
							},
							insert: '\n\n',
						},
					],
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: 'bdi',
									marks: [],
								}
							],
							attrs: {
								dir: value ?? 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [],
								}
							],
							attrs: {
								dir: value ?? 'ltr',
							},
						},
					],
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});
		});
	});
});

describe('blocks', () => {
	describe('alignment', () => {
		const conversions: Record<string, string> = {
			start: 'left',
			center: 'center',
			end: 'right',
			justify: 'justify',
		};

		describe.for(['start', 'center', 'end', 'justify'])('keeps the alignment %s', (value) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								align: conversions[value],
							},
							insert: '\n',
						},
					],
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [],
								}
							],
							attrs: {
								dir: 'ltr',
								align: value,
							},
						},
					],
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});

			test('after text', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							insert: 'alignment',
						},
						{
							attributes: {
								align: conversions[value],
							},
							insert: '\n',
						},
					]
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: 'alignment',
									marks: [],
								}
							],
							attrs: {
								dir: 'ltr',
								align: value,
							},
						}
					]
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});

			test('after text and empty paragraph', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							insert: 'alignment',
						},
						{
							attributes: {
								align: conversions[value],
							},
							insert: '\n\n',
						},
					]
				};
				const expectedJson = {
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: 'alignment',
									marks: [],
								}
							],
							attrs: {
								dir: 'ltr',
								align: value,
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [],
								}
							],
							attrs: {
								dir: 'ltr',
								align: value,
							},
						}
					]
				};

				// Act
				const actualJson = parseToJson(delta);
				actualJson.children.forEach(x => delete x.id);

				// Assert
				expect(actualJson).toEqual(expectedJson);
			});
		});
	});
});
