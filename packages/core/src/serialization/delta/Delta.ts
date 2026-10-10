export interface AttributeMap {
	background?: string;
	align?: string;
	header?: number;
	bold?: boolean;
	italic?: boolean;
	strike?: boolean;
	underline?: boolean;
	direction?: string;
	font?: string;
	color?: string;
	code?: boolean;
	link?: string;
	size?: string;
	[key: string]: unknown;
}

export interface InsertOp {
	insert: string | Record<string, unknown>;
	attributes?: AttributeMap;
}

export interface DeleteOp {
	delete: number;
	attributes?: AttributeMap;
}

export interface RetainOp {
	retain: number | Record<string, unknown>;
	attributes?: AttributeMap;
}

export type Op = InsertOp | DeleteOp | RetainOp;

export interface Delta {
	ops: Op[];
}

export interface DocumentDelta {
  ops: InsertOp[];
}

export default Delta;
