import PropTypes from 'prop-types';
import { gridClass } from './config';

const GridToolbar = ({ children, onExportCsv, onExportExcel, onExportPdf, exportFormats }) => {
    const hasExport =
        exportFormats?.csv || exportFormats?.excel || exportFormats?.pdf;

    return (
        <div className={gridClass('toolbar')}>
            {children}
            {hasExport && (
                <div className={gridClass('toolbar-export')}>
                    {exportFormats.csv && (
                        <button
                            type="button"
                            className={`${gridClass('export-btn')} btn btn-link`}
                            onClick={onExportCsv}
                        >
                            CSV
                        </button>
                    )}
                    {exportFormats.excel && (
                        <button
                            type="button"
                            className={`${gridClass('export-btn')} btn btn-link`}
                            onClick={onExportExcel}
                        >
                            Excel
                        </button>
                    )}
                    {exportFormats.pdf && (
                        <button
                            type="button"
                            className={`${gridClass('export-btn')} btn btn-link`}
                            onClick={onExportPdf}
                        >
                            PDF
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

GridToolbar.propTypes = {
    children: PropTypes.node,
    onExportCsv: PropTypes.func,
    onExportExcel: PropTypes.func,
    onExportPdf: PropTypes.func,
    exportFormats: PropTypes.shape({
        csv: PropTypes.bool,
        excel: PropTypes.bool,
        pdf: PropTypes.bool,
    }),
};

export default GridToolbar;
