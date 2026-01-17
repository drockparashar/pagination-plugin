import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PageBreakComponent } from '@/components/tiptap-extension/page-break-component';

export interface PageBreakOptions {
    /**
     * HTML attributes to add to the page break element
     */
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageBreak: {
            /**
             * Insert a page break at the current position
             */
            setPageBreak: () => ReturnType;
            /**
             * Remove all page breaks from the document
             */
            removeAllPageBreaks: () => ReturnType;
        };
    }
}

/**
 * Page Break Extension
 * Inserts visual page breaks that work with PDF export
 */
export const PageBreak = Node.create<PageBreakOptions>({
    name: 'pageBreak',

    group: 'block',

    atom: true, // Cannot be split or edited

    selectable: false, // Cannot be selected

    draggable: false, // Cannot be dragged

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            pageNumber: {
                default: 1,
                parseHTML: (element) => element.getAttribute('data-page-number'),
                renderHTML: (attributes) => {
                    return {
                        'data-page-number': attributes.pageNumber,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-page-break]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-page-break': '',
                class: 'page-break',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageBreakComponent);
    },

    addCommands() {
        return {
            setPageBreak:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                        });
                    },

            removeAllPageBreaks:
                () =>
                    ({ tr, state }) => {
                        const { doc } = state;
                        const pageBreaks: { pos: number; size: number }[] = [];

                        // Find all page breaks
                        doc.descendants((node, pos) => {
                            if (node.type.name === this.name) {
                                pageBreaks.push({ pos, size: node.nodeSize });
                            }
                        });

                        // Remove from end to start to maintain positions
                        pageBreaks.reverse().forEach(({ pos, size }) => {
                            tr.delete(pos, pos + size);
                        });

                        return true;
                    },
        };
    },

    addKeyboardShortcuts() {
        return {
            // Prevent Enter key from creating page breaks accidentally
            Enter: () => {
                return false; // Let default behavior handle it
            },
        };
    },
});

export default PageBreak;
