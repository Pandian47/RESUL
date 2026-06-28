import { getDateWithDaynoFormat, getYYMMDD, convertToUserTimezone } from 'Utils/modules/dateTime';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Row } from 'react-bootstrap';

import Card from '../Card';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import TemplateModal from '../Modal';

import { useFormContext } from 'react-hook-form';
import { INITIAL_GALLERY_CONFIG } from 'Components/RSPager/constant';
import useQueryParams from 'Hooks/useQueryParams';
import TemplateCategoryList from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/MyTemplates/templateCategories';
import TemplateGridViewCategories from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/MyTemplates/templateGridViewCategories';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import ManageCategoriesModal from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/Components/Modal';
import EmailBuiderCreatNewTemplates from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/CreatNewTemplates/CreateNewTemplate';
import { TemplateBlank1, TemplateBlank2, TemplateBlank3, TemplateBlank4 } from 'Assets/Images';
import RSModal from 'Components/RSModal';
import TemplateGallerySkeletonRow, {
  TEMPLATE_GALLERY_SKELETON_AI,
  TEMPLATE_GALLERY_SKELETON_WEB } from
'./TemplateGallerySkeletonRow';
const TemplateGridView = (type) => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState([]);
  const dispatch = useDispatch();
  const state = useQueryParams('/communication');
  const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

  // Helper functions for timezone-adjusted dates
  const getTimezoneAdjustedStartDate = () => {
    return convertToUserTimezone(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER), { formatAsString: false });
  };

    const getTimezoneAdjustedEndDate = () => {
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };
    // const [templateFlag, setTemplateFlag] = useState(false);
    const [templateFlag, setTemplateFlag] = useState({
        mode: null,
        show: false,
    });
    const [templateName, setTemplateName] = useState({ name: '', list: {} });
    const [isDuplicate, setIsDuplicate] = useState(false);
    // const [template, setTemplate] = useState([]);
    const template = useSelector(({ TemplateReducer }) => TemplateReducer?.templateCard);
    const isLoading = useSelector(({ TemplateReducer }) => TemplateReducer?.templateLoading);
    const [pagerPageConfig, setPagerPageConfig] = useState(INITIAL_GALLERY_CONFIG);
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [dates, setDates] = useState({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
        selectedDateText: 'Last 30 days',
    });
    const [manageCategoriesFlag, setManageCategoriesFlag] = useState(false);
    const [manageCategoriesSource, setManageCategoriesSource] = useState(null);
    const [isInnerModalOpen, setIsInnerModalOpen] = useState(false);

  // Reset pager/search state when switching between "All templates" and "My templates"
  // (payload pagination resets, but local pager config can still keep previous page/skip).
  useEffect(() => {
    setPagerPageConfig((pre) => ({
      ...pre,
      skip: 0,
      take: 4
    }));
    setIsCloseSearch(true);
  }, [type?.payload?.templatecategory, type?.payload?.userId]);

  useEffect(() => {
    if (isDuplicate) {
      setPagerPageConfig((pre) => ({
        ...pre,
        skip: 0,
        take: 4
      }));
      setDates({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
        selectedDateText: 'Last 30 days'
      });
      setIsCloseSearch(true);
      setIsDuplicate(false);
    }
  }, [isDuplicate]);
  const {
    getValues,
    setError,
    setFocus,
    formState: { errors }
  } = useFormContext();
  const subjectLineField = type?.isSplit && type?.fieldName ? `${type.fieldName}.subjectLine` : 'subjectLine';
  const audience = getValues('audience');
  const subjectLine = getValues(subjectLineField);
  const layoutPosition = getValues('layoutPosition');
  const deliveryType = getValues('deliveryType');
  const domain = getValues('domain');

  const handleDataExisit = (state) => {
    if ((!audience || audience?.length === 0) && state?.campaignType === 'S') {
      setError('audience', {
        type: 'custom',
        message: 'Selected audience bunch empty. Please add audience or select other bunch'
      });
      setFocus('audience');
      return;
    }
    // if ((!subjectLine || subjectLine.trim() === '') && type?.type !== 'Web' && type?.type !== 'Mobile') {
    //     setError(subjectLineField, {
    //         type: 'custom',
    //         message: 'Enter subject line',
    //     });
    //     setFocus(subjectLineField);
    //     return;
    // }
    if (
    (!layoutPosition || layoutPosition?.length === 0) && (
    type?.type === 'Web' || type?.type === 'Mobile') &&
    deliveryType?.id !== 4)
    {
      setError('layoutPosition', {
        type: 'custom',
        message: 'Select layout'
      });
      setFocus('layoutPosition');
      return;
    }
    if ((!domain || domain?.length === 0) && type?.type === 'Web') {
      setError('domain', {
        type: 'custom',
        message: 'Select domain'
      });
      setFocus('domain');
      return;
    }
    setTemplateFlag({
      show: true,
      mode: 'create'
    });
  };

  const handleSearch = (filterValue) => {
    type?.setPayload((pre) => ({
      ...pre,
      isFilter: true,
      filteration: {
        templateName: filterValue,
        startDate: pre?.filteration?.startDate,
        endDate: pre?.filteration?.endDate,
        templateCategoryId: pre?.filteration?.templateCategoryId
      },
      pagination: {
        pageNo: 1,
        recordLimit: 4
      }
    }));
    setPagerPageConfig((pre) => ({
      ...pre,
      skip: 0,
      take: 4
    }));
  };
  const handleDatePickerChange = ({ startDate, endDate }) => {
    type?.setPayload((pre) => ({
      ...pre,
      isFilter: true,
      filteration: {
        templateName: pre?.filteration?.templateName,
        startDate: getYYMMDD(startDate),
        endDate: getYYMMDD(endDate),
        templateCategoryId: pre?.filteration?.templateCategoryId
      },
      pagination: {
        pageNo: 1,
        recordLimit: 4
      }
    }));
    setPagerPageConfig((pre) => ({
      ...pre,
      skip: 0,
      take: 4
    }));
  };

  const handleTemplateClose = (status) => {
    // if (status) {
    //     navigate('/preferences/template-gallery/email-builder-page');
    // }
    // setTemplateFlag(false);
    setTemplateFlag({
      show: false,
      mode: 'close'
    });
    setIsInnerModalOpen(false);
  };

  // const galleryList = template?.templatelist || [];
  const galleryList =
  type?.type === 'Web' || type?.type === 'Mobile' ? template?.items || [] : template?.items || [];

  useEffect(() => {
    setPageState(galleryList);
  }, [template]);
  const [renderData, setRenderData] = useState({ data: pageState });
  const [searchDiv, setsearchDiv] = useState(false);

  const handleManageCategoriesClose = () => {
    setManageCategoriesFlag(false);
    if (manageCategoriesSource === 'template') {
      setTemplateFlag({
        show: true,
        mode: 'create'
      });
    }
    setManageCategoriesSource(null);
  };

  const categoriesFromList = () => {
    setManageCategoriesFlag(true);
    setManageCategoriesSource('list');
  };

  const categoriesFromTemplate = () => {
    setManageCategoriesFlag(true);
    setManageCategoriesSource('template');
  };

  return (
    <>
            <div className="flex-row justify-content-end my23 top-sub-heading">
                <ul className="rs-list-group-horizontal align-items-end">
                    {!searchDiv &&
          <li className="template-category-multidropdown communication">
                            <TemplateCategoryList
                                list={pageState}
                                setTemplateFlag={setTemplateFlag}
                                setTemplateName={setTemplateName}
                                categoryData={type?.categories}
                                categoriesLoading={type?.categoriesLoading}
                                userId={type?.userId}
                                from="communication"
                                setRenderData={setRenderData}
                                setPayload={type?.setPayload}
                                payload={type?.payload}
                                setPagerPageConfig={setPagerPageConfig}
                                setIsCloseSearch={setIsCloseSearch}
                                onManageCategoriesClick={categoriesFromList}
                            />
                        </li>
          }
                    <li className='template-catgory-datepicker'>
                        <RSDateRangePicker
              onDatePickerClosed={handleDatePickerChange}
              startDate={dates.startDate}
              endDate={dates.endDate}
              selectedDateText={dates.selectedDateText}
              isTemplate />
            
                    </li>
                    <li>
                        <RSSearchField
              searchedText={handleSearch}
              placeholder={'By template name'}
              isCloseSearch={isCloseSearch}
              setIsCloseSearch={setIsCloseSearch}
              setsearchDiv={setsearchDiv}
              isActiveClass="email-template" />
            
                    </li>

                    <li>
                        <RSTooltip position="top" text="Create new template" className="lh0">
                            <i
                onClick={() => {
                  handleDataExisit(state);
                }}
                className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                id="rs_data_circle_plus_fill_edge">
              </i>
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            {searchDiv &&
      <div className="template-category mb30">
                    <TemplateCategoryList
                        list={pageState}
                        setTemplateFlag={setTemplateFlag}
                        setTemplateName={setTemplateName}
                        categoryData={type?.categories}
                        categoriesLoading={type?.categoriesLoading}
                        userId={type?.userId}
                        from="communication"
                        setRenderData={setRenderData}
                        setPayload={type?.setPayload}
                        payload={type?.payload}
                        setPagerPageConfig={setPagerPageConfig}
                        setIsCloseSearch={setIsCloseSearch}
                        onManageCategoriesClick={categoriesFromList}
                    />
                </div>
      }
            <>
                {template ? (
                    <>
                        {type?.type === 'Web' || type?.type === 'Mobile' ? (
                            isLoading ? (
                                <TemplateGallerySkeletonRow
                                    isLoading={isLoading}
                                    {...TEMPLATE_GALLERY_SKELETON_WEB}
                                />
                            ) : template?.items?.length > 0 ? (
                                <Row>
                                    {template?.items?.map((list, index) => (
                                        <Card
                                            list={list}
                                            key={index}
                                            type={type}
                                            setTemplateFlag={setTemplateFlag}
                                            templateFlag={templateFlag}
                                            setTemplateName={setTemplateName}
                                            from={'communication'}
                                            setPayload={type?.setPayload}
                                            setPagerPageConfig={setPagerPageConfig}
                                            onSelect={(tId) => {
                                                type?.onSelect(tId);
                                            }}
                                        />
                                    ))}
                                </Row>
                            ) : (
                                 <TemplateGallerySkeletonRow
                                    isLoading={false}
                                    isNoDataAvailable = {true}
                                    {...TEMPLATE_GALLERY_SKELETON_AI}
                                />
                            )
                        ) : (
                            isLoading ? (
                                <TemplateGallerySkeletonRow
                                    isLoading={isLoading}
                                    {...TEMPLATE_GALLERY_SKELETON_AI}
                                />
                            ) :
                                template?.items?.length > 0 ? (
                                    <TemplateGridViewCategories
                                        data={{ data: template?.items }}
                                        setTemplateFlag={setTemplateFlag}
                                        setTemplateName={setTemplateName}
                                        categoryData={type?.categories}
                                        from="communication"
                                        type={type}
                                        setPayload={type?.setPayload}
                                        setPagerPageConfig={setPagerPageConfig}
                                        setIsCloseSearch={setIsCloseSearch}
                                        onSelect={type?.onSelect}
                                    />
                                ) : (
                                   <TemplateGallerySkeletonRow
                                    isLoading={false}
                                    isNoDataAvailable = {true}
                                    {...TEMPLATE_GALLERY_SKELETON_AI}
                                />
                                )
                        )}
                    </>
                ) : (
                    <TemplateGallerySkeletonRow
                        isLoading={isLoading}
                        count={4}
                        {...TEMPLATE_GALLERY_SKELETON_AI}
                    />
                )}
            </>
            {template?.totalRecords > 4 &&
      <Row>
                    <RSPager
          isGallery={true}
          data={template?.items}
          totalRow={template?.totalRecords}
          change={(data, skip, take) => {
            const size = skip === 0 ? 1 : skip / take + 1;
            setPageState(data);
            type?.setPayload((pre) => ({
              ...pre,
              pagination: {
                pageNo: size,
                recordLimit: take
              }
            }));
          }}
          config={pagerPageConfig} />
        
                </Row>
      }
            {templateFlag?.mode === 'create' ?
      <RSModal
        show={templateFlag?.show}
        size="lg"
        header="Create new template"
        channelId={type?.channelId}
        handleClose={() => handleTemplateClose()}
        className={`${isInnerModalOpen ? 'visually-hidden' : ''} email-template-grid-create`}
        body={
        <EmailBuiderCreatNewTemplates
          data={[
          { name: 'templateBlank1', src: TemplateBlank1 },
          { name: 'templateBlank2', src: TemplateBlank2 },
          { name: 'templateBlank3', src: TemplateBlank3 },
          { name: 'templateBlank4', src: TemplateBlank4 }]
          }
          channelId={type?.channelId}
          communication
          handleCategories={type?.handleCategories}
          onInnerModalStateChange={setIsInnerModalOpen}
          isAuthoring />

        } /> :


      <TemplateModal
        show={templateFlag}
        type={type?.type}
        channelId={type?.channelId}
        handleClose={(status) => handleTemplateClose(status)}
        templateName={templateName}
        setIsDuplicate={setIsDuplicate}
        onManageCategoriesClick={categoriesFromTemplate} />

      }
            <ManageCategoriesModal
        show={manageCategoriesFlag}
        handleClose={handleManageCategoriesClose}
        setCategoriesData={(data) => {
          if (type?.handleCategories) {
            type.handleCategories('All template');
          }
        }} />
      
        </>);

};

export default TemplateGridView;