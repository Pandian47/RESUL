import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { useCallback, useEffect, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { globalStateSelector } from 'Utils/Selectors/app';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionAccountDb } from 'Reducers/preferences/consumptions/request';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';

const DatabaseConsumption = () => {
    const dispatch = useDispatch();
    const { u_consumptionMM, u_consumptionYY } = useSelector((state) => globalStateSelector(state));
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [databaseConsumptionData, setDatabaseConsumptionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [gridColumns, setGridColumns] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    // Database consumption column configuration
    const getDatabaseConsumptionColumns = () => [
        {
            field: 'ds',
            title: 'Database',
            width: 250,
            filter: 'text',
            cell: ({ dataItem }) => (
                <td>
                    {dataItem?.ds?.length > 50 ? (
                        <RSTooltip text={dataItem?.ds} position="top" innerContent={false}>
                            <span className="m0">{truncateTitle(dataItem?.ds, 50)}</span>
                        </RSTooltip>
                    ) : (
                        <span className="m0">{dataItem?.ds}</span>
                    )}
                </td>
            ),
        },
        {
            field: 'gbSize',
            title: 'GB',
            width: 150,
            filter: 'numeric',
            cell: ({ dataItem, field }) => {
                return <td className="text-right">{numberWithCommas(dataItem?.[field] || 0)}</td>;
            },
        },
        {
            field: 'tbSize',
            title: 'TB',
            width: 150,
            filter: 'numeric',
            cell: ({ dataItem, field }) => {
                return <td className="text-right">{numberWithCommas(dataItem?.[field] || 0)}</td>;
            },
        },
    ];


    const handleFetchDatabaseConsumption = useCallback(async () => {
        setIsLoading(true);
        const payload = {
            clientId,
            userId,
            departmentId,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
        };

        try {
            const result = await dispatch(getConsumptionAccountDb(payload));
            const { status, data } = result || {};
            if (status && data) {
                setDatabaseConsumptionData(data);
                setTotalRecords(data.length);
                setGridColumns(getDatabaseConsumptionColumns());
            } else {
                setDatabaseConsumptionData([]);
                setTotalRecords(0);
                setGridColumns(getDatabaseConsumptionColumns());
            }
        } catch (error) {
            setDatabaseConsumptionData([]);
            setTotalRecords(0);
            setGridColumns(getDatabaseConsumptionColumns());
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, clientId, userId, departmentId, u_consumptionMM, u_consumptionYY]);

    useEffect(() => {
        handleFetchDatabaseConsumption();
    }, [handleFetchDatabaseConsumption]);

    // const handleDownloadCSV = async () => {
    //     const payload = {
    //         clientId,
    //         userId,
    //         departmentId,
    //         month: u_consumptionMM + 1,
    //         year: u_consumptionYY,
    //     };

    //     try {
    //         const result = await dispatch(getConsumptionAccountDb(payload));
    //         const { status, data } = result || {};
    //         if (status && data) {
    //             const filteredData = data.map((item) => ({
    //                 Month: item.cMonth || '',
    //                 Database: item.ds || '',
    //                 GB: item.gbSize || 0,
    //                 TB: item.tbSize || 0,
    //             }));

    //             const filename = `Database_Consumption_${MM_LIST[u_consumptionMM]}_${u_consumptionYY}`;
    //             downloadCSVcommasFile(filteredData, filename);
    //         }
    //     } catch (error) {
    //         console.log('Error downloading database consumption:', error);
    //     }
    // };

    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Consumptions"
                isBack
                backPath="/preferences/consumptions"
                rightCommonMenus
                isConsumption={true}
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <Row className="d-flex align-items-center mb10">
                    <Col md={5} className="d-flex align-items-center">
                        <h3 className="d-flex">Database consumption</h3>
                    </Col>
                </Row>

                <Row>
                    <KendoGrid
                        key={`database-consumption-${totalRecords}`}
                        data={databaseConsumptionData}
                        isLoading={isLoading}
                        isFailure={!isLoading && !databaseConsumptionData?.length}
                        settings={{ total: totalRecords }}
                        scrollable={'scrollable'}
                        pageable={true}
                        pagerChange={paginationParams?.initialPagination}
                        column={gridColumns}
                        autoResizeSize
                    />
                </Row>
            </Container>
            {/* Main page content block ends */}
        </div>
    );
};

export default DatabaseConsumption;
