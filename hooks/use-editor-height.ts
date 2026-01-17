import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

// A4 page height at 96 DPI
export const PAGE_HEIGHT = 1123;

export interface EditorHeightMetrics {
    /** Total content height in pixels */
    contentHeight: number;
    /** Number of pages based on PAGE_HEIGHT */
    pageCount: number;
    /** Whether content exceeds one page */
    isOverflowing: boolean;
    /** Amount of overflow in pixels */
    overflowAmount: number;
    /** Height of each individual node */
    nodeHeights: Array<{
        type: string;
        height: number;
        top: number;
        pos: number; // Position in document
    }>;
}

export interface PageBreakPosition {
    /** Page number that ends at this break */
    pageNumber: number;
    /** Pixel position where break should occur */
    position: number;
    /** Position in TipTap document to insert break */
    insertPos: number;
    /** Index of the node after which to insert break */
    afterNodeIndex: number;
}

/**
 * Calculate where page breaks should be inserted
 */
export function calculatePageBreaks(
    nodeHeights: EditorHeightMetrics['nodeHeights'],
    pageHeight: number = PAGE_HEIGHT
): PageBreakPosition[] {
    const breaks: PageBreakPosition[] = [];
    let currentPageEnd = pageHeight;
    let pageNumber = 1;

    nodeHeights.forEach((node, index) => {
        const nodeBottom = node.top + node.height;

        // Check if this node extends past the current page boundary
        if (nodeBottom > currentPageEnd) {
            // Insert break after previous node
            breaks.push({
                pageNumber,
                position: currentPageEnd,
                insertPos: node.pos, // Insert before this node
                afterNodeIndex: index - 1,
            });

            pageNumber++;
            currentPageEnd += pageHeight;

            // Handle nodes taller than a page
            while (nodeBottom > currentPageEnd) {
                breaks.push({
                    pageNumber,
                    position: currentPageEnd,
                    insertPos: node.pos + node.height,
                    afterNodeIndex: index,
                });
                pageNumber++;
                currentPageEnd += pageHeight;
            }
        }
    });

    return breaks;
}

/**
 * Global height manager for TipTap editor
 * Measures total content height in pixels and tracks pagination metrics
 */
export function useEditorHeight(editor: Editor | null): EditorHeightMetrics {
    const [metrics, setMetrics] = useState<EditorHeightMetrics>({
        contentHeight: 0,
        pageCount: 0,
        isOverflowing: false,
        overflowAmount: 0,
        nodeHeights: [],
    });

    useEffect(() => {
        if (!editor) return;

        const updateMetrics = () => {
            const editorDom = editor.view.dom as HTMLElement;
            const contentHeight = editorDom.scrollHeight;

            // Calculate pagination metrics
            const pageCount = Math.ceil(contentHeight / PAGE_HEIGHT);
            const isOverflowing = contentHeight > PAGE_HEIGHT;
            const overflowAmount = Math.max(0, contentHeight - PAGE_HEIGHT);

            // Get individual node heights
            const nodeHeights: EditorHeightMetrics['nodeHeights'] = [];
            let cumulativeHeight = 0;

            editor.state.doc.descendants((node, pos) => {
                if (node.isBlock && node.type.name !== 'pageBreak') {
                    const dom = editor.view.nodeDOM(pos);
                    if (dom instanceof HTMLElement) {
                        const height = dom.offsetHeight;
                        nodeHeights.push({
                            type: node.type.name,
                            height,
                            top: cumulativeHeight,
                            pos,
                        });
                        cumulativeHeight += height;
                    }
                }
            });

            setMetrics({
                contentHeight,
                pageCount,
                isOverflowing,
                overflowAmount,
                nodeHeights,
            });

            // Log metrics for debugging
            console.log('📏 Editor Height Metrics:', {
                contentHeight: `${contentHeight}px`,
                pageCount,
                isOverflowing,
                overflowAmount: `${overflowAmount}px`,
                nodeCount: nodeHeights.length,
            });
        };

        // Update on content change
        editor.on('update', updateMetrics);

        // Update on transaction (for real-time tracking)
        editor.on('transaction', updateMetrics);

        // Initial measurement
        // Use setTimeout to ensure DOM is fully rendered
        const timer = setTimeout(updateMetrics, 100);

        return () => {
            editor.off('update', updateMetrics);
            editor.off('transaction', updateMetrics);
            clearTimeout(timer);
        };
    }, [editor]);

    return metrics;
}
