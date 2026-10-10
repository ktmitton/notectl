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

export function parseToJson(delta: DocumentDelta) {
	const newlineBreakRegExp = /^\n+$/;

	const applyAttributes = (op: InsertOp, children: any[]) => {
		const textDirection = op.attributes?.direction ?? 'ltr';
		const alignment = convertAlignmentFromDelta(op.attributes?.align);

		children.forEach(child => {
			child.attrs.dir = textDirection;
			child.attrs.align = alignment;
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
