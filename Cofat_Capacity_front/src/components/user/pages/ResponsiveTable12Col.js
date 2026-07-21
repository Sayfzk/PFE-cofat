// ResponsiveTable12Col.js - Reusable responsive table component with dynamic columns
import React from 'react';
import './style/ResponsiveTable12Col.css';

/**
 * Reusable responsive table component with sticky headers and dynamic column support
 * 
 * @param {Object} props
 * @param {Array} props.yearHeaders - Array of year header objects: [{ year: '2025', colspan: 12 }]
 * @param {Array} props.monthHeaders - Array of month strings: ['MO 01', 'MO 02', ...]
 * @param {Array} props.rows - Array of row objects with structure:
 *   {
 *     type: 'category' | 'project' | 'total' | 'subtotal' | 'summary',
 *     category: string (for category rows),
 *     label: string,
 *     values: Array of values,
 *     rowspan: number (optional),
 *     showCategory: boolean (optional),
 *     colspan: number (optional, for merged cells)
 *   }
 * @param {string} props.categoryLabel - Label for category column header (e.g., 'Module RH', 'SPACE')
 * @param {string} props.projectLabel - Label for project column header (e.g., 'Projet', 'Project')
 */
const ResponsiveTable12Col = ({
    yearHeaders = [],
    monthHeaders = [],
    rows = [],
    categoryLabel = 'Category',
    projectLabel = 'Project'
}) => {

    // Log column count for debugging
    if (monthHeaders.length > 0) {
        console.log(`ResponsiveTable: Rendering ${monthHeaders.length} columns`);
    }

    const renderHeaderRow = () => (
        <tr>
            <th
                rowSpan={2}
                className="category-header"
            >
                {categoryLabel}
            </th>
            <th
                rowSpan={2}
                className="project-header"
            >
                {projectLabel}
            </th>
            {yearHeaders.map((yearHeader, idx) => (
                <th
                    key={`year-${yearHeader.year}-${idx}`}
                    colSpan={yearHeader.colspan}
                    className={`year-header year-header-${yearHeader.year}`}
                >
                    {yearHeader.year}
                </th>
            ))}
        </tr>
    );

    const renderMonthHeaderRow = () => (
        <tr>
            {monthHeaders.map((month, idx) => (
                <th
                    key={`month-${month}-${idx}`}
                    className="month-header"
                >
                    {month}
                </th>
            ))}
        </tr>
    );

    const getCategoryClassName = (category) => {
        if (!category) return 'category-cell';

        const categoryLower = category.toLowerCase();
        if (categoryLower === 's-total') return 'category-cell-s-total';
        if (categoryLower === 'total plant') return 'category-cell-total-plant';
        if (categoryLower === 't-direct') return 'category-cell-t-direct';
        if (categoryLower.includes('direct')) return 'category-cell-direct';
        if (categoryLower.includes('assembly')) return 'category-cell-assembly';
        if (categoryLower.includes('indirect')) return 'category-cell-indirect';
        if (categoryLower.includes('space')) return 'category-cell-space';

        return 'category-cell';
    };

    const getRowClassName = (row) => {
        if (row.type === 'total') return 'total-row';
        if (row.type === 'subtotal') return 'subtotal-row';
        if (row.type === 'summary') return 'summary-row';
        return '';
    };

    const formatValue = (value, label) => {
        // Handle percentage values for Occupation
        if (label && label.includes('Occupation')) {
            if (typeof value === 'number') {
                return value < 1 && value > 0
                    ? `${Math.round(value * 100)}%`
                    : `${Math.round(value)}%`;
            }
            return value;
        }

        // Handle Available Space - display in m²
        if (label && label.includes('Available Space')) {
            if (typeof value === 'number') {
                return `${Math.round(value)} m²`;
            }
            return value;
        }

        // Handle regular numeric values
        if (typeof value === 'number') {
            return Math.round(value) || 0;
        }

        return value || 0;
    };

    const getValueClassName = (value) => {
        if (value === 0 || value === '0') return 'value-cell value-cell-zero';
        if (typeof value === 'string' && value.includes('%')) return 'value-cell value-cell-percentage';
        if (typeof value === 'number' && value > 0) return 'value-cell value-cell-positive';
        return 'value-cell';
    };

    const renderRow = (row, rowIndex) => {
        const rowClassName = getRowClassName(row);
        const isProjectRow = row.type === 'project';
        const isMergedRow = row.colspan && row.colspan > 1;

        return (
            <tr key={`row-${rowIndex}`} className={rowClassName}>
                {/* Category Cell */}
                {row.showCategory && (
                    <td
                        rowSpan={row.rowspan || 1}
                        className={getCategoryClassName(row.category)}
                    >
                        {row.category}
                    </td>
                )}

                {/* Label/Project Cell */}
                {isMergedRow ? (
                    <td
                        colSpan={row.colspan}
                        className={`label-cell ${row.type === 'total' || row.type === 'subtotal' ? '' : ''}`}
                    >
                        {row.label}
                    </td>
                ) : (
                    <td
                        className={`label-cell ${isProjectRow ? 'label-cell-project' : ''}`}
                    >
                        {row.label}
                    </td>
                )}

                {/* Value Cells */}
                {!isMergedRow && row.values && row.values.map((value, valueIndex) => (
                    <td
                        key={`value-${rowIndex}-${valueIndex}`}
                        className={getValueClassName(value)}
                    >
                        {formatValue(value, row.label)}
                    </td>
                ))}
            </tr>
        );
    };

    return (
        <div className="responsive-table-container">
            <table className="responsive-table-12col">
                <thead>
                    {renderHeaderRow()}
                    {renderMonthHeaderRow()}
                </thead>
                <tbody>
                    {rows.map((row, index) => renderRow(row, index))}
                </tbody>
            </table>
        </div>
    );
};

export default ResponsiveTable12Col;
