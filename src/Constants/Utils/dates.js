import moment from 'moment';

// Dates format (MMM DD, YYYY - Jan 15, 2016)

export const subtractDays_dddmmmddyyyy = (days, pattern = 'ddd, MMM DD, YYYY') =>
    moment().subtract(days, 'days').format(pattern);
export const addDays_dddmmmddyyyy = (days, pattern = 'ddd, MMM DD, YYYY') => moment().add(days, 'days').format(pattern);

export const mCurrentTime = moment().format('HH:mm');
export const mCurrentFulltime = moment().format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_01 = moment().subtract(6.12, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_02 = moment().subtract(11.54, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_03 = moment().subtract(18.57, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_04 = moment().subtract(22.25, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_05 = moment().subtract(29.68, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_06 = moment().subtract(32.24, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_07 = moment().subtract(36.26, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_08 = moment().subtract(43.33, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_09 = moment().subtract(45.09, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_10 = moment().subtract(54.09, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_11 = moment().subtract(154.09, 'days').add(4, 'hour').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_12 = moment()
    .subtract(354.09, 'days')
    .add(8, 'minutes')
    .format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_13 = moment()
    .subtract(554.09, 'days')
    .add(40, 'seconds')
    .format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_14 = moment()
    .subtract(654.09, 'days')
    .add(40, 'minutes')
    .format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubt_15 = moment()
    .subtract(1654.09, 'days')
    .add(40, 'minutes')
    .format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeSubtractHours_5 = moment().subtract(5.30, 'hour').format('ddd, MMM DD, YYYY HH:mm A');

export const getFullDateAndTime = (day) => {
    return moment().subtract(day, 'hour').format('ddd, MMM DD, YYYY HH:mm A');
}

export const mFulltimeAdd_01 = moment().add(6.12, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_02 = moment().add(11.54, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_03 = moment().add(18.57, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_04 = moment().add(22.25, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_05 = moment().add(29.68, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_06 = moment().add(32.24, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_07 = moment().add(36.26, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_08 = moment().add(43.33, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_09 = moment().add(45.09, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mFulltimeAdd_10 = moment().add(54.09, 'days').format('ddd, MMM DD, YYYY HH:mm:ss');
export const mCurrentDate = moment().format('ddd, MMM DD, YYYY');
export const mCurrentDateMonthYear = moment().format('MMM DD, YYYY');
export const mCurrentYear = moment().format('YYYY');
export const mCurrentMonthName = moment().format('MMMM');
export const mCurrentMonthValue = moment().format('M');
export const mYearSubt_01 = moment().subtract(1, 'years').format('YYYY');
export const mYearSubt_02 = moment().subtract(2, 'years').format('YYYY');
export const mYearSubt_03 = moment().subtract(3, 'years').format('YYYY');
export const mDateAdd_01 = moment().add(6, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_02 = moment().add(11, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_03 = moment().add(18, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_04 = moment().add(22, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_05 = moment().add(29, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_06 = moment().add(32, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_07 = moment().add(36, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_08 = moment().add(43, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_09 = moment().add(45, 'days').format('ddd, MMM DD, YYYY');
export const mDateAdd_10 = moment().add(49, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_0D = moment().subtract(0, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_01D = moment().subtract(1, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_02D = moment().subtract(2, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_06D = moment().subtract(6, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_12D = moment().subtract(12, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_18D = moment().subtract(18, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_01 = moment().subtract(22, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_02 = moment().subtract(30, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_03 = moment().subtract(42, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_04 = moment().subtract(52, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_05 = moment().subtract(75, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_06 = moment().subtract(83, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_07 = moment().subtract(96, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_08 = moment().subtract(113, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_09 = moment().subtract(104, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_10 = moment().subtract(144, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_11 = moment().subtract(154, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_12 = moment().subtract(164, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_13 = moment().subtract(184, 'days').format('ddd, MMM DD, YYYY');

export const mGridDateSubt_01 = moment().subtract(6, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_02 = moment().subtract(14, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_03 = moment().subtract(22, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_04 = moment().subtract(30, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_05 = moment().subtract(42, 'days').format('MMM DD, YYYY');

export const mDateSubt_01_Add1Month = moment(mDateSubt_01).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_02_Add1Month = moment(mDateSubt_02).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_03_Add1Month = moment(mDateSubt_03).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_04_Add1Month = moment(mDateSubt_04).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_05_Add1Month = moment(mDateSubt_05).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_06_Add1Month = moment(mDateSubt_06).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_07_Add1Month = moment(mDateSubt_07).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_08_Add1Month = moment(mDateSubt_08).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_09_Add1Month = moment(mDateSubt_09).add(15, 'days').format('ddd, MMM DD, YYYY');
export const mDateSubt_10_Add1Month = moment(mDateSubt_10).add(15, 'days').format('ddd, MMM DD, YYYY');

export const mGridDateSubt_01_Add1Month = moment(mGridDateSubt_01).add(15, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_02_Add1Month = moment(mGridDateSubt_02).add(15, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_03_Add1Month = moment(mGridDateSubt_03).add(15, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_04_Add1Month = moment(mGridDateSubt_04).add(15, 'days').format('MMM DD, YYYY');
export const mGridDateSubt_05_Add1Month = moment(mGridDateSubt_05).add(15, 'days').format('MMM DD, YYYY');

export const mCurrentDate1Month = moment(mCurrentDate).add(30, 'days').format('ddd, MMM DD, YYYY');
export const mCurrentDateTo10Days =
    moment().format('ddd, MMM DD, YYYY') + ' - ' + moment().add(10, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo10Days =
    moment().subtract(45, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(35, 'days').format('ddd, MMM DD, YYYY');
export const mCurrentDateTo1Month =
    moment().format('ddd, MMM DD, YYYY') + ' - ' + moment().add(30, 'days').format('ddd, MMM DD, YYYY');
export const mCurrentDateTo1Monthsubtract =
    moment().subtract(30, 'days').format('ddd, MMM DD, YYYY') + ' - ' + moment().format('ddd, MMM DD, YYYY');
export const mDateTo1Month =
    moment().subtract(43, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(14, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo1Month2 =
    moment().subtract(94, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(63, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo1Month3 =
    moment().subtract(118, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(89, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo1Month4 =
    moment().subtract(150, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(121, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo1Month5 =
    moment().subtract(175, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(146, 'days').format('ddd, MMM DD, YYYY');
export const mDateTo1Month6 =
    moment().subtract(200, 'days').format('ddd, MMM DD, YYYY') +
    ' - ' +
    moment().subtract(171, 'days').format('ddd, MMM DD, YYYY');
export const mCurrentMonthYear = moment().format('MMMM YYYY');
export const mMonthYearSubt_01 = moment().subtract(1, 'months').format('MMMM YYYY');
export const mMonthYearSubt_02 = moment().subtract(2, 'months').format('MMMM YYYY');
export const mMonthYearSubt_03 = moment().subtract(3, 'months').format('MMMM YYYY');
export const mMonthYearSubt_04 = moment().subtract(4, 'months').format('MMMM YYYY');
export const mMonthYearSubt_05 = moment().subtract(5, 'months').format('MMMM YYYY');
export const mMonthYearSubt_06 = moment().subtract(6, 'months').format('MMMM YYYY');
export const mMonthYearSubt_07 = moment().subtract(7, 'months').format('MMMM YYYY');
export const mMonthSubt_0 = moment().subtract(0, 'months').format('MMM');
export const mMonthSubt_01 = moment().subtract(1, 'months').format('MMM');
export const mMonthSubt_02 = moment().subtract(2, 'months').format('MMM');
export const mMonthSubt_03 = moment().subtract(3, 'months').format('MMM');
export const mMonthSubt_04 = moment().subtract(4, 'months').format('MMM');
export const mMonthSubt_05 = moment().subtract(5, 'months').format('MMM');
export const mMonthSubt_06 = moment().subtract(6, 'months').format('MMM');
export const mMonthSubt_07 = moment().subtract(7, 'months').format('MMM');
export const mMonthSubt_08 = moment().subtract(8, 'months').format('MMM');
export const date2hourstimepicker = moment().add(120, 'minutes').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime = moment().subtract(2.06, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime1 = moment().subtract(3.25, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime2 = moment().subtract(4.18, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime3 = moment().subtract(5.4, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime4 = moment().subtract(7.22, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime5 = moment().subtract(7.56, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime6 = moment().subtract(8.12, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime7 = moment().subtract(9.02, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime8 = moment().subtract(9.44, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime9 = moment().subtract(9.59, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTime10 = moment().subtract(10.39, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_01 = moment().add(3.25, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_02 = moment().add(4.18, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_03 = moment().add(5.4, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_04 = moment().add(7.22, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_05 = moment().add(7.56, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_06 = moment().add(8.12, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_07 = moment().add(9.02, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_08 = moment().add(9.44, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_09 = moment().add(9.59, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_10 = moment().add(10.39, 'days').format('ddd, MMM DD, YYYY hh:mm A');
export const mDateTimeAdd_11 = moment().add(11, 'days').format('ddd, MMM DD, YYYY');
export const mDateMDC4days = moment().add(4, 'days').format('MMM DD');
export const hello = moment().add(4, 'days').format('MMM DD');
export const mDateMDC4daysFull = moment().add(4, 'days').format('ddd, MMM DD, YYYY');
export const mDateMDC1subday = moment().subtract(1, 'day').format('MMM DD');
export const mDateMDC2subdays = moment().subtract(2, 'day').format('MMM DD');
export const mDateMDC3subdays = moment().subtract(3, 'day').format('MMM DD');
export const mDateMDC4subdays = moment().subtract(4, 'day').format('MMM DD');
export const mDateMDC5subdays = moment().subtract(5, 'day').format('MMM DD');
export const mDateMDC6subdays = moment().subtract(6, 'day').format('MMM DD');
export const mDateMDC7subdays = moment().subtract(7, 'day').format('MMM DD');
export const mDateMDC8subdays = moment().subtract(8, 'day').format('MMM DD');
export const mDateMDC9subdays = moment().subtract(9, 'day').format('MMM DD');
export const mDateMDC10subdays = moment().subtract(10, 'day').format('MMM DD');
export const mDateMDC11subdays = moment().subtract(11, 'day').format('MMM DD');
export const mDateMDC12subdays = moment().subtract(12, 'day').format('MMM DD');
export const mDateMDC13subdays = moment().subtract(13, 'day').format('MMM DD');
export const mDateMDC14subdays = moment().subtract(14, 'day').format('MMM DD');
export const mDateMDC15subdays = moment().subtract(15, 'day').format('MMM DD');
export const mDateMDC16subdays = moment().subtract(16, 'day').format('MMM DD');
export const mDateMDC17subdays = moment().subtract(17, 'day').format('MMM DD');
export const mDateMDC18subdays = moment().subtract(18, 'day').format('MMM DD');
export const mDateMDC19subdays = moment().subtract(19, 'day').format('MMM DD');
export const mDateMDC20subdays = moment().subtract(20, 'day').format('MMM DD');
export const mDateMDCToday = moment().add(0, 'day').format('MMM DD');
export const mDateMDC1day = moment().add(1, 'day').format('MMM DD');
export const mDateMDC2days = moment().add(2, 'day').format('MMM DD');
export const mDateMDC3days = moment().add(3, 'day').format('MMM DD');
export const mDateMDC5days = moment().add(5, 'day').format('MMM DD');
export const mDateMDC6days = moment().add(6, 'day').format('MMM DD');
export const mDateMDC7days = moment().add(7, 'day').format('MMM DD');
export const mDateMDC8days = moment().add(8, 'day').format('MMM DD');
export const mDateMDC9days = moment().add(9, 'day').format('MMM DD');
export const mDateMDC10days = moment().add(10, 'day').format('MMM DD');
export const mDateMDC11days = moment().add(11, 'day').format('MMM DD');
export const mDateMDC12days = moment().add(12, 'day').format('MMM DD');
export const mDateMDC13days = moment().add(13, 'day').format('MMM DD');
export const mDateMDC14days = moment().add(14, 'day').format('MMM DD');
export const mDateMDC15days = moment().add(15, 'day').format('MMM DD');
export const mDateMDC16days = moment().add(16, 'day').format('MMM DD');
export const mDateMDC17days = moment().add(17, 'day').format('MMM DD');
export const mDateMDC18days = moment().add(18, 'day').format('MMM DD');
export const mDateMDC19days = moment().add(19, 'day').format('MMM DD');
export const mDateMDC20days = moment().add(20, 'day').format('MMM DD');
export const mDateMDC21days = moment().add(21, 'day').format('MMM DD');
export const mDateMDC22days = moment().add(22, 'day').format('MMM DD');
export const mDateMDC23days = moment().add(23, 'day').format('MMM DD');
export const mDateMDC24days = moment().add(24, 'day').format('MMM DD');
export const mDateMDC25days = moment().add(25, 'day').format('MMM DD');
export const mDateMDC26days = moment().add(26, 'day').format('MMM DD');
export const mDateMDC27days = moment().add(27, 'day').format('MMM DD');
export const mDateMDC28days = moment().add(28, 'day').format('MMM DD');
export const mDateMDC29days = moment().add(29, 'day').format('MMM DD');
export const mDateMDC30days = moment().add(30, 'day').format('MMM DD');
export const mGridDateAdd_01 = moment().add(6, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_02 = moment().add(11, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_03 = moment().add(18, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_04 = moment().add(22, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_05 = moment().add(29, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_06 = moment().add(32, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_07 = moment().add(36, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_08 = moment().add(43, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_09 = moment().add(45, 'days').format('MMM DD, YYYY');
export const mGridDateAdd_10 = moment().add(49, 'days').format('MMM DD, YYYY');
export const mDateGRID1days = moment().add(1, 'day').format('MMM DD, YYYY');
export const mDateGRID2days = moment().add(2, 'day').format('MMM DD, YYYY');
export const mDateGRID3days = moment().add(3, 'day').format('MMM DD, YYYY');
export const mDateGRID4days = moment().add(4, 'day').format('MMM DD, YYYY');
export const mDateGRID5days = moment().add(5, 'day').format('MMM DD, YYYY');
export const mDateGRID6days = moment().add(6, 'day').format('MMM DD, YYYY');
export const mDateGRID7days = moment().add(7, 'day').format('MMM DD, YYYY');
export const mDateGRID8days = moment().add(8, 'day').format('MMM DD, YYYY');
export const mDateGRID9days = moment().add(9, 'day').format('MMM DD, YYYY');

export const mDatesubtractGRID1days = moment().subtract(1, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID2days = moment().subtract(2, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID3days = moment().subtract(3, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID4days = moment().subtract(4, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID5days = moment().subtract(5, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID6days = moment().subtract(6, 'day').format('MMM DD, YYYY');
export const mDatesubtractGRID7days = moment().subtract(7, 'day').format('MMM DD, YYYY');

export const mDateSubtDay_0 = moment().format('Do MMM');
export const mDateSubtDay_1 = moment().subtract(1, 'days').format('Do MMM');
export const mDateSubtDay_2 = moment().subtract(2, 'days').format('Do MMM');
export const mDateSubtDay_3 = moment().subtract(3, 'days').format('Do MMM');
export const mDateSubtDay_4 = moment().subtract(4, 'days').format('Do MMM');
export const mDateSubtDay_5 = moment().subtract(5, 'days').format('Do MMM');
export const mDateSubtDay_6 = moment().subtract(6, 'days').format('Do MMM');
export const mDateSubtDay_7 = moment().subtract(7, 'days').format('Do MMM');
export const mDateSubtDay_8 = moment().subtract(8, 'days').format('Do MMM');
export const mDateSubtDay_9 = moment().subtract(9, 'days').format('Do MMM');
export const mDateSubtDay_10 = moment().subtract(10, 'days').format('Do MMM');
export const mDateSubtDay_11 = moment().subtract(11, 'days').format('Do MMM');
export const mDateSubtDay_12 = moment().subtract(12, 'days').format('Do MMM');
export const mDateSubtDay_13 = moment().subtract(13, 'days').format('Do MMM');
export const mDateSubtDay_14 = moment().subtract(14, 'days').format('Do MMM');
export const mDateSubtDay_15 = moment().subtract(15, 'days').format('Do MMM');
export const mDateSubtDay_16 = moment().subtract(16, 'days').format('Do MMM');
export const mDateSubtDay_17 = moment().subtract(17, 'days').format('Do MMM');
export const mDateSubtDay_18 = moment().subtract(18, 'days').format('Do MMM');
export const mDateSubtDay_19 = moment().subtract(19, 'days').format('Do MMM');
export const mDateSubtDay_20 = moment().subtract(20, 'days').format('Do MMM');
export const mDateSubtDay_21 = moment().subtract(21, 'days').format('Do MMM');
export const mDateSubtDay_22 = moment().subtract(22, 'days').format('Do MMM');
export const mDateSubtDay_23 = moment().subtract(23, 'days').format('Do MMM');
export const mDateSubtDay_24 = moment().subtract(24, 'days').format('Do MMM');
export const mDateSubtDay_25 = moment().subtract(25, 'days').format('Do MMM');
export const mDateSubtDay_26 = moment().subtract(26, 'days').format('Do MMM');
export const mDateSubtDay_27 = moment().subtract(27, 'days').format('Do MMM');
export const mDateSubtDay_28 = moment().subtract(28, 'days').format('Do MMM');
export const mDateSubtDay_29 = moment().subtract(29, 'days').format('Do MMM');
export const mDateSubtDay_30 = moment().subtract(30, 'days').format('Do MMM');
export const mTimeWithdaysubt_0 = moment().subtract(17, 'day').format('Do MMM');
export const mTimeWithdaysubt_1 = moment().subtract(16, 'day').format('Do MMM');
export const mTimeWithdaysubt_2 = moment().subtract(15, 'day').format('Do MMM');
export const mTimeWithdaysubt_3 = moment().subtract(14, 'day').format('Do MMM');
export const mTimeWithdaysubt_4 = moment().subtract(13, 'day').format('Do MMM');
export const mTimeWithdaysubt_5 = moment().subtract(12, 'day').format('Do MMM');
export const mTimeWithdaysubt_6 = moment().subtract(11, 'day').format('Do MMM');
export const mTimeWithdaysubt_7 = moment().subtract(10, 'day').format('Do MMM');
export const mTimeWithdaysubt_8 = moment().subtract(9, 'day').format('Do MMM');
export const mTimeWithdaysubt_9 = moment().subtract(8, 'day').format('Do MMM');
export const mTimeWithdaysubt_10 = moment().subtract(7, 'day').format('Do MMM');
export const mTimeWithdaysubt_11 = moment().subtract(6, 'day').format('Do MMM');
export const mTimeWithdaysubt_12 = moment().subtract(5, 'day').format('Do MMM');
export const mTimeWithdaysubt_13 = moment().subtract(4, 'day').format('Do MMM');
export const mTimeWithdaysubt_14 = moment().subtract(3, 'day').format('Do MMM');
export const mTimeWithdaysubt_15 = moment().subtract(2, 'day').format('Do MMM');
export const mTimeWithdaysubt_16 = moment().subtract(1, 'day').format('Do MMM');
export const mTimeWithdaysubt_17 = moment().subtract(0, 'day').format('Do MMM');

export const timeForCommunicationAnalysis = [
    mTimeWithdaysubt_0,
    mTimeWithdaysubt_1,
    mTimeWithdaysubt_2,
    mTimeWithdaysubt_3,
    mTimeWithdaysubt_4,
    mTimeWithdaysubt_5,
    mTimeWithdaysubt_6,
    mTimeWithdaysubt_7,
    mTimeWithdaysubt_8,
    mTimeWithdaysubt_9,
    mTimeWithdaysubt_10,
    mTimeWithdaysubt_11,
    mTimeWithdaysubt_12,
    mTimeWithdaysubt_13,
    mTimeWithdaysubt_14,
    mTimeWithdaysubt_15,
    mTimeWithdaysubt_16,
    // mTimeWithdaysubt_17,
];

export const timeForBar = [
    mTimeWithdaysubt_0,
    mTimeWithdaysubt_1,
    mTimeWithdaysubt_2,
    mTimeWithdaysubt_3,
    mTimeWithdaysubt_4,
    mTimeWithdaysubt_5,
    mTimeWithdaysubt_6,
    mTimeWithdaysubt_7,
    mTimeWithdaysubt_13,
    mTimeWithdaysubt_14,
    mTimeWithdaysubt_15,
    mTimeWithdaysubt_16,
    mTimeWithdaysubt_17,
];

export const reachPerformance = [
    mDateTime1,
    mDateTime2,
    mDateTime3,
    mDateTime4,
    mDateTime5,
    mDateTime6,
];

export const engagementPerformance = [
    mDateTime1,
    mDateTime2,
    mDateTime3,
    mDateTime4,
    mDateTime5,
    mDateTime6,
    mDateTime7,
];

export const datesPrev30Days = [
    mDateSubtDay_29,
    mDateSubtDay_28,
    mDateSubtDay_27,
    mDateSubtDay_26,
    mDateSubtDay_25,
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev29Days = [
    mDateSubtDay_28,
    mDateSubtDay_27,
    mDateSubtDay_26,
    mDateSubtDay_25,
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev28Days = [
    mDateSubtDay_27,
    mDateSubtDay_26,
    mDateSubtDay_25,
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev27Days = [
    mDateSubtDay_26,
    mDateSubtDay_25,
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev26Days = [
    mDateSubtDay_25,
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev25Days = [
    mDateSubtDay_24,
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev24Days = [
    mDateSubtDay_23,
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev23Days = [
    mDateSubtDay_22,
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev22Days = [
    mDateSubtDay_21,
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev21Days = [
    mDateSubtDay_20,
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev20Days = [
    mDateSubtDay_19,
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev19Days = [
    mDateSubtDay_18,
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev18Days = [
    mDateSubtDay_17,
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev17Days = [
    mDateSubtDay_16,
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev16Days = [
    mDateSubtDay_15,
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev15Days = [
    mDateSubtDay_14,
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev14Days = [
    mDateSubtDay_13,
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev13Days = [
    mDateSubtDay_12,
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev12Days = [
    mDateSubtDay_11,
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev11Days = [
    mDateSubtDay_10,
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev10Days = [
    mDateSubtDay_9,
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev9Days = [
    mDateSubtDay_8,
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev8Days = [
    mDateSubtDay_7,
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev7Days = [
    mDateSubtDay_6,
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev6DaysSmartLink = [
    mDateSubtDay_30,
    mDateSubtDay_24,
    mDateSubtDay_18,
    mDateSubtDay_12,
    mDateSubtDay_6,
    mDateSubtDay_0,
];
export const datesPrev6Days = [
    mDateSubtDay_5,
    mDateSubtDay_4,
    mDateSubtDay_3,
    mDateSubtDay_2,
    mDateSubtDay_1,
    mDateSubtDay_0,
];
export const datesPrev5Days = [mDateSubtDay_4, mDateSubtDay_3, mDateSubtDay_2, mDateSubtDay_1, mDateSubtDay_0];
export const datesPrev4Days = [mDateSubtDay_3, mDateSubtDay_2, mDateSubtDay_1, mDateSubtDay_0];
export const datesPrev3Days = [mDateSubtDay_2, mDateSubtDay_1, mDateSubtDay_0];
export const datesPrev2Days = [mDateSubtDay_1, mDateSubtDay_0];
export const datesPrev1Day = [mDateSubtDay_0];
