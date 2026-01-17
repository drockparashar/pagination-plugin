import { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { calculatePageBreaks, type EditorHeightMetrics } from './use-editor-height';

export interface PageBreakManagerOptions {
    /** Whether to automatically insert page breaks */
    autoInsert?: boolean;
    /** Debounce delay in ms before inserting breaks */
    debounceMs?: number;
}

/**
 * Manages automatic insertion and removal of page breaks
 */
export function usePageBreakManager(
    editor: Editor | null,
    heightMetrics: EditorHeightMetrics,
    options: PageBreakManagerOptions = {}
) {
    const { autoInsert = true, debounceMs = 500 } = options;
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastBreakCountRef = useRef(0);

    useEffect(() => {
        if (!editor || !autoInsert) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce page break insertion
        timeoutRef.current = setTimeout(() => {
            const breaks = calculatePageBreaks(heightMetrics.nodeHeights);

            // Get current page breaks in document
            const currentBreaks: number[] = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'pageBreak') {
                    currentBreaks.push(pos);
                }
            });

            // Only update if break count changed
            if (breaks.length !== lastBreakCountRef.current) {
                console.log('📄 Updating page breaks:', {
                    old: lastBreakCountRef.current,
                    new: breaks.length,
                    positions: breaks.map((b) => b.position),
                });

                // Remove all existing breaks
                editor.chain().focus().removeAllPageBreaks().run();

                // Insert new breaks
                breaks.forEach((breakPoint, index) => {
                    try {
                        editor
                            .chain()
                            .insertContentAt(breakPoint.insertPos, {
                                type: 'pageBreak',
                                attrs: {
                                    pageNumber: breakPoint.pageNumber,
                                },
                            })
                            .run();
                    } catch (error) {
                        console.error('Failed to insert page break:', error);
                    }
                });

                lastBreakCountRef.current = breaks.length;
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [editor, heightMetrics.nodeHeights, autoInsert, debounceMs]);

    return {
        /** Manually trigger page break recalculation */
        recalculate: () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Trigger immediate recalculation
            const breaks = calculatePageBreaks(heightMetrics.nodeHeights);
            editor?.chain().focus().removeAllPageBreaks().run();
            breaks.forEach((breakPoint) => {
                editor
                    ?.chain()
                    .insertContentAt(breakPoint.insertPos, {
                        type: 'pageBreak',
                        attrs: { pageNumber: breakPoint.pageNumber },
                    })
                    .run();
            });
        },
    };
}
