import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export const PageBreakComponent = ({ node }: NodeViewProps) => {
    const pageNumber = node.attrs.pageNumber;

    return (
        <NodeViewWrapper className="page-break-wrapper">
            <div className="page-break" data-page-number={pageNumber}>
                <div className="page-break-line" />
                <div className="page-break-label">
                    Page {pageNumber} ends here • Page {pageNumber + 1} starts below
                </div>
            </div>
        </NodeViewWrapper>
    );
};
