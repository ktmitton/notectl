import { DocumentDelta, InsertOp } from "./Delta";

const idGenerator = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;

const convertAlignmentFromDelta = (value: unknown) => {
	switch (value) {
		case undefined: return undefined;
		case 'right': return 'end';
		case 'center': return 'center';
		case 'justify': return 'justify';
		default: return 'start';
	}
}

const colorCache: Record<string, string> = {};

const convertColor = (color?: string) => {
	if (!color) return color;

	if (!colorCache[color]) {
		const element = document.createElement('div');
		element.style.color = color;

		document.body.appendChild(element);

		colorCache[color] = window.getComputedStyle(element).color;

		document.body.removeChild(element);
	}

	return colorCache[color];
}

const convertQuillFontSize = (size?: string) => {
	switch (size) {
		case 'small': return '.75em';
		case 'normal': return '1em';
		case 'large': return '1.5em';
		case 'huge': return '2.5em';
		default: return size;
	}
}

interface BoldMark { type: 'bold' };
interface ItalicMark { type: 'italic' };
interface StrikethroughMark { type: 'strikethrough' };
interface UnderlineMark { type: 'underline' };
interface HighlightMark { type: 'highlight', attrs: { color: string }}
interface TextColorMark { type: 'textColor', attrs: { color: string }}
interface SuperscriptMark { type: 'superscript' };
interface SubscriptMark { type: 'subscript' };
interface InlineCodeMark { type: 'code' };
interface FontMark { type: 'font', attrs: { family: string }};
interface LinkMark { type: 'link', attrs: { href: string }};
interface FontSizeMark { type: 'fontSize', attrs: { size: string }};

type Mark =
	BoldMark |
	ItalicMark |
	StrikethroughMark |
	UnderlineMark |
	HighlightMark |
	SuperscriptMark |
	SubscriptMark |
	FontMark |
	TextColorMark |
	InlineCodeMark |
	LinkMark |
	FontSizeMark;

interface Run {
	marks: Mark[];
};

interface Block {
	attrs: Record<string, string>;
	children: Run[];
};

export function parseToJson(delta: DocumentDelta) {
	const newlineBreakRegExp = /^\n+$/;

	const applyAttributes = (op: InsertOp, children: Block[]) => {
		const textDirection = op.attributes?.direction ?? 'ltr';
		const alignment = convertAlignmentFromDelta(op.attributes?.align);
		const highlight = convertColor(op.attributes?.background);
		const bold = op.attributes?.bold;
		const italic = op.attributes?.italic;
		const strikethrough = op.attributes?.strike;
		const underline = op.attributes?.underline;
		const script = op.attributes?.script;
		const font = op.attributes?.font;
		const textColor = convertColor(op.attributes?.color);
		const inlineCode = op.attributes?.code;
		const link = op.attributes?.link;
		const fontSize = convertQuillFontSize(op.attributes?.size);

		children.forEach(child => {
			child.attrs.dir = textDirection;

			if (alignment) child.attrs.align = alignment;

			child.children.forEach(x => {
				if (highlight) x.marks.push({ type: 'highlight', attrs: { color: highlight }});
				if (textColor) x.marks.push({ type: 'textColor', attrs: { color: textColor }});
				if (bold) x.marks.push({ type: 'bold' });
				if (italic) x.marks.push({ type: 'italic' });
				if (strikethrough) x.marks.push({ type: 'strikethrough' });
				if (underline) x.marks.push({ type: 'underline' });
				if (script === 'super') x.marks.push({ type: 'superscript' });
				if (script === 'sub') x.marks.push({ type: 'subscript' });
				if (font) x.marks.push({ type: 'font', attrs: { family: font }});
				if (fontSize) x.marks.push({ type: 'fontSize', attrs: { size: fontSize }});
				if (inlineCode) x.marks.push({ type: 'code' });
				if (link) x.marks.push({ type: 'link', attrs: { href: link }});
			});
		});
	};

	return {
		children: delta.ops.reduce((children, op, index) => {
			if (typeof op.insert !== 'string') {
			} else if (!newlineBreakRegExp.test(op.insert)) {
				children.push({
					id: idGenerator('block'),
					type: 'paragraph',
					children: [
						{
							type: 'text',
							text: op.insert,
							marks: [],
						}
					],
					attrs: {} as Record<string, unknown>,
				});

				applyAttributes(op, [children.at(-1)]);
			} else {
				const newlines = op.insert.split('\n').length - (index === 0 ? 1 : 2);

				for (let i = 0; i < newlines; ++i) {
					children.push({
						id: idGenerator('block'),
						type: 'paragraph',
						children: [
							{
								type: 'text',
								text: '',
								marks: [],
							}
						],
						attrs: {} as Record<string, unknown>,
					});
				}

				applyAttributes(op, children.slice(-(newlines + 1)));
			}

			return children;
		}, [] as any[])
	};
}
