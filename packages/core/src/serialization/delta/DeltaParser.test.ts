// @vitest-environment jsdom

import { describe, expect, it, test } from 'vitest';
import { DocumentDelta } from './Delta';
import { parseToJson } from './DeltaParser';

const colors = [
	{ inputColor: 'blue', expectedColor: 'rgb(0, 0, 255)' },
	{ inputColor: '#0000FF', expectedColor: 'rgb(0, 0, 255)' },
	{ inputColor: '#0000FF00', expectedColor: 'rgba(0, 0, 255, 0)' },
	{ inputColor: 'rgb(0, 0, 255)', expectedColor: 'rgb(0, 0, 255)' },
	{ inputColor: 'rgba(0, 0, 255, 0.2)', expectedColor: 'rgba(0, 0, 255, 0.2)' },
	{ inputColor: undefined, expectedColor: undefined },
];

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

	describe('highlight', () => {
		describe.for(colors)('keeps the text highlight $inputColor', ({ inputColor, expectedColor }) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								background: inputColor,
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
									marks: expectedColor ? [
										{
											type: 'highlight',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: 'highlight',
						},
						{
							attributes: {
								background: inputColor,
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
									text: 'highlight',
									marks: expectedColor ? [
										{
											type: 'highlight',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: 'highlight',
						},
						{
							attributes: {
								background: inputColor,
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
									text: 'highlight',
									marks: expectedColor ? [
										{
											type: 'highlight',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: expectedColor ? [
										{
											type: 'highlight',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe.for(['bold', 'italic', 'strike', 'underline'])('%s', (format) => {
		const expectedType = format === 'strike' ? 'strikethrough' : format;

		describe.for([true, false])('%s', (isEnabled) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								[format]: isEnabled,
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
									marks: isEnabled ? [{ type: expectedType, }] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: format,
						},
						{
							attributes: {
								[format]: isEnabled,
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
									text: format,
									marks: isEnabled ? [{ type: expectedType, }] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: format,
						},
						{
							attributes: {
								[format]: isEnabled,
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
									text: format,
									marks: isEnabled ? [{ type: expectedType, }] : [],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: isEnabled ? [{ type: expectedType, }] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe.for(['superscript', 'subscript'])('%s', (script) => {
		const quillValue = script.replace('script', '');

		test('start of document', () => {
			// Arrange
			const delta: DocumentDelta = {
				ops: [
					{
						attributes: {
							script: quillValue,
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
								marks: [{ type: script }],
							}
						],
						attrs: {
							dir: 'ltr',
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
						insert: script,
					},
					{
						attributes: {
							script: quillValue,
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
								text: script,
								marks: [{ type: script }],
							}
						],
						attrs: {
							dir: 'ltr',
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
						insert: script,
					},
					{
						attributes: {
							script: quillValue,
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
								text: script,
								marks: [{ type: script }],
							}
						],
						attrs: {
							dir: 'ltr',
						},
					},
					{
						type: 'paragraph',
						children: [
							{
								type: 'text',
								text: '',
								marks: [{ type: script }],
							}
						],
						attrs: {
							dir: 'ltr',
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

	describe('font', () => {
		describe.for(['monospace', 'arial', undefined])('keeps the font %s', (font) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								font: font,
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
									marks: font ? [
										{
											type: 'font',
											attrs: {
												family: font
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
								font: font,
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
									marks: font ? [
										{
											type: 'font',
											attrs: {
												family: font
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
								font: font,
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
									marks: font ? [
										{
											type: 'font',
											attrs: {
												family: font
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: font ? [
										{
											type: 'font',
											attrs: {
												family: font
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe('text color', () => {
		describe.for(colors)('keeps the text color $inputColor', ({ inputColor, expectedColor }) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								color: inputColor,
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
									marks: expectedColor ? [
										{
											type: 'textColor',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: 'text color',
						},
						{
							attributes: {
								color: inputColor,
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
									text: 'text color',
									marks: expectedColor ? [
										{
											type: 'textColor',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: 'text color',
						},
						{
							attributes: {
								color: inputColor,
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
									text: 'text color',
									marks: expectedColor ? [
										{
											type: 'textColor',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: expectedColor ? [
										{
											type: 'textColor',
											attrs: {
												color: expectedColor
											}
										}
									] : [],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe('inline code', () => {
		describe.for(['console.log(\'Hello, world\')', 'console.log(\'Goodbye, world\')'])('keeps the inline code %s', (code) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								code: true,
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
									marks: [
										{
											type: 'code',
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: code,
						},
						{
							attributes: {
								code: true,
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
									text: code,
									marks: [
										{
											type: 'code',
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: code,
						},
						{
							attributes: {
								code: true,
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
									text: code,
									marks: [
										{
											type: 'code',
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [
										{
											type: 'code',
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe('link', () => {
		describe.for(['https://www.example.com', 'https://example.com'])('keeps the link %s', (link) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								link: link,
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
									marks: [
										{
											type: 'link',
											attrs: {
												href: link,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: link,
						},
						{
							attributes: {
								link: link,
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
									text: link,
									marks: [
										{
											type: 'link',
											attrs: {
												href: link,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: link,
						},
						{
							attributes: {
								link: link,
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
									text: link,
									marks: [
										{
											type: 'link',
											attrs: {
												href: link,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [
										{
											type: 'link',
											attrs: {
												href: link,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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

	describe('font size', () => {
		describe.for([
			{ fontClass: 'small', expectedSize: '.75em' },
			{ fontClass: 'normal', expectedSize: '1em' },
			{ fontClass: 'large', expectedSize: '1.5em' },
			{ fontClass: 'huge', expectedSize: '2.5em' },
		])('keeps font size class $fontClass as $expectedSize', ({ fontClass, expectedSize }) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								size: fontClass,
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
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: expectedSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: fontClass,
						},
						{
							attributes: {
								size: fontClass,
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
									text: fontClass,
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: expectedSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: fontClass,
						},
						{
							attributes: {
								size: fontClass,
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
									text: fontClass,
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: expectedSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: expectedSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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

		describe.for(['10px', '11px', '12px'])('keeps font size %s', (fontSize) => {
			test('start of document', () => {
				// Arrange
				const delta: DocumentDelta = {
					ops: [
						{
							attributes: {
								size: fontSize,
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
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: fontSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: fontSize,
						},
						{
							attributes: {
								size: fontSize,
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
									text: fontSize,
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: fontSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
							insert: fontSize,
						},
						{
							attributes: {
								size: fontSize,
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
									text: fontSize,
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: fontSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
							},
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									text: '',
									marks: [
										{
											type: 'fontSize',
											attrs: {
												size: fontSize,
											}
										}
									],
								}
							],
							attrs: {
								dir: 'ltr',
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
